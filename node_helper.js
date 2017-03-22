/**
 * Created by niklaskappler on 01.05.16.
 */


var NodeHelper = require("node_helper");
var request = require('request');

module.exports = NodeHelper.create({
    //Override Start Function
    start: function() {
        var self = this;
        self.update();
        console.log("Starting node helper for: " + self.name);

    },

    // Override socketNotificationReceived method.
    socketNotificationReceived: function(notification, payload) {
        var that = this;
        that.update(payload.config.station_id);

        if (notification === "GET_DEPARTURES") {
            setInterval(function() {
                that.update(payload.config.station_id);
            }, payload.config.reloadInterval); //perform every 1000 milliseconds.
        }
    },

    update: function (station_id) {
        var that = this;
        var url = "https://efa-api.asw.io/api/v1/station/"+station_id+"/departures/";
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                that.sendSocketNotification("NEW_DEPARTURE", JSON.parse(body));
            }
        });
    },
});



