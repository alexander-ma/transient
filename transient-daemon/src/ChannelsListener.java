
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.ChildEventListener;
import com.google.firebase.database.DatabaseError;

public class ChannelsListener implements ChildEventListener {

  private final TransientDaemon parent;

  public ChannelsListener(TransientDaemon parent) {
    this.parent = parent;
  }

  @Override
  public void onCancelled(DatabaseError e) {
    System.out.println("Error: API call canceled by Firebase.");
  }

  @Override
  public void onChildAdded(DataSnapshot snapshot, String previousChildName) {
    parent.addChannel(snapshot);
  }

  @Override
  public void onChildRemoved(DataSnapshot snapshot) {
    parent.removeChannel(snapshot);
  }

  /* Dont care about these functions */
  @Override
  public void onChildChanged(DataSnapshot snapshot, String previousChildName) {
    parent.modifyChannel(snapshot, previousChildName);
  }
  @Override
  public void onChildMoved(DataSnapshot snapshot, String previousChildName) {;}
}
