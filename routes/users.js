const express = require('express');
const router = express.Router();
const check = require("../utils/check");
const token = require("../utils/token");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Redis = require("ioredis");
const RedisConfig = require('../config/redis');
const MysqlConfig = require('../config/mysql');
const UserModel = require("../models/User");
const mongoose = require('mongoose');
const FriendModel = require('../models/Friend');
const redis = new Redis(RedisConfig.loginSystem);

// 连接数据库
const sequelize = new Sequelize(
    MysqlConfig.db,
    MysqlConfig.user,
    MysqlConfig.password,
    {
        host: MysqlConfig.host,
        dialect: 'mysql',
    }
);

//定义返回模型
const back = function (errcode, message, data) {
    let model = {
        errcode,
        message,
    }
    data ? model.data = data : "";
    return model
}

//定义模型
const User = sequelize.define("user", UserModel);
const m_friend = mongoose.model('chatroom', FriendModel);
// sequelize.sync();
sequelize.authenticate().then(() => {
    console.log('数据库连接成功');
})

//路由拦截
// router.all("/*", (req, res, next) => {
//     let { query, body } = req;
//     console.log(req.url)
//     if (req.url === "/login" || req.url === "/register") {
//         next()
//     } else {
//         token.verify(query.token, (err, decode) => {
//             if (err) {
//                 switch (err.message) {
//                     case "jwt malformed":
//                         res.json({
//                             code: 210,
//                             message: "错误的token"
//                         })
//                         break
//                     case "jwt expired":
//                         res.json({
//                             code: 211,
//                             message: "token过期"
//                         })
//                         break
//                     default:
//                         res.json({
//                             code: 212,
//                             message: err.message
//                         })
//                 }
//             } else {
//                 let user_name = query.user_name || body.user_name;
//                 if (decode.user_name == user_name) {
//                     next()
//                 } else {
//                     res.json({
//                         code: 11,
//                         message: "非法登陆"
//                     })
//                 }
//             }
//         })
//     }
// })

//用户登录
router.post("/login", (req, res, next) => {
    let { body } = req;
    let { result, paramsName } = check.empty(body, ["user_name", "user_password"])
    if (!result) {
        res.json(new back(1, '参数' + paramsName + "不能为空"));
    } else {
        User.findAll({
            where: {
                user_name: body.user_name
            }
        }).then(user => {
            if (user.length == 0 || user[0].user_password != body.user_password) {
                res.json(back(2, "用户名或者密码错误"));
            } else {
                //登录成功后的逻辑处理
                let tempToken = token.create({ user_name: body.user_name });
                redis.set(body.user_name, tempToken);
                res.json(back(0, "登录成功", { token: tempToken, user_ava: user[0].user_ava }));
            }
        })
    }
})

//注册
router.post("/register", (req, res, nest) => {
    let { body } = req;
    let { result, paramsName } = check.empty(body, ["user_name", "user_password"])
    if (!result) {
        res.json(back(2, '参数' + paramsName + "不能为空"))
    } else {
        User.findAll({
            where: {
                user_name: body.user_name
            }
        }).then(user => {
            if (user.length == 0) {
                User.create({
                    user_name: body.user_name,
                    user_password: body.user_password
                }).then(() => {
                    res.json(back(0, "注册成功"))
                })
            } else {
                res.json(back(1, "用户已存在"))
            }
        })
    }
})

//检查登录
router.get("/checkLogin", (req, res, next) => {
    let { query } = req;
    token.verify(query.token, (err, decode) => {
        if (err) {
            switch (err.message) {
                case "jwt malformed":
                    res.json(back(1, "错误的token"))
                    break
                case "jwt expired":
                    res.json(back(2, "错误的token"))
                    break
                default:
                    res.json(back(3, err.message))
            }
        } else {
            redis.get(decode.user_name, (err, redis_token) => {
                console.log(redis_token, query.token)
                if (redis_token == query.token) {
                    User.findOne({
                        where: {
                            user_name: decode.user_name
                        }
                    }).then(info => {
                        res.json(back(0, "已登录", info))
                    })
                } else {
                    res.json(back(4, "登录过期或在其他地方登录"))
                }
            });
        }
    })
})

