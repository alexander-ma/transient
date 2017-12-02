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

var channelDict = {}

'use strict';

// Initializes Transient.
function Transient(hash) {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.channelHash = hash;
  this.messageList = document.getElementById('cont1');
  this.messageInput = document.getElementById('chat-input');
  this.mediaCapture = document.getElementById('file-input');
  this.submitButton = document.getElementById('submit');
  this.imageForm = document.getElementById('image-form');
  this.userPic = document.getElementById('user-pic');

//  // Saves message on form submit.
//  this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
//
//  // Toggle for the button.
//  var buttonTogglingHandler = this.toggleButton.bind(this);
//  this.messageInput.addEventListener('keyup', buttonTogglingHandler);
//  this.messageInput.addEventListener('change', buttonTogglingHandler);

//  // Events for image upload.
//  this.submitImageButton.addEventListener('click', function(e) {
//    e.preventDefault();
//    this.mediaCapture.click();
//  }.bind(this));
  this.mediaCapture.addEventListener('change', uploadUserPhoto, false);

  this.initFirebase();
}

function uploadUserPhoto() {
    var currentUserID = firebase.auth().currentUser.uid;
    var preview = document.getElementById('user-pic');
    var file=document.querySelector('input[type=file]').files[0];
    console.log(file);
    
    var storagePath = currentUserID + '/profilePicture/' + file.name;
    var storageRef = firebase.storage().ref(storagePath);
    var uploadTask = storageRef.put(file);
    
    
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
      function(snapshot) {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      }, function(error) {

      // A full list of error codes is available at
      // https://firebase.google.com/docs/storage/web/handle-errors
      switch (error.code) {
        case 'storage/unauthorized':
          // User doesn't have permission to access the object
          break;

        case 'storage/canceled':
          // User canceled the upload
          break;

        case 'storage/unknown':
          // Unknown error occurred, inspect error.serverResponse
          break;
      }
    }, function() {
      // Upload completed successfully, now we can get the download URL
        var downloadURL = uploadTask.snapshot.downloadURL;    
        var user = firebase.auth().currentUser;
        var userProfilePic = document.getElementById('user-pic');
        userProfilePic.src = downloadURL;
        
        var userProfilePicRef = firebase.database().ref('users/' + user.uid + '/photoURL');
        
        userProfilePicRef.set(
            downloadURL
        )
        
        user.updateProfile({
          photoURL: downloadURL
        }).then(function() {
          // Update successful.
        }).catch(function(error) {
          // An error happened.
        });
        
        console.log(user.photoURL);
    });
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
Transient.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
    console.log('init firebase called');
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();
};

// Template for messages.
Transient.MESSAGE_TEMPLATE_OTHER = 
'<div class="bubble">' +
    '<div class="bubble-row">' +
      '<div class="bubble-column bubble-column-left">' +
        '<img class="other-user-pic" src="img/img_avatar.png" alt="Avatar">' +
      '</div>' +
      '<div class="bubble-column bubble-column-right">' +
        '<span class="datestamp"></span>' +
          '<p class="message"></p>' +
      '</div>' +
    '</div>' +
'</div>';

Transient.MESSAGE_TEMPLATE_ME = 
'<div class="bubble bubble-alt">' + 
'<div class="bubble-message-self">' +
    '<span class="datestamp-alt"></span>' +
      '<p class="message"></p>' +
'</div>' +
'</div>';

//    '<div class="message-container">' +
//      '<div class="spacing"><div class="pic"></div></div>' +
//      '<div class="message"></div>' +
//      '<div class="name"></div>' +
//    '</div>';


