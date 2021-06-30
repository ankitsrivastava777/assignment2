var express = require("express");
var app = express();
const fs = require("fs");

var jsonData = fs.readFileSync("./airport.json", "utf-8");
var airportData = JSON.parse(jsonData);

function calcDistanceByCordinates(
  latitude1,
  longitude1,
  latitude2,
  longitude2
) {
  var Radius = 6371; // km
  var latitude = toRad(latitude2 - latitude1);
  var longitude = toRad(longitude2 - longitude1);
  var latitude1 = toRad(latitude1);
  var latitude2 = toRad(latitude2);

  var calcDistance =
    Math.sin(latitude / 2) * Math.sin(latitude / 2) +
    Math.sin(longitude / 2) *
      Math.sin(longitude / 2) *
      Math.cos(latitude1) *
      Math.cos(latitude2);
  var calc = 2 * Math.atan2(Math.sqrt(calcDistance), Math.sqrt(1 - calcDistance));
  var distance = Radius * calc;
  return distance;
}
// Converts numeric degrees to radians
function toRad(Value) {
  return (Value * Math.PI) / 180;
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

app.get("/list", function (req, res) {
  try {
    if (jsonData) {
      res.status(200).json({
        error: 0,
        message: "list",
        data: airportData,
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
    var locationId = req.params.locationId;

    var cordinates = airportData.find((x) => x.LocationID === locationId);

    var distance = [];
    for (i = 0; i < airportData.length; i++) {
      distance.push({
        distanceForm_A: calcDistanceByCordinates(
          cordinates.Lat,
          cordinates.Lon,
          airportData[i]["Lat"],
          airportData[i]["Lon"]
        ),
        airport_id: airportData[i]["LocationID"],
      });
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
    var cordinates = {
      locationId1: req.params.locationid1,
      locationId2: req.params.locationid2,
    };

    const { locationId1, locationId2 } = cordinates;

    var cordinates1 = airportData.find((x) => x.LocationID === locationId1);
    var cordinates2 = airportData.find((x) => x.LocationID === locationId2);

    var distanceBetweenTwo = calcDistanceByCordinates(
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
