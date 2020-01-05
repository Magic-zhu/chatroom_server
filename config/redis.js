module.exports = {
    //登录系统
    loginSystem: {
        port: 6379, // Redis port
        host: "47.105.210.34", // Redis host
        password:'foobared$123',
        db: 0
    },
    //离线消息系统
    offLineMessages: {
        port: 6379, // Redis port
        host: "47.105.210.34", // Redis host
        password:'foobared$123',
        db: 1
    },
    //添加好友系统
    friendSystem: {
        port: 6379, // Redis port
        host: "47.105.210.34", // Redis host
        password:'foobared$123',
        db: 2
    },
};