// Loads chat messages history and listens for upcoming ones.
Transient.prototype.loadMessages = function(channelHash) {
    // Reference to the /messages/ database path.
    this.messagesRef = this.database.ref('channels/' + channelHash + '/messages');
    
    // Make sure we remove all previous listeners.
    this.messagesRef.off();
    
    console.log('loadMessages');
    // Loads the last 12 messages and listen for new ones.
    var setMessage = function(data) {
        var val = data.val();
        console.log(val);
        this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.imageUrl, val.timeStamp);
    }.bind(this);
    
    this.messagesRef.limitToLast(12).on('child_added', setMessage);
    this.messagesRef.limitToLast(12).on('child_changed', setMessage);
    $('#chat div.active').stop().animate({ scrollTop: $('#chat div.active')[0].scrollHeight}, 800);
};

document.getElementById('chat-input').onkeypress = function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13'){
      // Enter pressed
      window.transient.saveMessage();
    }
    $('#chat div.active').stop().animate({ scrollTop: $('#chat div.active')[0].scrollHeight}, 800);
}


// Displays a Message in the UI.
Transient.prototype.displayMessage = function(key, name, text, picUrl, imageUri, date) {
    
    var currentUserName = this.auth.currentUser.displayName;
    var uid = this.auth.currentUser.uid;
    var userRef = this.database.ref('users/' + uid);
    
    var div = document.getElementById(key);
    // If an element for that message does not exists yet we create it.
    if (!div) {
        var container = document.createElement('div');
        
            
        if (name == currentUserName) {
            container.innerHTML = Transient.MESSAGE_TEMPLATE_ME;

            div = container.firstChild;
            div.setAttribute('id', key);
            div.setAttribute('style', 'margin-top: 0px; opacity: 1;');
            this.messageList.appendChild(div);

            var messageElement = div.querySelector('.message');
            var timeStampElement = div.querySelector('.datestamp-alt');

            if (text) { // If the message is text.
                messageElement.textContent = text;
                // Replace all line breaks by <br>.
                messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
            } 

            if (date) {
                timeStampElement.textContent = date;
            }
        }
        else {
            container.innerHTML = Transient.MESSAGE_TEMPLATE_OTHER;
            div = container.firstChild;
            div.setAttribute('id', key);
            div.setAttribute('style', 'margin-top: 0px; opacity: 1;');
            this.messageList.appendChild(div);

            var messageElement = div.querySelector('.message');
            var timeStampElement = div.querySelector('.datestamp');
            var imageElement = div.querySelector('.other-user-pic');

            if (text) { // If the message is text.
                messageElement.textContent = text;
                // Replace all line breaks by <br>.
                messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
            }

            if (date) {
                timeStampElement.textContent = date;
            }

            if (picUrl) {
                imageElement.src = picUrl;
            }
            else {
                imageElement.src = 'https://firebasestorage.googleapis.com/v0/b/transient-318de.appspot.com/o/img_avatar.png?alt=media&token=3b3c7b4d-8503-49d2-99db-ddf578c0fa57';
            }
        }
    }

  if (text) { // If the message is text.
    messageElement.textContent = text;
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  } 
    $('#chat div.active').stop().animate({ scrollTop: $('#chat div.active')[0].scrollHeight}, 800);
};

// Checks that the Firebase SDK has been correctly setup and configured.
Transient.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
};

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

