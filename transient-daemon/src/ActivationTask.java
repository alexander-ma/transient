
import java.util.TimerTask;


public class ActivationTask extends TimerTask {

  private final Channel channel;

  private ActivationTask() {
    channel = null;
  }

  public ActivationTask(Channel channel) {
    this.channel = channel;
  }

  @Override
  public void run() {
    // TODO: reentrant lock here so task can be abandonded if lock is held already?
    channel.setState(Channel.ChannelState.ACTIVE);
  }
}
