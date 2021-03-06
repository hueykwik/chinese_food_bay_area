/**
* @description Represents a Region
* @param {name} name - The name of the region
* @param {list} restaurants - List of restaurants
*/
var Region = function(name, restaurants) {
    this.name = name;
    this.restaurants = restaurants;

    this.nameCount = ko.computed(function() {
      return name + ' (' + restaurants.length + ')';
    });
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

  self.showMarker = function(restaurant) {
    // Find marker
    var marker = markers.find(function(m) {
      return m.title == restaurant.name;
    });

    populateInfoWindow(marker, infowindow);

    console.log(marker);
  };

  self.filterRestaurants = function(restaurants, filterTextLower) {
    return restaurants.filter(function(restaurant) {
      var name = restaurant.name.toLowerCase();
      var regionName = restaurant.regionName.toLowerCase();

      return name.includes(filterTextLower) || regionName.includes(filterTextLower);
    });
  };

  self.filterRegions = function(regions, filterText) {
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

      var matchingRestaurants = self.filterRestaurants(curRegion.restaurants, filterTextLower);

      // Include the region of the restaurants that matched by name.
      if (matchingRestaurants.length > 0) {
        curRegion = new Region(curRegion.name, matchingRestaurants);
        filteredRegions.push(curRegion);
        continue;
      }
    }
    return filteredRegions;
  };

  /*
  Matches restaurants based on region name or restaurant name, and
  then sorts by number of restaurants per category.
  */
  self.regions = ko.computed(function() {
    var filteredRegions = self.filterRegions(regions, self.filterText);

    filteredRegions.sort(function(regionA, regionB) {
      // Make 'None' show up last.
      if (regionA.name == 'None') {
        return 1;
      }

      if (regionB.name == 'None') {
        return -1;
      }

      return regionB.restaurants.length - regionA.restaurants.length;
    });

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

    addMarkersToMap(map, restaurants, false);
  });
};

ko.applyBindings(new ViewModel());

var map;
var markers = [];
var infowindow;

function initMap() {
  var sfba = {lat: 37.8272, lng: -122.2913};
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 9,
    center: sfba
  });

  addMarkersToMap(map, locations, true);
}

function mapError() {
  alert("Maps could not load. Please try again later.");
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

function addClickListener(marker, infowindow) {
  marker.addListener('click', function() {
    populateInfoWindow(this, infowindow);
  });
}

function addInfoWindowToMarkers(markers, map) {
  infowindow = new google.maps.InfoWindow({
    content: 'information'
  });

  for (var i = 0; i < markers.length; i++) {
    var marker = markers[i];
    addClickListener(marker, infowindow);
  }
}

function populateInfoWindow(marker, infowindow) {
  marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
  }, 2000);
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
      },
      error: function (xhr, status, errorThrown) {
        infowindow.setContent('<div>' + marker.title + '</div><div>Yelp Rating unavailable</div>');
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

