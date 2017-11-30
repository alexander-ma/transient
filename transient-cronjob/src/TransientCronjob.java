import java.util.Timer;
import java.util.TimerTask;
import java.io.FileInputStream;

import com.google.auth.oauth2.GoogleCredentials;

import com.google.firebase.FirebaseOptions;
import com.google.firebase.FirebaseApp;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.DatabaseReference;


public class TransientCronjob extends TimerTask {
  /* Settings */
  private static final String AUTHENTICATION_KEY_FILE =
    "resources/transient-318de-firebase-key.json";
  private static final String DATABASE_URL =
    "https://transient-318de.firebaseio.com";
  private static final boolean RUN_AS_DAEMON = true;
  // In milliseconds
  private static final long DEFAULT_JOB_INTERVAL = 1500;

  private final FirebaseDatabase database;


  
  public TransientCronjob() {
    FileInputStream serviceAccount = null;
    FirebaseOptions options = null;

    try {
      serviceAccount = new FileInputStream(AUTHENTICATION_KEY_FILE);
    } catch (Exception e) {
      System.out.println("Error loading service account key file:");
      System.out.println(e.getMessage());
      System.exit(0);
    }

    try {
      options = new FirebaseOptions.Builder()
          .setCredentials(GoogleCredentials.fromStream(serviceAccount))
          .setDatabaseUrl(DATABASE_URL)
          .build();
    } catch (Exception e) {
      System.out.println("Error authenticating key with firebase:");
      System.out.println(e.getMessage());
      System.exit(0);
    }

    FirebaseApp.initializeApp(options);
    database = FirebaseDatabase.getInstance();
  }


  private int t = 0;

  @Override
  public void run() {
    System.out.println(t++);

    DatabaseReference ref = database.getReference("users");
  }


  public static void main(String args[]) {
    Object suspensionLock = new Object();
    TimerTask cronjob = new TransientCronjob();
    long interval = DEFAULT_JOB_INTERVAL;

    if (args.length >= 1) {
      try {
        interval = Integer.parseInt(args[0]);
      } catch (Exception e) {;}
    }

    Timer timer = new Timer(RUN_AS_DAEMON);
    timer.scheduleAtFixedRate(cronjob, 0, interval);

    suspend();
  }

  private static void suspend() {
    while(true) {;}
  }
} 
