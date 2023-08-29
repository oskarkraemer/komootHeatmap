//Calculates the speed between two latLngs
function getSpeed(latLng, prevLatLng) {
    var speed = latLng.distanceTo(prevLatLng); // meters
    speed /= (latLng.time - prevLatLng.time) / 1000; // m/s
    speed *= 3.6; // km/h
    return speed;
}

//Gets upper average speed
function getSpeedMax(allRoutes) {
    // get the average upper 1/16 of all speeds
    var speeds = [];
    for (var i = 0; i < allRoutes.length; i++) {
        var points = allRoutes[i];
        for (var j = 0; j < points.length - 1; j++) {
            var speed = getSpeed(points[j+1], points[j]);
            speeds.push(speed);
        }
    }

    // sort the speeds ascending
    speeds.sort(function(a, b) {
        return a - b;
    });

    // get average
    var sum = 0;
    var count = 0;
    for (var i = Math.floor(speeds.length * 0.94); i < speeds.length; i++) {
        sum += speeds[i];
        count++;
    }

    return Math.round(sum / count);
}

//Gets max elapsed time
function getElapsedMax(allRoutes) {
    var times = [];

    for(var i = 0; i < allRoutes.length; i++) {
        var points = allRoutes[i];

        var time = points[points.length - 1].time - points[0].time;
        time /= 1000; // ms to s

        times.push(time);
    }

    // sort the times ascending
    times.sort(function(a, b) {
        return a - b;
    });

    //return median of upper 1/6 (1-(0,16 / 2))
    return Math.round(times[Math.floor(times.length * 0.94)]);
}

//Gets euqal distribution
function equalDistribution(start, end, midpoints) {
    if (midpoints <= 0) {
        return [];
    }

    const range = end - start;
    const interval = range / (midpoints + 1);

    const result = [];
    for (let i = 1; i <= midpoints; i++) {
        result.push(Math.round(start + i * interval));
    }

    return result;
}

//Load gpx files
function loadGPX(callback) {
    //Get tours id list
    var tours_id = [];

    var request = new XMLHttpRequest();
    request.open('GET', './tours_list', false);
    request.send(null);

    if (request.status === 200) {
        tours_id = JSON.parse(request.responseText);
        console.log(tours_id);
    } else {
        console.log('Error: ' + request.status);
        window.location.replace("./login");
    }

    //set progress bar max to tours length
    document.getElementById("gpx_progress").max = tours_id.length;

    //query the tours data
    var tours = [];

    for (var i = 0; i < tours_id.length; i++) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                tours.push(this.responseText);
            }
        };

        request.open('GET', './tour/' + tours_id[i], true);
        request.send(null);
    }

    //wait for all requests to finish
    var interval = setInterval(function() {
        document.getElementById("gpx_progress").value = tours.length;

        if(tours.length == tours_id.length) {
            document.getElementById("progress_box").style.display = "none";

            clearInterval(interval);
            callback(tours);
        }
    }, 100);
}

// create map
var polylines = [];

var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {id: 'OSM', attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'}),
    satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {id: 'satellite', attribution: 'Tiles &copy; Esri &mdash; Source: Esri, [...] and the GIS User Community'});

var map = L.map('map', {preferCanvas: true}).setView([51.16, 10.44], 6);
osm.addTo(map);

//create sidebar
var sidebar = L.control.sidebar({
    autopan: false,
    closeButton: true,
    container: 'sidebar',
    position: 'left',
}).addTo(map);

var speedMax = 0;
var elapsedMax = 0;

var allRoutes = [];

var speeds = [];

var viz_counter = 0;

//Visualizer class
class Visualizer {

    static options = {
            "heatmap": {
                unit: "",
                thresholds: [0],
                optionIdxFn: function(latLng, prevLatLng) {
                    return 0;
                },
                options: [
                    {color: '#FF0000'}
                ]
            },
            "speed": {
                unit: "km/h",
                thresholds: [],
                optionIdxFn: function(latLng, prevLatLng, index) {
                    var i, speed,
                        speedThresholds = Visualizer.options["speed"].thresholds;

                    speed = speeds[viz_counter][index];

                    for (i = 0; i < speedThresholds.length; ++i) {
                        if (speed <= speedThresholds[i]) {
                            return i;
                        }
                    }
                    return speedThresholds.length;
                },
                options: [
                    {color: '#0000FF'}, {color: '#0040FF'}, {color: '#0080FF'},
                    {color: '#00FFB0'}, {color: '#00E000'}, {color: '#80FF00'},
                    {color: '#FFFF00'}, {color: '#FFC000'}, {color: '#FF0000'}
                ]
            },

            "incline": {
                unit: "%",
                thresholds: [0, 2, 4, 6, 8, 10, 12, 14, 16],
                optionIdxFn: function(latLng, prevLatLng) {
                    var i, incline,
                        inclineThresholds = Visualizer.options["incline"].thresholds;

                    incline = (latLng.alt - prevLatLng.alt) / latLng.distanceTo(prevLatLng) * 100;
                    incline = Math.abs(incline);

                    for (i = 0; i < inclineThresholds.length; ++i) {
                        if (incline <= inclineThresholds[i]) {
                            return i;
                        }
                    }
                    return inclineThresholds.length;
                },
                options: [
                    {color: '#0000FF'}, {color: '#0040FF'}, {color: '#0080FF'},
                    {color: '#00FFB0'}, {color: '#00E000'}, {color: '#80FF00'},
                    {color: '#FFFF00'}, {color: '#FFC000'}, {color: '#FF0000'}
                ]
            },

            "elapsed": {
                unit: "h",
                thresholds: [],
                optionIdxFn: function(latLng, prevLatLng, index, points) {
                    var i, time,
                        timeThresholds = Visualizer.options["elapsed"].thresholds;

                    time = (latLng.time - points[0].time) / 1000; 

                    for (i = 0; i < timeThresholds.length; ++i) {
                        if (time <= timeThresholds[i]) {
                            return i;
                        }
                    }
                    return timeThresholds.length - 1;
                },
                options: [
                    {color: '#0000FF'}, {color: '#0040FF'}, {color: '#0080FF'},
                    {color: '#00FFB0'}, {color: '#00E000'}, {color: '#80FF00'},
                    {color: '#FFFF00'}, {color: '#FFC000'}, {color: '#FF0000'}
                ]
            }
    }

