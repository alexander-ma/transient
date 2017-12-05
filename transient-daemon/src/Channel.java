
import java.util.List;
import java.util.ArrayList;
import java.util.Timer;
import java.util.Date;
import java.util.TimerTask;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseReference;


public class Channel {

  private static final DateTimeFormatter DATABASE_DATE_FORMAT =
    DateTimeFormatter.ofPattern("MM/dd/yyyy HH:mm");
  private static final String CHANNEL_STATE_DB_KEY =
    "state";
  private static final String TIME_MIDNIGHT =
    " 00:00";
  private static final ZoneId LOCAL_TIME_ZONE =
    ZoneId.of("America/Chicago");


  private DatabaseReference channelRef;
  private DataSnapshot data;
  private ChannelState state, stateSnapshot;
  private Timer timer;

  private LocalDateTime deathDate;
  private List<TimeRange> activeTimes;

  // TODO: periodically check accuracy

  public Channel(DataSnapshot snapshot) throws IllegalArgumentException {
    if (snapshot == null) {
      throw new IllegalArgumentException("Internal Error: null datasnap shot for channel.");
    }

    this.activeTimes = new ArrayList<TimeRange>();
    this.timer = new Timer(true);
    this.data = snapshot;
    this.channelRef = snapshot.getRef();

    evalChannelData();
    setStateFirebase(this.state);
    evalTimers();
  }

  private void setDeathDate() {
    DataSnapshot deathDateData = data.child("deathDate");
    String deathDateStr = (String) deathDateData.getValue();

    if (deathDateStr == null || deathDateStr.isEmpty()) {
      deathDate = LocalDateTime.MAX;
      return;
    }

    try {
      deathDate = LocalDateTime.parse(deathDateStr + TIME_MIDNIGHT, DATABASE_DATE_FORMAT);
    } catch (Exception e) {
      throw new IllegalArgumentException("Illegal death date: " + deathDateStr);
    }
  }

  private void setActiveTimes() {
    Iterable<DataSnapshot> activeWeekdaysData = data.child("activeTimes").getChildren();

    List<TimeRange> newActiveTimes = new ArrayList<TimeRange>();
    String weekday = "",
           timeRange = "";

    try {
      for (DataSnapshot snapshot : activeWeekdaysData) {
        weekday = snapshot.getKey();
        timeRange = (String) snapshot.getValue();

        newActiveTimes.add(new TimeRange(weekday, timeRange));
      }
    } catch (Exception e) {
      throw new IllegalArgumentException("Illegal time range format in activeTimes.\n\t\tKey: "
                                         + weekday + "\n\t\tValue: " + timeRange);
    }

    activeTimes = newActiveTimes;
  }

  private ChannelState determineState() {
    if (LocalDateTime.now().isAfter(deathDate) ||
        LocalDateTime.now().isEqual(deathDate)) {
      return ChannelState.DEAD;
    }

    if (activeTimes.isEmpty()) {
      return ChannelState.ACTIVE;
    }

    for (TimeRange range : activeTimes) {
      if (range.isInRange()) {
        return ChannelState.ACTIVE;
      }
    }

    return ChannelState.INACTIVE;
  }

  private synchronized void evalTimers() {
    LocalDateTime timerLDT = LocalDateTime.now();

    this.stateSnapshot = this.state;

    if (stateSnapshot == ChannelState.ACTIVE) {
      timerLDT = LocalDateTime.MIN;

      // Find the TimeRange with the latest end time that is
      // also currently in its valid active range
      for (TimeRange timeRange : activeTimes) {
        if (timeRange.isInRange()) {
          LocalDateTime ldt = timeRange.getNextEndDate();

          if (ldt.isAfter(timerLDT)) {
            timerLDT = ldt;
          }
        }
      }
      
      // In the case that there are no active ranges assume always active
      // Set to max to death date calculation is still valid
      if (timerLDT.isEqual(LocalDateTime.MIN)) {
        timerLDT = LocalDateTime.MAX;
      }
    } else if (stateSnapshot == ChannelState.INACTIVE) {
      timerLDT = LocalDateTime.MAX;

      // Find the next next date and time this channel will be active
      for (TimeRange timeRange : activeTimes) {
        LocalDateTime ldt = timeRange.getNextStartDate();

        if (ldt.isBefore(timerLDT)) {
          timerLDT = ldt;
        }
      }

      if (timerLDT.isEqual(LocalDateTime.MAX)) {
         throw new IllegalArgumentException("Illegal active range in database");
      }
    } else if (stateSnapshot == ChannelState.DEAD) {
      throw new IllegalArgumentException("Illegal modification of already dead channel.");
    }
    timerLDT = timerLDT.withSecond(0);

    
    ZonedDateTime timerZDT = timerLDT.atZone(LOCAL_TIME_ZONE);
    Date timerDate = Date.from(timerZDT.toInstant());
    TimerTask task = null;
    ChannelState nextState = null;

    if (timerLDT.isAfter(deathDate) || timerLDT.isEqual(deathDate)) {
      task = new KillTask(this);
      nextState = ChannelState.DEAD;
    } else {
      if (stateSnapshot == ChannelState.ACTIVE)  {
        task = new DeactivationTask(this);
        nextState = ChannelState.INACTIVE;
      } else {
        task = new ActivationTask(this);
        nextState = ChannelState.ACTIVE;
      }
    }

    System.out.println("INFO    - Timer set for channel " + data.getKey() + ".\n" +
                       "\t\tNext State: " + nextState.getValue() + "\n" +
                       "\t\tDate: " + timerDate);

    this.timer.schedule(task, timerDate);

    // State changed while processing this state change
    // Try again
    if (this.determineState() != stateSnapshot) {
      reevalChannelData();
      reevalTimers();
    }
  }

  private synchronized void reevalTimers() {
    timer.cancel();
    timer.purge();

    timer = new Timer();

    evalTimers();
  }

  private synchronized void reevalChannelData() throws IllegalArgumentException {
    // TODO: implement for mutable channel functionality

    evalChannelData();
  }

  private synchronized void evalChannelData() throws IllegalArgumentException {
    setDeathDate();
    setActiveTimes();

    this.state = determineState();
  }

  public synchronized void setChannelData(DataSnapshot snapshot) throws IllegalArgumentException {
    this.data = snapshot;
    this.channelRef = snapshot.getRef();

    evalChannelData();
    setStateFirebase(this.state);
    reevalTimers();
  }

  private void logStateChange() {
    System.out.println("INFO    - " + data.getKey() + " now " + state.getValue());
  }

  private void setStateFirebase(ChannelState state) {
    channelRef.child(CHANNEL_STATE_DB_KEY)
              .setValueAsync(state.getValue());
    logStateChange();
  }

  public synchronized void setState(ChannelState state) {
    this.state = state;

    setStateFirebase(state);
    reevalTimers();
  }

  public enum ChannelState {
    ACTIVE("active"),
    INACTIVE("inactive"),
    DEAD("dead");

    private final String v;

    private ChannelState(String v) { this.v = v; }

    public String getValue() { return v; }
  }

  @Override
  protected void finalize() {
    // Ensures all timers are dead before garbage collection
    if (timer != null) {
      try {
        timer.cancel();
        timer.purge();
      } catch (Exception e) {;}
    }
  }
}
