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
$(document).ready(function() {
      $('.user-profile').click(function() {
          if (!$(this).hasClass('active')) {
              
              $('.user-profile.active').removeClass('active');
              $(this).addClass('active');
              
              var temp = $('#'+$(this).attr('data-up'));
              
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
  
/* Triggers when the auth state change for instance when the user signs-in or signs-out. */
firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        updateUI(firebaseUser);
    }
    else {
        console.log('Signing out user...');
        window.location = '../../index.html';
    }
});

/* Grab data from firebase and dynamically update the webpage based on the user. */
function updateUI(firebaseUser) {
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
                        "<li> " + name + " </li>"
                    )
            })
        });
    });

    loadChannelMessages();
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
});

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
});

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
    $("#modal-create-channel").hide();


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
        "<li> " + channelName + " </li>"
    ) 
});

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

function displayMessage(key, name, text, pictureURL, imageURI) {
    // TODO: Update UI to show the message.
}

/*
 * Loads the current user's channel messages in the chat box.
 */
function loadChannelMessages() {
    var firstChannelHash;
    var currentUserID = firebase.auth().currentUser.uid;
    var firstChannelRef = firebase.database().ref('users/' + currentUserID + '/live-channels'); 

    // Do nothing if the current user has no channels yet.
    firebase.database().ref('users/' + currentUserID).once('value', function(snapshot) {
        if (!snapshot.hasChild('live-channels')) {
            console.log("Current user is not in any channels.");
            return;
        }
    });

    // Get the first child from the live-channels list for the current user.
    firstChannelRef.limitToFirst(1).once('value', function(snapshot) {
        snapshot.forEach(function(channelSnapshot) {
            firstChannelHash = channelSnapshot.key;
        });
    }); 

    // Add listener to the messages ref.
    var messagesRef = firebase.database.ref('channels/' + firstChannelHash + '/messages');

    // Remove all previous listeners.
    messagesRef.off();

    var setMessages = function(data) {
        var val = data.val;
        this.displayMessage(data.key , val.name, val.text, val.photoUrl, val.imageUrl);
    }.bind(this);

    // Load only the past 12 messages.
    this.messagesRef.limitToLast(12).on('child_added', setMessages);
    this.messagesRef.limitToLast(12).on('child_changed', setMessages);
}

/* 
 * Functionality when entering a new message to the chat box. 
 */ 
function handleKeyPress(event) {
    var key = event.keyCode || e.which;
    if (key == 13) {
        // Message was entered.
        var message = document.getElementById('chat-input').value; 
        // TODO: Update UI to show entered message.
        // TODO: Update real-time database for ALL users in the channel.
    }
}
    
// Listens for new posts to the channel's chat and updates
// the real-time database with the new information.
function updateDatabaseChannelPosts() {
    
}

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
    // TODO
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
