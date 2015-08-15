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
    var snapShot = {}, seenArray = [], notSeenArray = [], searchObj = {};
    
    myFirebaseRef.on("value", function(snapshot) {
      snapShot = snapshot.val();

      for (var key in snapShot) {
        if (snapShot[key].Seen === (true)) { 
          seenArray.push(snapShot[key]);
        }
        else {
          notSeenArray.push(snapShot[key]);
        }
      }

      $("#search").click(function(){
        var userInput = $('input').val();
        $('input').val('');
        console.log("you clicked me");
        console.log("userInput :", userInput);
        $('#').val('');
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
                searchObj[i].Seen = false;
                searchObj[i].Rating = 0;                
                if (i === (allIds.length - 1)) {
                  fillTemplate(seenArray, notSeenArray, searchObj);
                }
              });
            })(i);
          }
        }); 
      });

      function fillTemplate (obj1, obj2, obj3) {
        require(['hbs!../templates/bars'], function(template) {
          $("#movies").html(template(obj1));
          $("#movies").append(template(obj2));
          $("#movies").append(template(obj3));
        });
      }

      $("#wishlist").click(function(){
        fillTemplate(notSeenArray);
      });

      $("#watched").click(function(){
        fillTemplate(seenArray);
      });
    });
  }
); 