requirejs.config({
  baseUrl: './scripts',
  paths: {
    'jquery': '../bower_components/jquery/dist/jquery.min',
    'firebase': '../bower_components/firebase/firebase',
    'lodash': '../bower_components/lodash/lodash.min',
    'hbs': '../bower_components/require-handlebars-plugin/hbs',
    'bootstrap': '../bower_components/bootstrap/dist/js/bootstrap.min',
    'rating' : '../bower_components/bootstrap-rating/bootstrap-rating.min'
  },
  shim: {
    'bootstrap': ['jquery'],
    'rating' : ['bootstrap'],
    'firebase': {
      exports: 'Firebase'
    }
  }
});

requirejs(
  ["jquery", "firebase", "hbs", "bootstrap", "lodash", "rating"], 
  function($, _firebase, hbs, bootstrap, _, rating) {


    var myFirebaseRef = new Firebase("https://movie-refactor.firebaseio.com/");
    
    myFirebaseRef.on("value", function(snapshot) {
      var snapShot = {}, seenArray = [], notSeenArray = [], searchObj = {};
      snapShot = snapshot.val();

      $(document).ready(function () {
        fillTemplate(notSeenArray, null, null);
      });

      for (var key in snapShot) {
        if (snapShot[key].Seen === (true)) { 
          seenArray.push(snapShot[key]);
        }
        else {
          notSeenArray.push(snapShot[key]);
        }
      }
      console.log(seenArray);
      console.log(notSeenArray);

      $("#search").click(function(){
        var userInput = $('input').val();
        // userInput = userInput.toLowerCase();
        $('input').val('');
        // console.log("you clicked me");
        console.log("userInput :", userInput);
        $('#').val('');

        var notSeenResults = [];
        var seenResults = [];
        for (var i = 0; i < notSeenArray.length; i++) {
          if (userInput === notSeenArray[i].Title) {
            notSeenResults.push(notSeenArray[i]);
          }
        }
        for (var i = 0; i < seenArray.length; i++) {
          if (userInput === seenArray[i].Title) {
            seenResults.push(seenArray[i]);
          }
        }


         
        var allIds = [], resultsObj = {};
        $.ajax({
          url: "http://www.omdbapi.com/?s=" + userInput + "&r=json"
        }).done(function (data) {
          resultsObj = {movies: data.Search};
          allIds = _.pluck(resultsObj.movies, 'imdbID');
          console.log("allIds :", allIds);
          for (var i = 0; i < allIds.length; i++) {        
            (function (i) {
              $.ajax({
                url: "http://www.omdbapi.com/?i=" + allIds[i] + "&plot=full&r=json"
              }).done(function(data) {
                searchObj[i] = data;
                // searchObj[i].Seen = false;
                searchObj[i].NeedsAddButton = true;
                // searchObj[i].Rating = 0;                
                if (i === (allIds.length - 1)) {
                  fillTemplate(searchObj, notSeenResults, seenResults);
                  // console.log(searchObj);
                }
              });
            })(i);
          }
        }); 
      });

      function fillTemplate (obj1, obj2, obj3) {
        require(['hbs!../templates/bars'], function(template) {
          $(".display-movies").html(template(obj1));
          $(".display-movies").append(template(obj2));
          $(".display-movies").append(template(obj3));
          $('.myRating').rating();

          var filteredMovies = $('.display-movies').find('h1');
          filteredMovies = filteredMovies.sort();
          console.log(filteredMovies);
          

        });
      }

      $("#wishlist").click(function(){
        fillTemplate(notSeenArray, null, null);
      });

      $("#watched").click(function(){
        fillTemplate(seenArray, null, null);
      });

      $(document).on('click', "#addMovie", function () {
          var newMovie = {
            Title: $(this).siblings('h1').text(),
            Year: $(this).siblings('h3').text(),
            Poster: $(this).siblings('img').attr('src'),
            Seen: false,
            Rating: 0,
            firebase: true
        };
        // console.log(newMovie);
        myFirebaseRef.push(newMovie);
      });

      $(document).on('click', '#moveToWatched', function () {
        var thisTitle = $(this).siblings('h1').text();
        // console.log(thisTitle);
        // console.log(snapShot);
        for (var key in snapShot) {
          if (snapShot[key].Title === thisTitle) { 
            // console.log(key);
            // myFirebaseRef.update({key: {Seen: true}})
            var ref = new Firebase("https://movie-refactor.firebaseio.com/" + key);
            ref.update({Seen: true});
            $(this).parent().parent().remove();
          }
        }
        
      });


      $(document).on('click', '#delete', function() {
       var thisElement = $(this).parent().parent();
       thisElement.remove();
      });

    });

  }
);