    static show_polylines(map, allRoutes, new_vizualisation) {
        //update buttons
        var buttons = document.getElementsByClassName("btn-group")[0].children;
        for (var i = 0; i < buttons.length; i++) {
            if(buttons[i].id == new_vizualisation)
                buttons[i].disabled = true;
            else
                buttons[i].disabled = false;
        }

        //update legend
        var legend_labels = document.getElementsByClassName("legend-labels")[0].children;
        for (var i = 0; i < legend_labels.length; i++) {
            if(new_vizualisation == "heatmap") {
                legend_labels[i].firstChild.data = "";
            }
            else if(new_vizualisation == "elapsed") {
                legend_labels[i].firstChild.data = (Visualizer.options[new_vizualisation].thresholds[i] / 3600).toFixed(2);
            }
            else
                legend_labels[i].firstChild.data = Visualizer.options[new_vizualisation].thresholds[i];
        }

        //update legend label
        document.getElementById("legend-label").innerHTML = new_vizualisation + " (" + Visualizer.options[new_vizualisation].unit + ")";

        //remove all polylines
        for (var i = 0; i < polylines.length; i++) {
            polylines[i].remove(map);
        }

        polylines = [];

        //create polylines
        let opacity = 0.75;

        if(new_vizualisation == "heatmap") {
            opacity = 0.5;
        }

        for (viz_counter = 0; viz_counter < allRoutes.length; viz_counter++) {
            //create multi options polyline
            var polyline = L.multiOptionsPolyline(allRoutes[viz_counter], {
                multiOptions: Visualizer.options[new_vizualisation],
                weight: document.getElementById("line_range").value,
                lineCap: 'round',
                opacity: opacity,
                smoothFactor: 1}
            ).addTo(map);

            //set polyline weight
            this.set_line_width(document.getElementById("line_range").value);

            //add polyline to array
            polylines.push(polyline);
        }
    }

    static set_line_width(new_width) {
        for (var i = 0; i < polylines.length; i++) {
            polylines[i].setStyle({weight: new_width});
        }
    }

    static precalculate_speeds() {
        //calculate speeds
        for (var i = 0; i < allRoutes.length; i++) {
            var latLngSpeeds = [];

            var points = allRoutes[i];

            for (var j = 1; j < points.length - 1; j++) {
                var speed = getSpeed(points[j], points[j-1]);
                latLngSpeeds.push(speed);
            }

            speeds.push(latLngSpeeds);
        }

        console.log(speeds);
    }

    static change_layer(new_layer) {
        if(new_layer == "osm") {
            map.removeLayer(satellite);
            map.addLayer(osm);
        } else {
            map.removeLayer(osm);
            map.addLayer(satellite);
        }
    }
}

loadGPX(function(tours) {
    //update tours amount label
    document.getElementById("amount-label").innerHTML = tours.length;

    //convert gpx files to leaflet latlngs
    var convertedRoutes = [];

    for (var i = 0; i < tours.length; i++) {
        var parser = new gpxParser();
        parser.parse(tours[i]);

        var points = parser.tracks[0].points;
        var gpx_latlngs = [];

        for (var j = 0; j < points.length; j++) {
            var latlng = new L.latLng(points[j].lat, points[j].lon, points[j].ele);
            latlng.time = points[j].time
            gpx_latlngs.push(latlng);
        }

        convertedRoutes.push(gpx_latlngs);
    }

    Visualizer.options["speed"].thresholds = equalDistribution(0, getSpeedMax(convertedRoutes), 9);
    Visualizer.options["elapsed"].thresholds = equalDistribution(0, getElapsedMax(convertedRoutes), 9);

    console.log(Visualizer.options["speed"].thresholds);
    console.log(Visualizer.options["elapsed"].thresholds);

    allRoutes = convertedRoutes;

    Visualizer.precalculate_speeds();

    Visualizer.show_polylines(map, allRoutes, "heatmap");
});

//add event listener to slider with id 'line_range'
document.getElementById("line_range").addEventListener("input", function() {
    Visualizer.set_line_width(this.value);
});