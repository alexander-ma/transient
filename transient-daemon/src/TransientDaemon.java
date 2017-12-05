
import java.util.HashMap;
import java.util.Map;
import java.io.FileInputStream;

import com.google.auth.oauth2.GoogleCredentials;

import com.google.firebase.FirebaseOptions;
import com.google.firebase.FirebaseApp;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.DataSnapshot;


public class TransientDaemon extends Thread {
  /* Settings */
  private static final String AUTHENTICATION_KEY_FILE =
    "resources/transient-318de-firebase-key.json";
  private static final String DATABASE_URL =
    "https://transient-318de.firebaseio.com";
  private static final String CHANNELS_DATABASE_PATH =
    "channels";
  private static final boolean RUN_AS_DAEMON = false;

  private Map<String, Channel> channels;

  
  public TransientDaemon() {
    FileInputStream serviceAccount = null;
    FirebaseOptions options = null;

    try {
      serviceAccount = new FileInputStream(AUTHENTICATION_KEY_FILE);
    } catch (Exception e) {
      System.out.println("ERROR   - failed to load service account key file:");
      System.out.println("\t\t" + e.getMessage());
      System.exit(0);
    }

    try {
      options = new FirebaseOptions.Builder()
          .setCredentials(GoogleCredentials.fromStream(serviceAccount))
          .setDatabaseUrl(DATABASE_URL)
          .build();
    } catch (ArithmeticException e) {
    }
    catch (Exception e) {
      System.out.println("ERROR   - failed to authenticate credentials with firebase:");
      System.out.println("\t\t" + e.getMessage());
      System.exit(0);
    }

    // Initialize the firebase app
    FirebaseApp.initializeApp(options);

    channels = new HashMap<String, Channel>();

    // Add an event listener on the channels key in firebase
    FirebaseDatabase.getInstance()
        .getReference(CHANNELS_DATABASE_PATH)
        .addChildEventListener(new ChannelsListener(this));

    this.setDaemon(RUN_AS_DAEMON);
    this.start();
  }

  public void addChannel(DataSnapshot snapshot) {
    String key = snapshot.getKey();

    System.out.println("INFO    - Channel added: " + key);

    if (channels.containsKey(key)) {
      System.out.println("WARNING - Add request attempted for channel with duplicate key." +
                         "\n\t\tKey: " + key);
      return;
    }

    Channel c = null;
    try {
      c = new Channel(snapshot);
    } catch (Exception e) {
      System.out.println("ERROR   - " + e.getMessage());
    }

    channels.put(key, c);
  }

  public void modifyChannel(DataSnapshot snapshot, String oldKey) {
    // TODO: implement this to allow mutable channels feature
  }

  public void removeChannel(DataSnapshot snapshot) {
    String key = snapshot.getKey();

    System.out.println("INFO    - Channel removed: " + key);

    if (!channels.containsKey(key)) {
      System.out.println("WARNING - remove request attempted channel not found in internal channels list." +
                         "\n\t\tKey: " + key);
      return;
    }

    channels.remove(key);
  }

  @Override
  public void run() {
    this.suspendThread();
  }

  private void suspendThread() {
    while(true) {;}
  }


  public static void main(String args[]) {
    TransientDaemon daemon = new TransientDaemon();
  }
} 
