"use strict";

module.exports = function(sequelize, DataTypes) {
    var WechatUser = sequelize.define("WechatUser", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        openid: DataTypes.STRING,
        subscribe: DataTypes.INTEGER,
        nickname: DataTypes.STRING,
        sex: DataTypes.INTEGER,
        language: DataTypes.STRING,
        city: DataTypes.STRING,
        province: DataTypes.STRING,
        country: DataTypes.STRING,
        headimgurl: DataTypes.STRING,
        subscribe_time: DataTypes.BIGINT,
        unionid: DataTypes.STRING,
        remark: DataTypes.STRING,
        groupid: DataTypes.INTEGER,
        tagid_list: DataTypes.TEXT
    }, {
        classMethods: {
            associate: function(models) {
                //User.hasMany(models.Lock);
                WechatUser.belongsTo(models.User);
            }
        }
    });

    return WechatUser;
};