// Saves a new message on the Firebase DB.
Transient.prototype.saveMessage = function(e) {
//  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (this.messageInput.value) {
    var currentUser = this.auth.currentUser;
      
//    console.log(currentUser);
    var dt = new Date();
    var dateString = dt.toDateString() + ", " + formatAMPM(dt);
    // Add a new message entry to the Firebase Database.
    this.messagesRef.push({
      name: currentUser.displayName,
      text: this.messageInput.value,
      photoUrl: currentUser.photoURL || '/images/profile_placeholder.png',
      timeStamp: dateString
    }).then(function() {
      // Clear message text field and SEND button state.
      Transient.resetMaterialTextfield(this.messageInput);
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
};

// Resets the given MaterialTextField.
Transient.resetMaterialTextfield = function(element) {
  element.value = '';
//  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};



/* Ran once the DOM is ready for JavaScript execution. */
// Modified for channel buttons rather than user profiles
$(document).ready(function() {

      //$('.channel-button').click(function() {
    $(document).on("click", ".channel-button", function(){
//    console.log("channel button clicked");
          if (!$(this).hasClass('active')) {
              
              $('.channel-button.active').removeClass('active');
              $(this).addClass('active');
              
//    var temp = $('#'+$(this).attr('data-up'));
      var channelHash = $(this).attr('data-hash');
      
      console.log('channelHash is: ' + channelHash);
      
      
      $('#cont1').empty();
      window.transient.channelHash = channelHash;
      window.transient.loadMessages(channelHash);
      console.log(window.transient.channelHash);
              
              
              
     // hideUI('.chat-container')
     // showUI('#'+$(this).attr('data-up'));
     // temp.addClass('active').removeClass('hidechat');
     // temp.prevAll('.chat-container').addClass('hidechat').removeClass('active');
     // temp.nextAll('.chat-container').removeClass('active').removeClass('hidechat');
      $("#current-channel-name").text($(".channel-button.active").text());
      }
      showUI('#cont1');
  });
    
    $(document).on("click", "#invitebtn", function(){
        $('#myModal').show();
        $('#modal-invite-link').show(); 
        $("#modal-create-channel").hide();
        $("#modal-delete-channel").hide();
        $("#modal-join-channel").hide();
        $("#modal-choose-action").hide();
        
        var channelHash = window.transient.channelHash;
        $('#channel-invite-link').val(channelHash);
        console.log(channelHash);
    });
});

/* Triggers when the auth state change for instance when the user signs-in or signs-out. */
firebase.auth().onAuthStateChanged(firebaseUser => {
    console.log("onAuthStateChanged");
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
    var db = firebase.database();
    var currentUserID = firebase.auth().currentUser.uid;
    var user = firebase.auth().currentUser;
    var liveChannelsRef = db.ref('users/' + currentUserID + '/live-channels');
    var userInfoRef = db.ref('users/' + currentUserID);
    var username = "tempUserName";
    
    getActiveChannel(function(activeChannel) {
        window.transient = new Transient(activeChannel);
        window.transient.loadMessages(activeChannel);
        //window.transient = new Transient('-L-Jkdt8gD0d8TbuYLDl');
        //window.transient.loadMessages('-L-Jkdt8gD0d8TbuYLDl');
    });
    
    getActiveChannel(function(activeChannel) {
        window.transient = new Transient(activeChannel);
        window.transient.loadMessages(activeChannel);
    });
    
    userInfoRef.once('value', function(snapshot) {
       user.updateProfile({
          displayName: snapshot.val()['username']
        }).then(function() {
          // Update successful.
        }).catch(function(error) {
          // An error happened.
        });
    
        var userImage = document.getElementById('user-pic');
        var imageUrl = snapshot.val()['photoURL'];
        
        if (imageUrl) {
            userImage.src = snapshot.val()['photoURL'];
        }
        else {
            userImage.src = 'https://firebasestorage.googleapis.com/v0/b/transient-318de.appspot.com/o/img_avatar.png?alt=media&token=3b3c7b4d-8503-49d2-99db-ddf578c0fa57';
        }
    });
    
    
    liveChannelsRef.once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var channelHash = childSnapshot.val();
            var chatRef = db.ref('channels/' + channelHash);
            console.log( 'snapshot' + JSON.stringify(childSnapshot));
            chatRef.once('value', function(snapshot) {
                var channelName = snapshot.val()["channelName"];
                    $("#live-channels-list").append(
                        "<div class='channel-button' data-up='" + channelName.replace(/ /g,"-") + "'" + " id='" + channelName + "'" + " data-hash='" + channelHash + "'> " + channelName + " </div>"
                    )
            })
        });
    });
}

