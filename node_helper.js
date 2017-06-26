/* global Module */

/* Magic Mirror
 * Module: MMM-vvsDeparture
 *
 * By niklaskappler
 * MIT Licensed.
 */
var NodeHelper = require("node_helper");
var request = require("request");

const BASE_URL = "https://efa-api.asw.io/api/v1";

module.exports = NodeHelper.create({
	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
	socketNotificationReceived: function (notification, payload) {
		var self = this;

		if (notification === "GET_DEPARTURES") {
			self.updateStation(payload.config.station_id);

			setInterval(function () { self.updateStation(payload.config.station_id); }, payload.config.reloadInterval);
		}
	},

	updateStation: function (stationId) {
		var self = this;
		var url = BASE_URL + "/station/" + stationId + "/departures/";
		request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				self.sendSocketNotification("NEW_DEPARTURE", JSON.parse(body));
			}
		});
	}
});