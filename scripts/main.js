google.load("feeds", "1");


//**************delete posts function********************************
function deletePost(id) {
  $.ajax({
    url: "backliftapp/posts/" + id,
    type: "DELETE",
    dataType: "json",
    success: function() {
      refreshPosts()
    }
  });
};  //end deletePost


//**************initial forum loading on refresh*******************************
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
};  //end loadForum

//*****************refreshes forum post list*********************
function refreshPosts() {
  $('#forum-posts').children().remove();
  loadForum();
};  //end refreshPosts

//*****************takes forum input values and insert them into forum divs******************************
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
};  //end addPost

//****************searches twitter for tweets with #psoriasis and lists them at top*******************************
function getTweets() {
  $.ajax({
    dataType:"jsonp", 
    type:"GET", 
    url:"https://search.twitter.com/search.json?q=%23psoriasis",
    success:function(response) {
      tweets = (response.results);
      $.each(tweets, function() { $("#tweets").append("<li><a href='https://twitter.com/"+ this.from_user +"'><h5>" + this.text + "</h5></a></li>") });
      $('#tweets').totemticker({row_height:"30", max_items:"1", mousestop: true });  //totemticker plugin scrolls through results list one at a time
    }
  });
};  //end getTweets


$(document).ready(function(){

  $('body').css('background-color', '#ADB4C4');

  $('.main-content').hide();
  $('.treatment').hide();
  $('.close-img').hide();

  $('.section-link').click(function(e){
    $('.main-content').hide();
    $('.title-description').slideUp(1000);
    if (this.id == "third_section_link") {
      $($(this).attr('data-link')).slideDown(1000, getMap);
    }
    else {
      $($(this).attr('data-link')).slideDown(1000);
    }
    e.preventDefault();
    refreshPosts();
  });

  $('.treatment-div a').click(function(){
    $(this).next('.treatment').slideToggle();
    $('.open-img', this).toggle();
    $('.close-img', this).toggle()
  });

  loadForum();

  getTweets();

  //*************Forum validation function***********************
  $('#submit_post').click(function() {
    if ($('#new_post').val()=="" || $('#post_name').val()==""){
      alert('please fill all inputs.');
      return false
    }
    else{
      addPost($('#new_post').val(), $('#post_name').val());
    }
  });

  $('#myTab a').tab();  //bootstrap tab function

  //**************************setup funtions for Google Maps*********************************
  var getMap = function() {
    initializeMap();
    var map;
    var infowindow;
  }

  function initializeMap() {
    var nashville = new google.maps.LatLng(36.167192, -86.787113);
    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'));

    map = new google.maps.Map(document.getElementById('map'), {
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: nashville,
      zoom: 15
    });

    var request= {
      location: nashville,
      radius: '5000',
      keyword: 'dermatologist'
    };

    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);

    google.maps.event.addListener(autocomplete, 'place_changed', function() {
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
  }

  function callback(results, status) {
    google.maps.event.trigger(map, 'resize');
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        createMarker(results[i]);
      }
    }
  }

  function createMarker(place) {
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });
    marker.setAnimation(google.maps.Animation.DROP);

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent('<strong>' + place.name + '</strong>' + '<br />' + place.vicinity);
      infowindow.open(map, this);
    });
  }

  //********************uses Google Feeds to display RSS feed**************************************
  function loadNewsFeed() {
    var feed = new google.feeds.Feed("http://www.medicalnewstoday.com/rss/eczema-psoriasis.xml");
    feed.includeHistoricalEntries();  //includes any past entries it finds
    feed.setNumEntries(5);  //sets entries limit at 5
    feed.load(function(result){
      if (!result.error) {
        var container = $('#newsFeedInner');
        for (var i=0; i< result.feed.entries.length; i++) {
          var entry = result.feed.entries[i];
          $(container).append("<p><a href='" + entry.link + "'>" + entry.title + "</a><br></p>"); //if there is no error return entry url and title
        };
      }
    })
  } ;
  google.setOnLoadCallback(loadNewsFeed);
});  //end ready
