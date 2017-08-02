/**
* @description Represents a Region
* @param {name} name - The name of the region
* @param {list} restaurants - List of restaurants
*/
var Region = function(name, restaurants) {
    this.name = name;
    this.restaurants = restaurants;
};

var regions = [];
var regionDict = _.groupBy(locations, 'regionName');
_.forEach(regionDict, function(restaurants, regionName) {
  regions.push(new Region(regionName, restaurants));
});

/**
* @description Represents our View Model
*/
var ViewModel = function() {
  var self = this;

  self.filterText = ko.observable("");

  self.foo = function() {
    console.log('foo');
  }

  /*
  Matches restaurants based on region name or restaurant name.
  */
  self.regions = ko.computed(function() {
    var filterTextLower = self.filterText().toLowerCase();
    var filteredRegions = [];
    var i;
    for (i = 0; i < regions.length; i++) {
      curRegion = regions[i];

      // If the region name matches, you're done.
      if (curRegion.name.toLowerCase().includes(filterTextLower)) {
        filteredRegions.push(curRegion);
        continue;
      }

      var matchingRestaurants = curRegion.restaurants.filter(function(restaurant) {
        var name = restaurant.name.toLowerCase();
        var regionName = restaurant.regionName.toLowerCase();

        return name.includes(filterTextLower) || regionName.includes(filterTextLower);
      });

      // Include the region of the restaurants that matched by name.
      if (matchingRestaurants.length > 0) {
        curRegion = new Region(curRegion.name, matchingRestaurants);
        filteredRegions.push(curRegion);
        continue;
      }
    }
    return filteredRegions;
  });

  self.regions.subscribe(function(newValue) {
    clearMarkers();

    var restaurants = newValue.map(function(region) {
      return region.restaurants;
    });

    restaurants = restaurants.reduce(function(a, b) {
      return a.concat(b);
    });

    console.log("The region list is now " + newValue.map(function(x) { return x.name }));
    console.log("The restaurant list is now " + restaurants.map(function(x) { return x.name }));

    addMarkersToMap(map, restaurants, false);
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

