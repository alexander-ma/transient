
import java.util.TimerTask;


public class KillTask extends TimerTask {

  private final Channel channel;

  private KillTask() {
    channel = null;
  }

  public KillTask(Channel channel) {
    this.channel = channel;
  }

  @Override
  public void run() {
    channel.setState(Channel.ChannelState.DEAD);
  }
}
