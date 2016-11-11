"use strict";

module.exports = function(sequelize, DataTypes) {
    var Payment = sequelize.define("Payment", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        amount: DataTypes.DOUBLE,
        status: DataTypes.STRING,
        finish_time: DataTypes.BIGINT
    }, {
        classMethods: {
            associate: function(models) {
                Payment.belongsTo(models.User);
            }
        }
    });

    return Payment;
};
