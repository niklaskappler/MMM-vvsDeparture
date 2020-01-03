/* global Module */

/* Magic Mirror
 * Module: MMM-vvsDeparture
 *
 * By niklaskappler
 * MIT Licensed.
 */
var NodeHelper = require("node_helper");
var request = require("request");

const BASE_URL = "https://www3.vvs.de/mngvvs/XML_DM_REQUEST?";

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
			self.retrieveStationData(
				payload.config.station_id,
				payload.identifier);
			setInterval(function () {
					self.retrieveStationData(
						payload.config.station_id,
						payload.identifier);
				}, payload.config.reloadInterval);
		}
	},

	retrieveStationData: function (stationId, moduleIdentifier) {
		var self = this;
		var url = BASE_URL +
			`limit=40&`+
			`mode=direct&`+
			`name_dm=${stationId}&`+
			`outputFormat=rapidJSON&`+ //`outputFormat=JSON&`
			`type_dm=any&`+
			`useRealtime=1`;

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
		request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				self.sendSocketNotification(moduleIdentifier+"_NEW_DEPARTURES", JSON.parse(body));
			}
		});
	}
});
