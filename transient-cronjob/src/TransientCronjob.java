
import java.util.Timer;
import java.util.TimerTask;
import java.io.FileInputStream;

import com.google.firebase.FirebaseOptions;
import com.google.firebase.FirebaseApp;



public class TransientCronjob extends TimerTask {
  /* Settings */
  private static final String AUTHENTICATION_KEY_FILE =
    "resources/transient-318de-firebase-key.json";
  private static final boolean RUN_AS_DAEMON = true;
  private static final long DEFAULT_JOB_INTERVAL = 1000;


  
  @SuppressWarnings( "deprecation" )
  public TransientCronjob() {
    FileInputStream serviceAccount = null;
    FirebaseOptions options = null;

    try {
      serviceAccount = new FileInputStream("resources/transient-318de-firebase-key.json");
    } catch (Exception e) {
      System.out.println("Error loading service account key file:");
      System.out.println(e.getMessage());
      System.exit(0);
    }

    try {
      options = new FirebaseOptions.Builder()
        .setCredential(com.google.firebase.auth.FirebaseCredentials.fromCertificate(serviceAccount))
        .setDatabaseUrl("https://transient-318de.firebaseio.com")
        .build();
    } catch (Exception e) {
      System.out.println("Error authenticating key with firebase:");
      System.out.println(e.getMessage());
      System.exit(0);
    }

      FirebaseApp.initializeApp(options);
  }


  @Override
  public void run() {
  }


  public static void main(String args[]) {
    TimerTask cronjob = new TransientCronjob();
    long interval = DEFAULT_JOB_INTERVAL;

    if (args.length >= 1) {
      try {
        interval = Integer.parseInt(args[0]);
      } catch (Exception e) {;}
    }

    Timer timer = new Timer(RUN_AS_DAEMON);
    timer.scheduleAtFixedRate(cronjob, 0, interval);

  }
} 