//设置用户头像
router.post('/setUserAva', (req, res) => {
    let { body } = req;
    User.update({
        user_ava: body.url
    }, {
        where: {
            user_name: body.user_name
        }
    }).then(result => {
        res.json(back(0, "成功", null))
    }).catch(err => {
        console.log(err)
        res.json(back(50, "未知失败原因", null))
    })
})

//查询好友列表
router.get('/friendList', (req, res) => {
    let { query } = req;
    User.findOne({
        where: {
            user_name: query.user_name
        }
    }).then(user => {
        let id = user.id;
        return User.findAll({
            where: {
                user_friend: {
                    [Op.like]: `%${id}%,`
                }
            }
        })
    }).then(list => {
        res.json(back(0, "成功", { user_friends: list }))
    })
})

/**
 * 添加好友
 * @param  token - 标识令牌
 */
router.post('/addFriend', (req, res) => {
    let { body } = req;
    let user_name1, user_name2;
    let user1,user2;
    token.verify(body.token, (err, decode) => {
        if (!err) {
            user_name1 = decode.from.user_name;
            user_name2 = decode.to;
            User.findOne({
                where: {
                    user_name: user_name1
                }
            }).then(result => {
                if (result) {
                    user1 = result;
                } else {
                    res.json(back(1, "未查询到该用户"))
                }
                return User.findOne({
                    where:{
                        user_name: user_name2
                    }
                })
            }).then(user => {
                if (user) {
                    user2 = user;
                    // 事务 ： 必须两边都改变关系
                    return sequelize.transaction(() => {
                        return User.update({
                            user_friend: user1.user_friend + user2.id + ','
                        }, {
                            where: {
                                user_name: user_name1
                            }
                        }).then(() => {
                            return User.update({
                                user_friend: user2.user_friend + user1.id + ','
                            }, {
                                where: {
                                    user_name: user_name2
                                }
                            })
                        })
                    })
                } else {
                    res.json(back(2, "未查询到添加用户"))
                }
            }).then(() => {
                res.json(back(0, "添加成功", {}))
            }).catch((err) => {
                console.log(err)
                res.json(back(3, "添加失败,请重试", {}))
            })
        }
    })
})

/**
 * 删除好友
 * user_name
 * friend_name
 */
router.post('/deleteFriend', (req, res) => {
    let { body } = req;
    let friend_info, user_info;
    sequelize.transaction(() => {
        return User.findOne({
            where: {
                user_name: body.friend_name
            }
        })
            .then(friendInfo => {
                console.log(friendInfo)
                friend_info = friendInfo;
                return User.findOne({
                    where: {
                        user_name: body.user_name
                    }
                })
            })
            .then(userInfo => {
                user_info = userInfo;
                let friend_array = userInfo.user_friend.split(",");
                let index_temp = friend_array.findIndex(item => item == friend_info.id);
                console.log(index_temp)
                friend_array.splice(index_temp, 1);
                friend_string = friend_array.join() + ",";
                return User.update({
                    user_friend: friend_string
                }, {
                    where: {
                        user_name: body.user_name
                    }
                })
            })
            .then(() => {
                let friend_array = friend_info.user_friend.split(",");
                let index_temp = friend_array.findIndex(item => item == user_info.id);
                friend_array.splice(index_temp, 1);
                friend_string = friend_array.join();
                return User.update({
                    user_friend: friend_string
                }, {
                    where: {
                        user_name: body.friend_name
                    }
                })
            })
            .then(() => {
                res.json(back(0, "删除成功", null))
            })
            .catch(err => {
                console.log(err)
                res.json(back(50, "未知失败原因", null))
            })
    })
})

router.get("/test", (req, res, next) => {

})
module.exports = router;