var getActiveChannel = function(callback) {
    console.log("Called getActiveChannel().");
    var currentUserID = firebase.auth().currentUser.uid;
    var db = firebase.database();
    var userLiveChannelsRef = firebase.database().ref('users/' + currentUserID + '/live-channels');

    var activeChannel; 
    userLiveChannelsRef.limitToFirst(1).once("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            activeChannel = childSnapshot.val();    
            console.log("Active channel: " + activeChannel);
            callback(activeChannel);
        }); 
    }, function(error) {
        console.log("Read failed.");
        // TODO: The user hasn't joined any live channels yet. Within this block,
        // dispaly the default empty channel.
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
  $("#modal-delete-channel").hide();
  $("#modal-invite-link").hide();
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
    var newLiveChannelRef = currentUserLiveChannelsRef.push("");    //????

    // TODO: Add new channel to "liveChannels" partition 

    // TODO: 
    // 1. Swap the chat box to the created channel
//    $("#myModal").hide();
    $("#modal-create-channel").hide();
    $("#modal-delete-channel").hide();
    $("#modal-join-channel").hide();
    $("#modal-invite-link").show();


    // 2. Display modal with name generated string for the channel creator to copy + share
    var channelHash = newLiveChannelRef.key;
    currentUserLiveChannelsRef.child(channelHash).set(channelHash);  
    var channelListRef = db.ref('channels/' + channelHash);
    
    
    channelListRef.set({
        channelName: channelName,
        hash: channelHash
    });
    
    channelListRef.child("participants").child(currentUserID).set(currentUserID);

    // 3. Display the created channel underneath "Live Channels" section
    $("#live-channels-list").append(
        "<div class='channel-button' data-up='" + channelName.replace(/ /g,"-") + "'" + " id='" + channelName + "'" + " data-hash='" + channelHash + "'> " + channelName + " </div>"
    ) 
    
    if (!window.transient) {
        window.transient = new Transient(channelHash);
        window.transient.loadMessages(channelHash)
    }
    
    $('#channel-invite-link').val(channelHash);
    
    $('#channel-invite-link').on('click', function(){
        var copyText = document.getElementById('#channel-invite-link');
        copyText.select();
        document.execCommand("Copy");
        alert("Copied the text: " + copyText.value);
    });
});


$("#delete-channel").click(function() {
    console.log('deleting channel...');

    var db = firebase.database();
    var channelName = $('.channel-button.active').attr('data-up');
    var currentUserID = firebase.auth().currentUser.uid;
    //var currentUserLiveChannelsRef = db.ref('users/' + currentUserID + '/live-channels/' + channelName);
    var channelHash = $('.channel-button.active').attr('data-hash');;
    $('#channel-button[data-up="' + channelName + ']').remove();
    removeUserFromChannel(channelHash, currentUserID, db);
    $("#live-channels-list").find("[data-hash='" + channelHash + "']").remove();

    $("#myModal").hide();
    $("#modal-create-channel").hide();
    $("#modal-delete-channel").hide();
    $("#modal-join-channel").hide();
    $("#modal-invite-link").hide();

})


$("#join-channel").click(function() {
    var db = firebase.database()
    var currentUserID = firebase.auth().currentUser.uid;
    
    var hashCode = document.querySelector('#chat-hash').value;
    var channelsRef = db.ref('channels');
    var channelToJoin = db.ref('users/' + currentUserID + "/live-channels/" + hashCode);
    var alreadyInChannel = false;
    
//    console.log(userIsAlreadyInChat(hashCode, currentUserID, db));

    $("#myModal").hide();
    $("#modal-create-channel").hide();
    $("#modal-delete-channel").hide();
    $("#modal-join-channel").hide();
    $("#modal-invite-link").hide();
    
    // Javascript shouldn't be forced to execute synchronously / top-down visually, so below code is bad.
    // Learn more at: "callbackhell.com"
    doesChannelExistFunction(function(doesChannelExist) {
        if (!doesChannelExist) {
            console.log("The channel the user is trying to join doesn't exist.");
        }
        else {
            getChannelNameFunction(function(channelName) {
                if (!channelName) { 
                    return;
                }
                else {
                    isUserAlreadyInChatFunction(function(isAlreadyInChat) {
                        if (isAlreadyInChat) { 
                            console.log("The user is already in this channel.");
                            return; 
                        }
                        else {
                            addUserToChannel(hashCode, channelName, currentUserID, db);
                            $("#live-channels-list").append(
                            "<div class='channel-button' data-up='" + channelName.replace(/ /g,"-") + "'" + " id='" + channelName + "'" + " data-hash='" + hashCode + "'> " + channelName + " </div>"); 
                        }
                    }, currentUserID, hashCode);
                }
            }, hashCode);
        }
    }, hashCode);
});

