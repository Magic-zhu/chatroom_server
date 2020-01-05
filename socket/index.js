const Redis = require("ioredis");
const conifg = require("../config/redis");
const redis_system = new Redis(conifg.offLineMessages);
const redis_friend = new Redis(conifg.friendSystem);
const Token = require("../utils/token");
function getNowDate() {
    let date = new Date();
    return date.getFullYear() + "-"
        + (date.getMonth() + 1) + "-"
        + date.getDate() + " "
        + date.getHours() + ":"
        + date.getMinutes() + ":"
        + date.getSeconds();
}

/**
 * 发送的消息类
 * @param {*} user - 名字
 * @param {*} message - 消息内容
 * @param {*} ava - 头像地址
 * @param {*} type - 消息种类
 */
function Message(user, message, ava, type) {
    let now = getNowDate();
    /**
     * type 种类
     *  0 - 系统消息
     *  1 - 广播文字消息
     *  2 - 点对点聊天消息
     */
    return {
        user: user,
        ava: ava,
        message: message,
        type: type,
        time: now
    }
}

/**
 * 系统任务
 * @param type
 * @param others
 * @return {{type: *, from: (*|string), to: (*|string)}}
 */
function Task(type, others) {
    return {
        type,
        from: others.from || "",
        to: others.to || "",
        time: getNowDate(),
        token:others.token||'',
    }
}

module.exports = function Mysocket(server) {
    const io = require('socket.io')(server);
    io.set('transports', ['websocket', 'xhr-polling', 'jsonp-polling', 'htmlfile', 'flashsocket']);
    io.set('origins', '*:*');
    var userIO = {};
    io.on('connect', function (socket) {
        //广播消息
        socket.on('say', (data) => {
            //广播给其他用户
            socket.broadcast.emit('sayback', new Message(data.user, data.message, data.user_ava, data.type));
            //转给自己
            socket.emit('self', new Message(data.user, data.message, data.user_ava, data.type));
        })
        //点对点聊天
        socket.on('chat', (data) => {
            console.log('点对点聊天消息', data);
            //转给自己
            socket.emit('chatBackSelf', new Message(data.user, data.message, data.user_ava, data.type))
            //发给对方
            if (userIO[data.to]) {  //对方在线
                userIO[data.to].emit('chatBack', new Message(data.user, data.message, data.user_ava, data.type))
            } else { //对方不在线 
                redis_system.lpush(data.to, JSON.stringify(new Message(data.user, data.message, data.user_ava, data.type)))
            }
        })
        //登录后保存socket 状态为在线
        socket.on('newUser', (data) => {
            userIO[data.user] = socket;
            redis_friend.lrange(data.user, 0, -1).then(friend_requests => {
                if (friend_requests) {
                    friend_requests.map((item) => {
                        socket.emit('firendRequests', item);
                    })
                }
            });
            redis_system.lrange(data.user, 0, -1).then(res => {
                if (res) {
                    let temp = [];
                    res.map((data) => {
                        temp.push(new Message(data.user, data.message, data.user_ava, data.type));
                    })
                    socket.emit('offLineMessages', res);
                }
            });
        })
        //添加某人为好友
        socket.on('addFriendTo', (data) => {
            let { from, to } = data;
            data.token = Token.create({from,to},-1);
            //如果对方在线
            if (userIO[to]) {
                userIO[to].emit("addFriendFrom", new Task('addFriend', data))
            } else { //如果对方不在线
                redis_friend.lpush(to, JSON.stringify(new Task('addFriend', data)))
            }
        })
        //返回客户端处理 好友添加的情况
        socket.on('handleFirendRequests', data => {
            redis_friend.lpop(data.user)
        })
        //返回客户端处理 接收到了离线消息
        socket.on('offLineMessagesReceived', data => {
            redis_system.ltrim(data.user, 1, 0)
        })
    });
}