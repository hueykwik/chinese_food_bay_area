var Region = function(name, restaurants) {
    this.name = name;
    this.restaurants = restaurants;
};

var regions = [];
var regionDict = _.groupBy(locations, 'regionName');
_.forEach(regionDict, function(restaurants, regionName) {
  regions.push(new Region(regionName, restaurants));
});

var ViewModel = function() {
  var self = this;

  self.filterText = ko.observable("");
  self.regions = ko.observableArray(regions);

  self.locationList = ko.computed(function() {
    var sortedLocations = locations.sort(function(a, b) {
      var regionA = a.regionName.toLowerCase();
      var regionB = b.regionName.toLowerCase();

      if (regionA < regionB) {
        return -1;
      }

      if (regionA > regionB) {
        return 1;
      }

      return 0;
    });

    var filteredLocations = sortedLocations.filter(function(location) {
      var name = location.name;
      return name.toLowerCase().includes(self.filterText().toLowerCase());
    });
    return filteredLocations;
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

function addInfoWindowToMarkers(markers, map) {
  var infowindow = new google.maps.InfoWindow({
    content: 'information'
  });

  for (var i = 0; i < markers.length; i++) {
    var marker = markers[i];
    marker.addListener('click', function() {
      console.log(this);
      populateInfoWindow(this, infowindow);
    });
  }
}

function populateInfoWindow(marker, infowindow) {
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div><div>Loading...</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick',function(){
      infowindow.setMarker = null;
    });

    var url = "http://localhost:5000/business?name={name}&latitude={lat}&longitude={long}"
      .replace(/{name}/g, marker.title)
      .replace(/{lat}/g, marker.position.lat)
      .replace(/{long}/g, marker.position.lng);

    $.ajax({
      url: url,
      success: function(result) {
        infowindow.setContent('<div>' + marker.title + '</div><div>Yelp Rating: ' + result.rating + '</div>');
      }
    });
  }
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
  addInfoWindowToMarkers(markers, map);
  setMapForMarkers(markers, map);

  if (fitBounds) {
    setBounds(markers, map);
  }
}

function clearMarkers() {
  setMapForMarkers(markers, null);
  markers = [];
}

