/* Firebase initialization */
var config = {
  apiKey: "AIzaSyCubWxjE69MSMfZ9UiVRSLIkcc4QdyAsq0",
  authDomain: "transient-318de.firebaseapp.com",
  databaseURL: "https://transient-318de.firebaseio.com",
  projectId: "transient-318de",
  storageBucket: "transient-318de.appspot.com",
  messagingSenderId: "124852436250"
};

firebase.initializeApp(config); 

/* Ran once the DOM is ready for JavaScript execution. */
// Modified for channel buttons rather than user profiles
$(document).ready(function() {

      //$('.channel-button').click(function() {
        $(document).on("click", ".channel-button", function(){
        console.log("channel button clicked");
          if (!$(this).hasClass('active')) {
              
              $('.channel-button.active').removeClass('active');
              $(this).addClass('active');
              
              var temp = $('#'+$(this).attr('data-up'));
              console.log($(temp));
              hideUI('.chat-container')
              showUI('#'+$(this).attr('data-up'));
              temp.addClass('active').removeClass('hidechat');
              temp.prevAll('.chat-container').addClass('hidechat').removeClass('active');
              temp.nextAll('.chat-container').removeClass('active').removeClass('hidechat');
              $("#current-channel-name").text($(".channel-button.active").text());
          }
      });
      showUI('#default_channel');

      updateUI();
});

  
/* Triggers when the auth state change for instance when the user signs-in or signs-out. */
firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        // TODO: Show channels, (friends ?), live + scheduled channels for the 
        // registered firebase user.
        updateUI(firebaseUser);
    }
    else {
        console.log('Signing out user...');
        window.location = '../../index.html';
    }
});

/* Grab data from firebase and dynamically update the webpage based on the user. */
function updateUI(firebaseUser) {
    // TODO:
    var db = firebase.database();
    var currentUserID = firebase.auth().currentUser.uid;
    var liveChannelsRef = db.ref('users/' + currentUserID + '/live-channels');
    
    
    liveChannelsRef.once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var chatHash = childSnapshot.val();
            var chatRef = db.ref('channels/' + chatHash);

            chatRef.once('value', function(snapshot) {
                var name = snapshot.val()["channelName"];
                    $("#live-channels-list").append(
                        "<div class='channel-button' data-up='" + name.replace(/ /g,"-") + "'>" + name + " </div>"
                    )
            })
        });
    });
}

/* Displays the UI for 'ele'. */ 
function showUI(ele) {
    console.log($(ele));
    var kids = $(ele).children(), temp;

    for (var i = kids.length - 1; i >= 0; i--) {
        temp  = $(kids[i]);
        
        if (temp.is('div')) {
            temp.animate({
                marginTop:0,
            },400).css({opacity:1}).fadeIn()
        }
        else {
            temp.css({opacity:1}).fadeIn()
        }   
    }
}

/* Hides the UI for 'ele'. */
function hideUI(ele) {
    console.log($(ele));
    var kids = $(ele).children(), temp;

    for (var i = kids.length - 1; i >= 0; i--) {
        temp  = $(kids[i]);
        
        if (temp.is('div')) {
            temp.animate({
                marginTop:'30px',
            }).css({opacity:0});
        }
        else {
            temp.css({opacity:0});
        }   
    }
}

/* Displays the channel action interface. */
$("#new-chat").click(function() {
  $("#myModal").show();
  $("#modal-choose-action").show();
  //$("#modal-delete-channel").hide();
});

$("#delete-chat").click(function() {
    console.log("in delete chat modal");
  $("#myModal").show();
  $("#modal-choose-action").hide();
  $("#modal-delete-channel").show();
})

/* Hides the channel action interface. */
$(".close").click(function() {
  $("#myModal").hide();
});

/* Displays channel action interface from clicking new chat button. */
$(document).click(function(event) {
    if ($(event.target).is('#myModal') && !$(event.target).is('#new-chat')) {
        if ($('#myModal').css('display') != 'none') 
        {
            // Show channel action interface.
            $('#myModal').hide();
            $("#modal-choose-action").show();
            $("#modal-join-channel").hide();
            $("#modal-create-channel").hide();
        }
    }

    if ($(event.target).is('#myModal') && !$(event.target).is('#delete-chat')) {
        if ($('#myModal').css('display') != 'none') 
        {
            // Show channel action interface.
            $('#myModal').hide();
            $("#modal-choose-action").show();
            $("#modal-join-channel").hide();
            $("#modal-create-channel").hide();
        }
    }
});

