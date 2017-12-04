
import java.util.TimerTask;


public class DeactivationTask extends TimerTask {

  private final Channel channel;

  private DeactivationTask() {
    channel = null;
  }

  public DeactivationTask(Channel channel) {
    this.channel = channel;
  }

  @Override
  public void run() {
    channel.setState(Channel.ChannelState.INACTIVE);
  }
}
