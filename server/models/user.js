"use strict";

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("User", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        password: DataTypes.STRING,
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        telephone: DataTypes.STRING,
        cardid: DataTypes.STRING,
        addr: DataTypes.STRING,
        desc: DataTypes.STRING,
        avatar: DataTypes.STRING,
        openid: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                //User.hasMany(models.Lock);
                //User.belongsToMany(models.Lock, {through: 'UserLock', timestamps: false});
            }
        }
    });

    return User;
};
