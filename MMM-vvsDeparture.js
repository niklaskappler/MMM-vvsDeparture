/* global Module */

/* Magic Mirror
 * Module: MMM-vvsDeparture
 *
 * By niklaskappler
 * MIT Licensed.
 */
Module.register("MMM-vvsDeparture", {

	defaults: {
		station_id: 'de:08111:6112',
		station_name: "",
		maximumEntries: 6,
		reloadInterval: 1 * 60 * 1000, // every minute
		colorDelay: true,
		colorNoDelay: true,
		number: undefined,
		direction: undefined
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	// Define required scripts.
	getStyles: function () {
		return ["MMM-vvsDeparture.css"];
	},

	// Define required scripts.
	getScripts: function () {
		return ["moment.js"];
	},

	// Load translations files
	getTranslations: function() {
		return {
			en: "translations/en.json",
			de: "translations/de.json"
		};
	},

	// Overrides start function.
	start: function () {
		var self = this;
		Log.log("Starting module: " + self.name);

		self.departure = [];
		self.sendSocketNotification("GET_DEPARTURES", { "config": self.config });
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		var self = this;

		if (notification === "NEW_DEPARTURE") {
			self.departure = payload.stopEvents;
			self.station_name = self.config.station_name ? self.config.station_name : payload.locations[0].disassembledName;
			Log.info(payload.stopEvents);
			self.updateDom();
		}
	},

	// Override dom generator.
	getDom: function () {
		var self = this;

		var wrapper = document.createElement("div");

		var headerWrappper = document.createElement("header");
		headerWrappper.innerHTML = self.translate("DIRECTIONS_FROM")  + self.station_name;
		wrapper.appendChild(headerWrappper);

		var tableWrapper = document.createElement("table");
		tableWrapper.className = "departure";

		var added = 0;
		for (var i in self.departure) {

			Log.warn(self.departure[i]);
			// If the maximum number of entries is reached
			// stop adding and attach table
			if (added >= self.config.maximumEntries) {
				wrapper.appendChild(tableWrapper);
				return wrapper;
			}

			var currentValue = self.departure[i];

			// Skip if the configuration should hide this
			if(!self.showNumber(currentValue.transportation.number) || !self.showDirection(currentValue.transportation.destination.name)) {
				continue;
			}

			// Row
			var trWrapper = document.createElement("tr");

			// Clock
			var clockWrapper = document.createElement("td");
			clockWrapper.className = "time";

			var date = new Date(currentValue.departureTimePlanned);
			clockWrapper.innerHTML = moment(date.getHours() + ":" + date.getMinutes(), "HH:mm")
				.subtract(currentValue.delay, "m")
				.format("HH:mm");
			trWrapper.appendChild(clockWrapper);

			// Delay
			var delayWrapper = document.createElement("td");
			if("isRealtimeControlled" in currentValue && currentValue.isRealtimeControlled == true){
				var delay = this.calculateDelay(currentValue.departureTimePlanned, currentValue.departureTimeEstimated);
			}
			if (delay.getMinutes() != 0) {
				delayWrapper.className = "delay";
				if (self.config.colorDelay) {
					delayWrapper.className += " color";
				}
			} else {
				delayWrapper.className = "nodelay";
				if (self.config.colorNoDelay) {
					delayWrapper.className += " color";
				}
			}
			delayWrapper.innerHTML = "+" + delay.getMinutes();
			trWrapper.appendChild(delayWrapper);

			// Lane
			var laneWrapper = document.createElement("td");
			laneWrapper.className = "number";
			laneWrapper.innerHTML = currentValue.transportation.number;
			trWrapper.appendChild(laneWrapper);

			// Direction
			var directionWrapper = document.createElement("td");
			directionWrapper.className = "direction";
			directionWrapper.innerHTML = currentValue.transportation.destination.name;
			trWrapper.appendChild(directionWrapper);

			trWrapper.className = "small dimmed";
			tableWrapper.appendChild(trWrapper);
			added++;
		}

		wrapper.appendChild(tableWrapper);
		return wrapper;
	},

	calculateDelay(departureTimePlanned, departureTimeEstimated){
		timePlanned = new Date(departureTimePlanned);
		timeEstimated = new Date(departureTimeEstimated);
		var timeDiff = new Date(timeEstimated.getTime() - timePlanned.getTime());
		return timeDiff
	},

	showNumber : function(number) {
		var self = this;
		return self.isValue(number, self.config.number);
	},

	showDirection : function(direction) {
		var self = this;
		return self.isValue(direction, self.config.direction);
	},

	isValue : function(input, value) {
		if(!value || !input) {
			return true;
		} else if(value instanceof Array) {
			return value.indexOf(input) >= 0;
		} else if (typeof value === "string" || value instanceof String) {
			return value === input;
		} else if(typeof value === "function" || value instanceof Function) {
			return value(input);
		}
		return false;
	}

});