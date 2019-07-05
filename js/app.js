//create an array of places
var locations = [{
	position: {
		lat: 51.495564,
		lng: -0.14264524
	},
	title: "Apollo Victoria Theatre",
	wikiEntry: "Apollo Victoria Theatre"
}, {
	position: {
		lat: 51.50062,
		lng: -0.124578
	},
	title: "Big Ben",
	wikiEntry: "Big Ben"
}, {
	position: {
		lat: 51.497375,
		lng: -0.17456545
	},
	title: "Science Museum",
	wikiEntry: "Science Museum, London"
}, {
	position: {
		lat: 51.50555,
		lng: -0.07533789
	},
	title: "London Tower Bridge",
	wikiEntry: "Tower Bridge"
}, {
	position: {
		lat: 51.507996,
		lng: -0.076578
	},
	title: "Tower of London",
	wikiEntry: "Tower of London"
}, {
	position: {
		lat: 51.48141,
		lng: -0.1914516
	},
	title: "Victoria Miro Gallery",
	wikiEntry: "Victoria Miro Gallery"
}];


var Place = function(data, map) {
	var self = this;
	this.position = ko.observable(data.position);
	this.title = ko.observable(data.title);
	this.marker = ko.observable();
	this.wikiEntryWiki = data.wikiEntry;
	this.content = '<h3>' + self.title() + '</h3>';
	this.marker = new google.maps.Marker({
		position: this.position(),
		map: map,
		title: this.title(),
		icon: 'images/red.png',
	});
	self.marker.setAnimation(null); //init a marker withiout animation

	//add location if it matches with search 
	this.visible = ko.computed(function() {
		if (filterText().length > 0) {
			return (self.title().toLowerCase().indexOf(filterText().toLowerCase()) > -1);
		} else {
			return true;
		}
	}, this);


	// search Wikipedia for location info
	$.ajax({
		type: "GET",
		dataType: 'jsonp',
		url: wikiURL + self.wikiEntryWiki,
		timeout: 1500
	}).done(function(data) {
		self.content = '<h3>' + self.title() + '</h3>' + '<p>' + data[2][0] + '<i>' + '<a href=' + data[3][0] + ' target="blank"> Wikipedia</a>' + '</i>' + '</p>';
	}).fail(function(jqXHR, textStatus) {
		alert("Wikipedia resources did not load. Please refresh page.");
	});


	//marker animation - bounce
	this.toggleBounce = function() {
		if (self.marker.getAnimation() !== null) {
			self.marker.setAnimation(null);
		} else {
			self.marker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function() {
				self.marker.setAnimation(null);
			}, 1400);
		}
	};
};


var filterText = ko.observable(""); // Text filter for wikiEntry bar criteria
var wikiURL = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&callback=wikiCallBack&search=';



var ViewModel = function() {
	var self = this;
	//Setting up the map
	this.map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 51.50062,
			lng: -0.124578
		},
		zoom: 13
	});

	//init observable array
	this.placesList = ko.observableArray([]);
	//for the locations, place them in observableArray
	locations.forEach(function(placeItem) {
		self.placesList.push(new Place(placeItem, self.map));
	});
	// Open the infowindow on the correct marker.
	this.placesList().forEach(function(place) {
		google.maps.event.addListener(place.marker, 'click', function() {
			self.clickPlace(place);
		});
	});

	
	//show the infoWindow when click on marker or list
	var infowindow = new google.maps.InfoWindow();
	this.clickPlace = function(place) {
		infowindow.setContent(place.content);
		infowindow.open(this.map, place.marker);
		place.toggleBounce();
	};
	self.filteredList = ko.computed(function() {
		var filtered = [];
		this.placesList().forEach(function(place) {
			if (place.visible()) {
				filtered.push(place);
				place.marker.setVisible(true);
			} else {
				place.marker.setVisible(false);
			}
		});
		return filtered;

	}, this);
};

function start() {
	ko.applyBindings(new ViewModel());
}

function mapError() {
	// when there is an error loading googlee maps api this message will be displayed
	alert("Map can not Be Loaded");
}