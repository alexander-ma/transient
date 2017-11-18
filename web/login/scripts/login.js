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
  if (user) { 
    // User is signed in, redirect user to the chat page.
    window.location = 'chat.html';
  } else { 
    // User is signed out!
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};
