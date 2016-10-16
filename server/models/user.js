"use strict";

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("User", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        openid: DataTypes.STRING,
        info: DataTypes.TEXT
    }, {
        timestamps: false,
        classMethods: {
            associate: function(models) {
                //User.hasMany(models.Lock);
                User.belongsToMany(models.Lock, {through: 'UserLock', timestamps: false});
            }
        }
    });

    return User;
};
