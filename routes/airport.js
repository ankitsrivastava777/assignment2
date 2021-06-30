var express = require("express");
var app = express();
var async = require("async");
const fs = require("fs");

var data = fs.readFileSync("./airport.json", "utf-8");
var airportData = JSON.parse(data);

function calcCrow(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}
// Converts numeric degrees to radians
function toRad(Value) {
  return (Value * Math.PI) / 180;
}

app.get("/list", function (req, res) {
  try {
    if (data) {
      var airData = [];
      for (var i = 0; i < airportData.length; i++) {
        airData.push({ locationId: airportData[i] });
      }
      res.status(200).json({
        error: 0,
        message: "list",
        data: airData,
      });
    } else {
      res.status(500).json({
        error: 1,
        message: "no data found",
        data: null,
      });
    }
  } catch (err) {
    res.status(500).json({
      error: 1,
      message: err.message,
      data: null,
    });
  }
});

app.post("/nearest/:locationId", function (req, res) {
  try {
    var airData = [];
    for (var i = 0; i < airportData.length; i++) {
      airData.push({ locationId: airportData[i] });
    }
    var locationId = req.params.locationId;

    var cordinates = airportData.find((x) => x.LocationID === locationId);

    var distance = [];
    for (i = 0; i < airData.length; i++) {
      distance.push({
        distanceForm_A: calcCrow(
          cordinates.Lat,
          cordinates.Lon,
          airportData[i]["Lat"],
          airportData[i]["Lon"]
        ),
        airport_id: airportData[i]["LocationID"],
      });
    }
    function compare(a, b) {
      if (a.distanceForm_A < b.distanceForm_A) {
        return -1;
      }
      if (a.distanceForm_A > b.distanceForm_A) {
        return 1;
      }
      return 0;
    }
    sortedData = distance.sort(compare);
    var nearest_distance = sortedData.splice(1, 3);
    res.status(200).json({
      error: 0,
      message: "nearest airports to the customer",
      data: nearest_distance,
    });
  } catch (err) {
    res.status(500).json({
      error: 1,
      message: err.message,
      data: null,
    });
  }
});

app.post("/distance/:locationid1/:locationid2", function (req, res) {
  try {
    var locationId1 = req.params.locationid1;
    var locationId2 = req.params.locationid2;

    var cordinates1 = airportData.find((x) => x.LocationID === locationId1);
    var cordinates2 = airportData.find((x) => x.LocationID === locationId2);

    console.log("hwllo" + cordinates2.Lat);
    var distanceBetweenTwo = calcCrow(
      cordinates1.Lat,
      cordinates1.Lon,
      cordinates2.Lat,
      cordinates2.Lon
    );
    res.status(200).json({
      error: 0,
      message: "distance between two airports",
      data:
        "distance between " +
        cordinates1.LocationID +
        " and " +
        cordinates2.LocationID +
        " is " +
        distanceBetweenTwo,
    });
  } catch (err) {
    res.status(500).json({
      error: 1,
      message: err.message,
      data: null,
    });
  }
});

module.exports = app;
