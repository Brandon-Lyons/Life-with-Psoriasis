  google.load("feeds", "1");
$(document).ready(function(){

  $('body').css('background-color', '#ADB4C4')

  $('.main-content').hide();

  $('#first_section_link').click(function(e) {
    $('.main-content').hide();
    $('.title-description').slideUp(1000);
    $('#first-content-div').slideDown(1000);
    e.preventDefault();
  });

  $('#second_section_link').click(function(e) {
    $('.main-content').hide();
    $('.title-description').slideUp(1000);
    $('#second-content-div').slideDown(1000);
    e.preventDefault();
  });

  $('#third_section_link').click(function(e) {
    $('.main-content').hide();
    $('.title-description').slideUp(1000);
    $('#third-content-div').slideDown(1000);
   setTimeout(getMap, 1000);
    e.preventDefault();
  });

  getTweets();
  getComments();

  function getTweets() {
    $.ajax({
      dataType:"jsonp", 
      type:"GET", 
      url:"https://search.twitter.com/search.json?q=%23psoriasis",
      success:function(response) {
        tweets = (response.results);
        $.each(tweets, function() { $("#tweets").append("<li><a href='https://twitter.com/"+ this.from_user +"'><h5>" + this.text + "</h5></a></li>") });
        $('#tweets').totemticker({row_height:"30", max_items:"1"});
      }
    });
  };

  function postComments() {
    $.ajax({
      type: "POST",
      url:"backliftapp/comments",
      data: {comment: $('#comment-field').val()},
      success: function(data){
        console.log(data);
      }
    })
  };  //end postComments

  function getComments() {
    $.ajax({
      type: "GET",
      url:"backliftapp/comments",
      success: function(data){
        for (var i = 0; i< data.length; i++){
          comment = data[i].comment;
          $('#ticker').append("<li>"+ comment +"</li>");
        };
        $('#ticker').liScroll();
      }
    })
  };

  $('#submit').click(
    function(){
      postComments();
      getComments();
    }
    );

  $('#myTab a').tab();
  
 var getMap = function() {
  var mapOptions = {
    center: new google.maps.LatLng(36.1666667, -86.78333329999998),
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(document.getElementById("map"),mapOptions);

  var autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'));
  // autocomplete.bindTo('bounds',map);

  var service = new google.maps.places.PlacesService(map);

  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    var infoWindow = new google.maps.InfoWindow();
    infoWindow.close();
    var loc = autocomplete.getPlace();
    var lat= loc.geometry.location.kb;
    var lon= loc.geometry.location.lb;
    var request= {
      location: new google.maps.LatLng (lat, lon),
      radius: '5000',
      keyword: 'dermatologist'
    };
    service.nearbySearch(request, callback);
    if (loc.geometry.viewport) {
      map.fitBounds(loc.geometry.viewport);
    } else {
      map.setCenter(loc.geometry.location);
      map.setZoom(15);
    }
 });  //en google.maps event listener
  function callback(results, status) {
    if (status===google.maps.places.PlacesServiceStatus.OK) {
      for (var i=0; i< results.length; i++){
        var place= results[i];
        createMarker(results[i]);
      };
    };
    console.log(results);
    console.log(status);
  };

  function createMarker (place) {
    var marker = new google.maps.Marker({
      map: map
    });

    var infoWindow = new google.maps.InfoWindow();
    marker.setPosition(place.geometry.location);
    infoWindow.setContent('<strong>' + place.name + '</strong><br><p>'+ place.vicinity +'</p><a href="'+ place.website +'" >'+ place.website +'</a>');
    google.maps.event.addListener(marker, 'click', function() {
      infoWindow.close();
      infoWindow.open(map, this);
    });
  };
  };

 

  function loadNewsFeed() {
    var feed = new google.feeds.Feed("http://www.medworm.com/rss/medicalfeeds/conditions/Psoriasis.xml");
    feed.load(function(result){
      if (!result.error) {
        var container = $('#newsFeedInner');
        for (var i=0; i< result.feed.entries.length; i++) {
          var entry = result.feed.entries[i];
          $(container).append("<p><a href='" + entry.link + "'>" + entry.title + "</a><br></p>");
        };
      }
    })
  } ;
  google.setOnLoadCallback(loadNewsFeed);
});  //end ready