$("#cancel").click(function() {
    $('#myModal').hide();
})

/* Handles logout for the user. */
$("#logoutbtn").click(function() {
    console.log("signing out user");
    firebase.auth().signOut();
});

/* Displays the interface for joining a channel. */
$("#goToJoin").click(function() {
    console.log("going to join modal");

    $("#modal-choose-action").hide();
    $("#modal-join-channel").show();
});

/* Displays the interface for creating a channel. */
$("#goToCreate").click(function() {
    console.log("going to create modal");

    $("#modal-choose-action").hide();
    $("#modal-create-channel").show();
});

/* Displays the channel action interface. */ 
$(".backToAction").click(function() {
    console.log("Going to back to original Modal");

    $("#modal-create-channel").hide();
    $("#modal-join-channel").hide();
    $("#modal-choose-action").show();
});

/* Creation of channel logic. */
$("#create-channel-button").click(function() { 
    console.log("Creating channel...");    

    // TODO: Remove input box for channel name. Channel name shouldn't be
    // responsibility of the user, as specified in the project scope.

    var db = firebase.database();
    var currentUserID = firebase.auth().currentUser.uid;
    var channelName = document.querySelector('#channel-name').value;
    
    if (!channelName) {
        return;
    }

    // Add new channel to current user's list of live channels.
    var currentUserLiveChannelsRef = db.ref('users/' + currentUserID + '/live-channels');
    var newLiveChannelRef = currentUserLiveChannelsRef.push("");

    // TODO: Add new channel to "liveChannels" partition 

    // TODO: 
    // 1. Swap the chat box to the created channel
    $("#myModal").hide();


    // 2. Display modal with name generated string for the channel creator to copy + share
    var channelHash = newLiveChannelRef.key;
    currentUserLiveChannelsRef.child(channelHash).set(channelHash);  
    var channelListRef = db.ref('channels/' + channelHash);
    
    
    channelListRef.set({
        channelName: channelName,
        hash: channelHash
    });
    
    channelListRef.child("participants").push(currentUserID);

    // 3. Display the created channel underneath "Live Channels" section
    $("#live-channels-list").append(
        "<div class='channel-button' data-up='" + channelName.replace(/ /g,"-") + "'>" + channelName + " </div>"
    ) 
});


$("#delete-channel").click(function() {
    /*
    TODO:
    Add a delete button somewhere in the HTML in order to delete a channel
    This could be an onHover button next to the live channels that are currently available,
    or just a general delete button that deletes the active channel that you're on
    
    Also add a popup window that confirms the deletion of a channel

    */
    console.log('in delete chat');
    var db = firebase.database();
    var currentUserID = firebase.auth().currentUser.uid;
    var channelName = $("#current-channel-name").text();

    $("#myModal").hide();


})


$("#join-channel").click(function() {
    var db = firebase.database()
    var currentUserID = firebase.auth().currentUser.uid;
    
    var hashCode = document.querySelector('#chat-hash').value;
    var channelsRef = db.ref('channels');
    
    console.log(userIsAlreadyInChat(hashCode, currentUserID, db));
    
    channelsRef.once('value', function(snapshot) {
        
      if (snapshot.hasChild(hashCode)) {
        // Successfully joined channel
        var chatName = snapshot.val()[hashCode]["channelName"];

        addUserToChannel(hashCode, chatName, currentUserID, db);
      }
    });
});

function addUserToChannel(channelName, chatName, uid, db) {
    // add to channel participants list
    db.ref('channels').child(channelName).child("participants").push(uid);
    
    // add the channel to the person's list
    db.ref('users/' + uid).child('live-channels').child(channelName).set(channelName);
}

function removeUserFromChannel(channelName, uid, db) {
    // remove participant from the channel list
    db.ref('channels').child(channelName).child("participants").child(uid).remove();
    
    // remove the channel from the user
    db.ref('users/' + uid).child('live-channels').child(channelName).remove();
}

function userIsAlreadyInChat(channelName, uid, db) {
    var userChannelsRef = db.ref('users/' + uid + '/live-channels');
    var flag = false;
    
    
    flag = (userChannelsRef.once("value", function(snapshot) {
        if (snapshot.hasChild(channelName)) {
            alert('already exists');
            flag = true;
            return true;
        }
        return false;
    }))();
    
    console.log(flag);
    

}
    

