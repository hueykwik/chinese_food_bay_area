var locations = [
  {name: 'Gou Bu Li', location: {lat: 37.961543, lng: -122.325498}},
  {name: 'Hometown Noodle', location: {lat: 37.261173, lng: -121.932017}},
  {name: 'T4 Livermore', location: {lat: 37.680343, lng: -121.747897}},
  {name: 'Sichuan Table', location: {lat: 37.775155, lng: -122.50606}},
  {name: 'Tashi delek', location: {lat: 37.919973, lng: -122.314227}}
];

var ViewModel = function() {
  var self = this;

  self.filterText = ko.observable("");
  self.locationList = ko.computed(function() {
    return locations.filter(function(location) {
      var name = location.name;
      return name.toLowerCase().includes(self.filterText().toLowerCase());
    })
  });

  self.locationList.subscribe(function(newValue) {
    console.log("The location list is now " + newValue.map(function(x) { return x.name }));

    clearMarkers();
    addMarkersToMap(map, self.locationList(), false);
  });
}

ko.applyBindings(new ViewModel());

var map;
var markers = [];

function initMap() {
  var sfba = {lat: 37.8272, lng: -122.2913};
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 9,
    center: sfba
  });

  addMarkersToMap(map, locations, true);
}

function createMarkers(locations) {
  var markers = [];

  for (var i = 0; i < locations.length; i++) {
    var marker = new google.maps.Marker({
      position: locations[i].location,
      title: locations[i].name,
      animation: google.maps.Animation.DROP,
      id: i
    });

    markers.push(marker);
  }

  return markers;
}

function setMapForMarkers(markers, map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

function setBounds(markers, map) {
  var bounds = new google.maps.LatLngBounds();

  for (var i = 0; i < markers.length; i++) {
    bounds.extend(markers[i].position);
  }

  map.fitBounds(bounds);
}

function addMarkersToMap(map, locations, fitBounds) {
  markers = createMarkers(locations);

  setMapForMarkers(markers, map);

  if (fitBounds) {
    setBounds(markers, map);
  }
}

function clearMarkers() {
  setMapForMarkers(markers, null);
  markers = [];
}

