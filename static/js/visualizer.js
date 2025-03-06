var tours_id = [];

const SPORTS = {
    "hiking": ["hike", "mountaineering", "climbing"],
    "cycling": ["citybike", "e_touringbicycle", "touringbicycle"],
    "mountainbiking": ["e_mtb", "mtb", "downhillbike", "e_mtb_advanced", "mtb_advanced"],
    "roadbiking": ["e_racebike", "racebike"],
    "running": ["jogging", "nordicwalking"],
    "gravel": ["e_mtb_easy", "mtb_easy"],
    "other": ["unicycle", "skaten", "skitour", "nordic", "skialpin", "snowshoe", "other"]
};

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
        if(Number.isFinite(speeds[i])){
            sum += speeds[i];
            count++;
        }
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

//Gets latest year from routes
function getYearMax(allRoutes) {
  let maxYear = 0;
  for (let i = 0; i < allRoutes.length; i++) {
    var points = allRoutes[i];
    var year = new Date(points[0].time).getFullYear();
    if (year > maxYear) {
        maxYear = year;
    }
  }
  return maxYear;
}

//Gets first year from routes
function getYearMin(allRoutes) {
    let minYear = Infinity;
    for (let i = 0; i < allRoutes.length; i++) {
        var points = allRoutes[i];
        var year = new Date(points[0].time).getFullYear();
        if (year < minYear) {
            minYear = year;
        }
    }
    return minYear;
}

//Gets equal distribution
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
    var request = new XMLHttpRequest();
    request.open('GET', './tours_list', false);
    request.send(null);

    if (request.status === 200) {
        tours_id = JSON.parse(request.responseText);

        console.log("Successfully fetched tours id. Length: " + tours_id.length.toString());
        console.log(tours_id);
    } else {
        console.log('Error fetching tours: ' + request.status);

        window.Sentry && Sentry.captureException(new Error('Error fetching tours: ' + request.status));
        
        window.location.replace("./login");
    }

    //set progress bar max to tours length
    document.getElementById("gpx_progress").max = tours_id.length;

    //query the tours data
    var tours = [];
    var errs = 0;

    for (var i = 0; i < tours_id.length; i++) {
        var request = new XMLHttpRequest();
        var current_id = tours_id[i]["id"];
        
        request.onreadystatechange = function() {
            if (this.readyState == 4) {
                if(this.status == 200) {
                    tours.push(this.responseText);
                    console.log("Fetched tour");
                } else {
                    errs++;
                    
                    console.log("Failed to fetch tourID: " + current_id);
                    window.Sentry && Sentry.captureException(new Error("Failed to fetch tourID: " + current_id + " | Index: " + i.toString()));
                }
            }
        };

        request.open('GET', './tour/' + current_id, true);
        request.send(null);
    }

    //wait for all requests to finish
    var interval = setInterval(function() {
        document.getElementById("gpx_progress").value = tours.length + errs;
        document.getElementById("progress_label").innerHTML = "Downloading tours (" + (tours.length + errs) + "/" + tours_id.length + "):";

        if(tours.length + errs == tours_id.length) {
            if(errs == tours_id.length) {
                window.location.replace("./login");
            }
            
            document.getElementById("progress_box").style.display = "none";

            console.log("Loaded all tours.");

            clearInterval(interval);
            callback(tours);
        }
    }, 100);
}

function get_all_filters() {
    var filters = [];

    var checkboxes = document.getElementsByClassName("filter-checkbox");

    for (var i = 0; i < checkboxes.length; i++) {
        if(checkboxes[i].checked) {
            filters.push(checkboxes[i].id);
        }
    }

    return filters;
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
var active_vizualisation = "heatmap";

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
            },

            "year": {
                unit: "y",
                thresholds: [ ],
                optionIdxFn: function(latLng, prevLatLng, index, points) {
                    var i, year,
                        yearThresholds = Visualizer.options["year"].thresholds;

                    year = new Date(points[0].time).getFullYear()

                    for (i = 0; i < yearThresholds.length; ++i) {
                        if (year == yearThresholds[i]) {
                            return i;
                        }
                    }
                    return yearThresholds.length  ;
                },
                options: [
                    {color: '#0000FF'}, {color: '#0040FF'}, {color: '#0080FF'},
                    {color: '#00FFB0'}, {color: '#00E000'}, {color: '#80FF00'},
                    {color: '#FFFF00'}, {color: '#FFC000'}, {color: '#FF0000'}, {color: '#444444'}
                ]
            }
    }

    static show_polylines(map, allRoutes, new_vizualisation = "") {
        //update vizualisation
        if(new_vizualisation == "") {
            new_vizualisation = active_vizualisation;
        } else {
            active_vizualisation = new_vizualisation;
        }

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

        //show year slider
        if (new_vizualisation === "year") {
            document.getElementById("year-slider").removeAttribute("hidden");
        } else {
            document.getElementById("year-slider").setAttribute("hidden", "hidden");
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
            //check if tour should be filtered
            var filters = get_all_filters();
            var tour_sport = tours_id[viz_counter]["sport"];

            var allowed_sports = [];

            for(var i = 0; i < filters.length; i++) {
                allowed_sports = allowed_sports.concat(SPORTS[filters[i]]);
            }

            if(allowed_sports.length > 0 && allowed_sports.includes(tour_sport)) {
            
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

function initYearSlider(convertedRoutes) {
    const yearMin = getYearMin(convertedRoutes);
    const yearMax = getYearMax(convertedRoutes);
    const startYear = (yearMax - yearMin >= 9 ? yearMax - 8 : yearMin); //if there are more than 9 years tour data, start with the last 9 years

    const slider = document.getElementById("start_year");
    const valueElement = document.getElementById("start_year_value");

    slider.min = yearMin;
    slider.max = yearMax;
    slider.value = startYear;
    valueElement.textContent = startYear.toString();

    slider.addEventListener("input", () => {
        valueElement.textContent = slider.value.toString();
    });

    slider.addEventListener("change", () => {
        var startYear = parseInt(slider.value);
        Visualizer.options["year"].thresholds = equalDistribution(startYear - 1, startYear + 9, 9);
        Visualizer.show_polylines(map, allRoutes, 'year');
    });
    slider.dispatchEvent(new Event('change'));
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

    //console.log(Visualizer.options["speed"].thresholds);
    //console.log(Visualizer.options["elapsed"].thresholds);

    initYearSlider(convertedRoutes);

    allRoutes = convertedRoutes;

    Visualizer.precalculate_speeds();

    Visualizer.show_polylines(map, allRoutes, "heatmap");
});

//add event listener to slider with id 'line_range'
document.getElementById("line_range").addEventListener("input", function() {
    Visualizer.set_line_width(this.value);
});

//add event listener to filter checkboxes
document.querySelector('#filter-container').onclick = function(ev) {
    if(ev.target.value) {
        Visualizer.show_polylines(map, allRoutes);
    }
};
