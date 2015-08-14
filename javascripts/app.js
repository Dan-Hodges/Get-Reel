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

var snapShot = {}, seenArray = [], notSeenArray = [], searchObj = {};

requirejs(
  ["jquery", "firebase", "hbs", "bootstrap", "dom-access", "populateHTML", "addMovie", "movieEdit", "badges", "lodash", "rating"], 
  function($, _firebase, Handlebars, bootstrap, D, populateHTML, addMovie, movieEdit, badges, _, rating) {
    //firebase reference
    var myFirebaseRef = new Firebase("https://movie-refactor.firebaseio.com/");
    
    myFirebaseRef.on("value", function(snapshot) {
      snapShot = snapshot.val();
    }

    for (key in snapShot) {
      if (snapShot.key('Seen')) { 
        seenArray.push(snapShot.key);
      }
      else {
        notSeenArray.push(snapShot.key);
      }
    }

    $("#").click(function(){
      var userInput = $('#').val();
      console.log("you clicked me");
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
                fillTemplate(searchObj, seenArray, notSeenArray);
              }
            });
          })(i);
        }
      });
    });

    function fillTemplate (arguments) {
      require(['hbs!../templates/???'], function(template) {
        $("#").html(template(arguments));
      });
    }
  }
); 