var doesChannelExistFunction = function(callback, channelHash) {
    var doesChannelExist;
    firebase.database().ref('channels').once("value").then(function(snapshot) {
        doesChannelExist = snapshot.hasChild(channelHash);
        callback(doesChannelExist);
    });
}

var getChannelNameFunction = function(callback, channelHash) {
    var channelName;

    firebase.database().ref('channels').once("value").then(function(snapshot) {
        channelName = snapshot.val()[channelHash]["channelName"];
        console.log("Channel name: " + channelName);
        callback(channelName);
    });
}

var isUserAlreadyInChatFunction = function(callback, uid, channelName) {
    var userChannelsRef = firebase.database().ref('users/' + uid + '/live-channels');
    var isAlreadyInChat; 

    userChannelsRef.once("value").then(function(snapshot) {
        isAlreadyInChat = snapshot.hasChild(channelName); 
        callback(isAlreadyInChat);
    }, function(error) {
        console.log("The read failed: " + error.code);
    });
}
   
function addUserToChannel(channelName, chatName, uid, db) {
    console.log("Adding user to the channel.");
    // add to channel participants list
    db.ref('channels').child(channelName).child("participants").push(uid, function(error) {
        if (error) { console.log("Push() called unsuccessfully."); }
    });
    
    // add the channel to the person's list
    db.ref('users/' + uid).child('live-channels').child(channelName).set(channelName, function(error) {
        if (error) { console.log("Push() called unsuccessfully."); }
    });
}

function removeUserFromChannel(channelName, uid, db) {
    // remove participant from the channel list
    db.ref('channels').child(channelName).child("participants").child(uid).remove();
    
    // remove the channel from the user
    db.ref('users/' + uid).child('live-channels').child(channelName).remove();
}

var doesChannelExistFunction = function(callback, channelHash) {
    var doesChannelExist;
    firebase.database().ref('channels').once("value").then(function(snapshot) {
        doesChannelExist = snapshot.hasChild(channelHash);
        callback(doesChannelExist);
    });
}

var getChannelNameFunction = function(callback, channelHash) {
    var channelName;

    firebase.database().ref('channels').once("value").then(function(snapshot) {
        channelName = snapshot.val()[channelHash]["channelName"];
        console.log("Channel name: " + channelName);
        callback(channelName);
    });
}

var isUserAlreadyInChatFunction = function(callback, uid, channelName) {
    var userChannelsRef = firebase.database().ref('users/' + uid + '/live-channels');
    var isAlreadyInChat; 

    userChannelsRef.once("value").then(function(snapshot) {
        isAlreadyInChat = snapshot.hasChild(channelName); 
        callback(isAlreadyInChat);
    }, function(error) {
        console.log("The read failed: " + error.code);
    });
}

var getActiveChannel = function(callback) {
    console.log("Called getActiveChannel().");
    var currentUserID = firebase.auth().currentUser.uid;
    var db = firebase.database();
    var userLiveChannelsRef = firebase.database().ref('users/' + currentUserID + '/live-channels');

    var activeChannel; 
    userLiveChannelsRef.limitToFirst(1).once("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            activeChannel = childSnapshot.val();    
            console.log("Active channel: " + activeChannel);
            callback(activeChannel);
        }); 
    }, function(error) {
        console.log("Read failed.");
        // TODO: The user hasn't joined any live channels yet. Within this block,
        // dispaly the default empty channel.
    });
}
