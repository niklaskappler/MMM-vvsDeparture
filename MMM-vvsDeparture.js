/**
 * Created by niklaskappler on 28.04.16.
 */


Module.register("MMM-vvsDeparture",{

    defaults:{
        station_id: 5002201,
        station_name: 'Libanonstraße',
        maximumEntries: 6,
        reloadInterval:  1 * 60 * 1000, // every minute
    },

    // Define required scripts.
    getStyles: function() {
        return ["MMM-vvsDeparture.css"];
    },

    // Define required scripts.
    getScripts: function() {
        return ["moment.js"];
    },

    //Overrides start function
    start: function () {
        var self = this;

        Log.log("Starting module: " + this.name);
        this.departure = [];
        self.sendSocketNotification("GET_DEPARTURES", {"config": this.config});
    },

    // Override socket notification handler.
    socketNotificationReceived: function(notification, payload) {
        if (notification === "NEW_DEPARTURE") {
            this.departure = payload;
            this.updateDom();
        }
    },

    // Override dom generator
    getDom: function () {
        var that = this;

        var wrapper = document.createElement("div");
        var tableWrapper = document.createElement("table");
        tableWrapper.className = "departure";
        var headerWrappper = document.createElement("header");
        headerWrappper.innerHTML ="Directions from: " + this.config.station_name;
        wrapper.appendChild(headerWrappper);

        for(var e in that.departure){
            if(e >= this.config.maximumEntries){
                wrapper.appendChild(tableWrapper);
                return wrapper;
            }
            var trWrapper = document.createElement("tr");

            var clockWrapper = document.createElement("td");
            clockWrapper.className = "time";

            var hour = that.departure[e].departureTime.hour;
            var min =  that.departure[e].departureTime.minute;
            clockWrapper.innerHTML = moment(hour+":"+min, "HH:mm").subtract(that.departure[e].delay, "m").format("HH:mm");

            var delayWrapper = document.createElement("td");
            if(that.departure[e].delay != 0){
                delayWrapper.className = "delay";
            }else {
                delayWrapper.className = "nodelay";
            }
            delayWrapper.innerHTML = " +"+that.departure[e].delay;

            var laneWrapper = document.createElement("td");
            laneWrapper.className = "number";
            laneWrapper.innerHTML = that.departure[e].number;

            var directionWrapper = document.createElement("td");
            directionWrapper.className = "direction";
            directionWrapper.innerHTML = that.departure[e].direction;

            trWrapper.appendChild(clockWrapper);
            trWrapper.appendChild(delayWrapper);
            trWrapper.appendChild(laneWrapper);
            trWrapper.appendChild(directionWrapper);
            trWrapper.className = "small dimmed";
            tableWrapper.appendChild(trWrapper);

        }

        wrapper.appendChild(tableWrapper);
        return wrapper;
    }
});