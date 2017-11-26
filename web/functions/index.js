const functions = require('firebase-functions');
const sentencer = require('sentencer');

/* 
 * Generates a random channel name in the form "<adjective> <noun>" for the
 * newly created channel. 
 */ 
exports.generate = functions.database.ref('/users/{user-hash}/live-channels/{channel-hash}')
    .onWrite(event => {
        // Guard database writes to prevent unintended recursive calls. 
        if (event.data.previous.exists() || !event.data.exists()) { return null; }
        
        var randomName = sentencer.make("{{ adjective }} {{ noun }}");
        console.log("Generated channel name: " + randomName);
        var adminRef = event.data.adminRef;

        // Update the placeholder channel name to the randomly generated one.
        return adminRef.set(randomName);
    });
