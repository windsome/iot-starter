"use strict";

module.exports = function(sequelize, DataTypes) {
    var Booking = sequelize.define("Booking", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        start_time: DataTypes.BIGINT,
        end_time: DataTypes.BIGINT,
        status: DataTypes.STRING,
        total: DataTypes.DOUBLE
    }, {
        classMethods: {
            associate: function(models) {
                Booking.belongsTo(models.User);
                Booking.belongsTo(models.Room);
                Booking.belongsTo(models.Payment);
            }
        }
    });

    return Booking;
};
