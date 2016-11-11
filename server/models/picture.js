"use strict";

module.exports = function(sequelize, DataTypes) {
    var Picture = sequelize.define("Picture", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        path: DataTypes.STRING,
        name: DataTypes.STRING,
        desc: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                //Picture.hasMany(models.Lock);
            }
        }
    });

    return Picture;
};
