const Sequelize = require('sequelize');
module.exports ={
    user_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    user_password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    user_friend: {
        type: Sequelize.STRING,
        defaultValue: "",
    },
    user_state: {
        type: Sequelize.INTEGER,
    },
    user_brand: {
        type: Sequelize.STRING
    },
    user_ava: {
        type: Sequelize.STRING
    },
    user_point: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    user_nickname: {
        type: Sequelize.STRING
    },
}