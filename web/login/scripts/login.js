$('.message a').click(function(){
   $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
});

// Sign in users.
firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    // Handle errors here.
    var errorCode = error.code;
    console.log(error.Message);
});

// Triggers when the auth state change for instance when the user signs-in or signs-out.
//FriendlyChat.prototype.onAuthStateChanged = function(user) {
firebase.auth().onAuthStateChanged = function(user) {
    console.log('onAuthStateChanged called.');
    window.location = (user) ? 'chat/chat.html' : 'index.html';
};
