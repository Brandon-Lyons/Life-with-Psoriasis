google.load("feeds", "1");

function deletePost(id) {
  $.ajax({
    url: "backliftapp/posts/" + id,
    type: "DELETE",
    dataType: "json",
    success: function() {
      refreshPosts()
    }
  });
};

 function loadForum() {
  $.ajax({
    dataType:"json",
    type:"GET",
    url:"backliftapp/posts",
    success:function(response) {
      posts = response;
      $.each(posts, function() {
        $('#forum-posts').append("<li><div class='post-box'><button class='close' onclick='deletePost(\""+ this.id +"\")'>x</button><h5>" + this.text + "</h5><p>-"+ this.name +"</p></div></li>")
      });
    }
  });
};

function refreshPosts() {
  $('#forum-posts').children().remove();
  loadForum();
};


function addPost(content, name) {
  $.ajax({
    dataType:"json",
    type:"POST",
    url:"backliftapp/posts",
    data: {text: content,
           name: name
          },
    success:function(response) {
      refreshPosts();
      $('#new_post').val("");
      $('#post_name').val("")
    }
  });
};


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


$(document).ready(function(){

  $('body').css('background-color', '#ADB4C4');

  $('.main-content').hide();
  $('.treatment').hide();
  $('.close-img').hide();

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

  $('#fourth_section_link').click(function(e) {
    $('.main-content').hide();
    $('.title-description').slideUp(1000);
    $('#fourth-content-div').slideDown(1000);
    refreshPosts();
    e.preventDefault();
  });

  $('.treatment-div h3').click(function(){
    $(this).next('.treatment').slideToggle();
    $('.open-img', this).toggle();
    $('.close-img', this).toggle()
  });

  loadForum();

  getTweets();

  $('#submit_post').click(function() {
    addPost($('#new_post').val(), $('#post_name').val());
  });


 
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
    var feed = new google.feeds.Feed("http://www.medicalnewstoday.com/rss/eczema-psoriasis.xml");
    feed.includeHistoricalEntries();
    feed.setNumEntries(5);
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
