/* Clones the circles making the wave until it fills the entire width of the page. */
$(document).ready(function() {
    var clone = $('.circle');

    for (var i = 0; i < 18; i ++) {
        clone.clone().insertAfter(clone);
    }
});

$('.message a').click(function(){
   $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
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
        var newUserRef = db.ref('users/' + firebaseUser.uid);

        newUserRef.set({
            email: document.querySelector('#email').value,
            username: document.querySelector('#name').value,
            photoURL: 'https://firebasestorage.googleapis.com/v0/b/transient-318de.appspot.com/o/img_avatar.png?alt=media&token=3b3c7b4d-8503-49d2-99db-ddf578c0fa57'
        });
        
        newUserRef.child('live-channels').child('-L-Zk50E41DSZ1kUCYKD').set('-L-Zk50E41DSZ1kUCYKD');

        window.location = 'chat-interface/index.html';
    }
});


document.querySelector('#login').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    // Fetch credentials.
    var email = document.querySelector('#existing_email').value;
    var password = document.querySelector('#existing_password').value;
    var alert = document.getElementById('login-alert');
    
    if (email.length === 0 || password.length === 0) {
        document.getElementById('login-form-error').innerHTML = 'Please enter a valid email/password.';
        alert.style.display = "block"; 
    }
    else {
        firebase.auth().signInWithEmailAndPassword(email, password)
            .catch(function(error) {
                // Login failed.
                var errorCode = error.code;
                var errorMessage = error.message;
                
                alert.style.display = (errorCode.length != 0) ? 'block' : 'none';

                console.log('Error code: ' + errorCode);
                console.log('Error message: ' + errorMessage);

                switch (errorCode) {
                    case 'auth/user-disabled':
                        document.getElementById('login-form-error').innerHTML = 'This email has been disabled, please use another.';
                        break;
                    
                    case 'auth/user-not-found':
                        document.getElementById('login-form-error').innerHTML = 'No user was identified with these credentials.';
                        break;

                    default: 
                        document.getElementById('login-form-error').innerHTML = 'The email/password is incorrect or invalid.';
                        break;
                }
            });
    }
});

// Register a new user.
document.querySelector('#register').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    var name = document.querySelector('#name').value;
    var existing_email = document.querySelector('#email').value;
    var existing_password = document.querySelector('#password').value
    var alert = document.getElementById('register-alert');

    var database = firebase.database();

    if (name.length === 0) {
        document.getElementById('registration-form-error').innerHTML = 'Please enter a name.';
        alert.style.display = 'block'; 
    }
    else if (existing_email.length === 0 || existing_password.length === 0) {
        document.getElementById('registration-form-error').innerHTML = 'Please enter a valid email/password.';
        alert.style.display = 'block';
    }
    else {
        firebase.auth().createUserWithEmailAndPassword(existing_email, existing_password)
            .catch(function(error) {
                // Registration failed.
                var errorCode = error.code;;
                var errorMessage = error.message;

                alert.style.display = (errorCode.length != 0) ? 'block' : 'none';

                console.log('Error code: ' + errorCode);
                console.log('Error message: ' + errorMessage);

                switch (errorCode) {
                    case 'auth/email-already-in-use':
                        document.getElementById('registration-form-error').innerHTML = 'This email is already in use.';
                        break;

                    case 'auth/invalid-email':
                        document.getElementById('registration-form-error').innerHTML = 'Enter a valid email address.';
                        break;

                    case 'auth/operation-not-allowed':
                        document.getElementById('registration-form-error').innerHTML = 'Email/password authentication is not enabled in firebase.';
                        break;

                    case 'auth/weak-password':
                        document.getElementById('registration-form-error').innerHTML = 'Provided password is too weak. Get it on steroids.';
                        break;
                }

           });
    }
});
