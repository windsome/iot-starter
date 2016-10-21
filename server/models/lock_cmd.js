"use strict";

module.exports = function(sequelize, DataTypes) {
    var LockCmd = sequelize.define("LockCmd", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        cmd: DataTypes.TEXT,
        ack: DataTypes.TEXT
    }, {
        timestamps: false,
        classMethods: {
            associate: function(models) {
                /*Lock.belongsTo(models.User, {
                    onDelete: "CASCADE",
                    foreignKey: 'owner'
                });
                Lock.belongsToMany(models.User, {through: 'UserLock', timestamps: false});*/
            }
        }
    });

    return LockCmd;
};
