"use strict";

module.exports = function(sequelize, DataTypes) {
    var Room = sequelize.define("Room", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        type: DataTypes.STRING,
        rent_type: DataTypes.STRING,
        price_hour: DataTypes.DOUBLE,
        price_day: DataTypes.DOUBLE,
        price_month: DataTypes.DOUBLE,
        title: DataTypes.STRING,
        address: DataTypes.STRING,
        gps_latitude: DataTypes.DOUBLE,
        gps_longitude: DataTypes.DOUBLE,
        people_count: DataTypes.INTEGER,
        wash_room: DataTypes.INTEGER,
        bed_room: DataTypes.INTEGER,
        bed_count: DataTypes.INTEGER,
        checkin: DataTypes.INTEGER,
        checkout: DataTypes.INTEGER
    }, {
        classMethods: {
            associate: function(models) {
                Room.belongsTo(models.User, {as: 'owner'});
                Room.belongsTo(models.Picture, {as: 'headimg'});
                Room.belongsToMany(models.Picture, {through: 'RoomPicture', timestamps: false});
                Room.belongsToMany(models.User, {through: 'RoomFavor'});
                Room.belongsToMany(models.Lock, {through: 'RoomLock'});
            }
        }
    });

    return Room;
};
