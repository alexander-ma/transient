


$(document).ready(function(){
      $('.user-profile').click(function() {
          if(!$(this).hasClass('active')){
              
              $('.user-profile.active').removeClass('active');
              $(this).addClass('active');
              
              var temp =  $('#'+$(this).attr('data-up'));
              
              hideUI('.chat-container')
              showUI('#'+$(this).attr('data-up'));
              temp.addClass('active').removeClass('hidechat');
              temp.prevAll('.chat-container').addClass('hidechat').removeClass('active');
              temp.nextAll('.chat-container').removeClass('active').removeClass('hidechat');
          }
      });
      showUI('#cont1');
      updateUI();
});
  
var config = {
  apiKey: "AIzaSyCubWxjE69MSMfZ9UiVRSLIkcc4QdyAsq0",
  authDomain: "transient-318de.firebaseapp.com",
  databaseURL: "https://transient-318de.firebaseio.com",
  projectId: "transient-318de",
  storageBucket: "transient-318de.appspot.com",
  messagingSenderId: "124852436250"
};
firebase.initializeApp(config); 

// Triggers when the auth state change for instance when the user signs-in or signs-out.
firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        // DB write should happen after registration, or currentUser field is null.
        var db = firebase.database();
        var usersRef = db.ref().child('users');

        usersRef.set({
            email: document.querySelector('#email').value,
            username: document.querySelector('#name').value
        });

        window.location = 'index.html';
    }
    else{
        console.log('User Not Logged in');
        window.location = '../index.html';
    }
});

function updateUI() {
  // grab data from firebase and dynamically update the webpage
}

function showUI(ele){
    console.log($(ele));
    var kids = $(ele).children(), temp;
    for( var i = kids.length-1 ; i >=0  ; i-- ){
        temp  = $(kids[i]);
        
        if(temp.is('div')){
            temp.animate({
                marginTop:0,
            },400).css({opacity:1}).fadeIn()
        }
        else{
            temp.css({opacity:1}).fadeIn()
        }   
    }
}

function hideUI(ele){
    console.log($(ele));
    var kids = $(ele).children(), temp;
    for( var i = kids.length-1 ; i >=0  ; i-- ){
        temp  = $(kids[i]);
        
        if(temp.is('div')){
            temp.animate({
                marginTop:'30px',
            }).css({opacity:0});
        }
        else{
            temp.css({opacity:0});
        }   
    }
}

$("#new-chat").click(function() {
  $("#myModal").show();
});

$(".close").click(function(){
  $("#myModal").hide();
});

$(document).click(function(event){
  if($(event.target).is('#myModal') && !$(event.target).is('#new-chat')) {
    if($('#myModal').css('display') != 'none') {
      $('#myModal').hide();
      $("#modal-choose-action").show();
      $("#modal-join-channel").hide();
      $("#modal-create-channel").hide();
    }
  }
});

$("#logoutbtn").click(function() {
  console.log("signing out user");
  firebase.auth().signOut();
});

$("#goToJoin").click(function() {
  console.log("going to join modal");
  $("#modal-choose-action").hide();
  $("#modal-join-channel").show();
});

$("#goToCreate").click(function() {
  console.log("going to create modal");
  $("#modal-choose-action").hide();
  $("#modal-create-channel").show();
});

$(".backToAction").click(function() {
  console.log("Going to back to original Modal");
  $("#modal-create-channel").hide();
  $("#modal-join-channel").hide();
  $("#modal-choose-action").show();
});

