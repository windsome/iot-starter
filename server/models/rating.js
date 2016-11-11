"use strict";

module.exports = function(sequelize, DataTypes) {
    var Rating = sequelize.define("Rating", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        accuracy: DataTypes.INTEGER,
        communication: DataTypes.INTEGER,
        cleanliness: DataTypes.INTEGER,
        location: DataTypes.INTEGER,
        checkin: DataTypes.INTEGER,
        value: DataTypes.INTEGER
    }, {
        classMethods: {
            associate: function(models) {
                Rating.belongsTo(models.Booking);
                Rating.belongsTo(models.User);
            }
        }
    });

    return Rating;
};
