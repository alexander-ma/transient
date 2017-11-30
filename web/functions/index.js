const functions = require('firebase-functions');
const sentencer = require('sentencer');

/* 
 * Generates a random anonymous name in the form "<adjective> <noun>" for the
 * newly created user. 
 */ 
exports.generateAnonymousName = functions.database.ref('/users/{user-hash}')
    .onCreate(event => {
        // Guard database writes to prevent unintended recursive calls. 
        if (event.data.previous.exists() || !event.data.exists()) { return null; }
        
        var randomName = sentencer.make("{{ adjective }} {{ noun }}");
        console.log("Generated user anonymous name: " + randomName);
        var adminRef = event.data.adminRef;

        // Update the placeholder channel name to the randomly generated one.
        //return adminRef.set({ anonymousName : randomName });
        //return adminRef.push({ anonymousName : randomName });
        return adminRef.update({anonymousName : randomName });
    });