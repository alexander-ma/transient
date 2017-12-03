
import java.lang.IllegalArgumentException;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.time.format.DateTimeFormatter;

public class TimeRange {

  private static final int START_RANGE = 0,
                           END_RANGE = 1;

  private DayOfWeek weekday;
  /* Held in minutes since midnight */
  private long start,
               end;

  public TimeRange(String startWeekday, String timeRange) throws IllegalArgumentException {
    parseWeekday(startWeekday);
    parseTimeRange(timeRange);
  }

  private void parseWeekday(String weekday) {
    this.weekday = DayOfWeek.valueOf(weekday);
  }

  private void parseTime(String time) {
  }

  private void parseTimeRange(String timeRange) {
    String[] splitRange = timeRange.split("-");
    if (splitRange.length != 2) {
      throw new IllegalArgumentException("Illegal Argument: invalid time range for "
                                         + weekday.getValue() + ": " + timeRange);
    }
    String startTimeStr = splitRange[START_RANGE];
    String endTimeStr = splitRange[END_RANGE];

    Time startTime = new Time(startTimeStr);
    Time endTime = new Time(endTimeStr);


    start = startTime.getHour() * 60 + startTime.getMinute();
    end = endTime.getHour() * 60 + endTime.getMinute();

    if (start >= end) {
      throw new IllegalArgumentException();
    }
  }

  public Boolean isInRange() {
    LocalDateTime now = LocalDateTime.now();

    DayOfWeek day = now.getDayOfWeek();
    long minSinceMidnight = now.getHour()*60 + now.getMinute();

    if (minSinceMidnight >= start && minSinceMidnight <= end) {
      return true;
    }

    return false;
  }

  public LocalDateTime getNextStartDate() {
    LocalDateTime now = LocalDateTime.now();
    long minSinceMidnight = now.getHour()*60 + now.getMinute();

    if (now.getDayOfWeek().equals(weekday)) {

      if (minSinceMidnight >= start) {
        return now.with(TemporalAdjusters.next(weekday))
                  .withHour((int) start/60)
                  .withMinute((int) start%60);
      } else {
        return now.withHour((int) start/60)
                  .withMinute((int) start%60);
      }
    } else {
      return now.with(TemporalAdjusters.next(weekday))
                .withHour((int) start/60)
                .withMinute((int) start%60);
    }
  }

  public LocalDateTime getNextEndDate() {
    LocalDateTime now = LocalDateTime.now();
    long minSinceMidnight = now.getHour() * 60 + now.getMinute();

    if (now.getDayOfWeek().equals(weekday)) {

      if (minSinceMidnight >= end) {
        return now.with(TemporalAdjusters.next(weekday))
                  .withHour((int) end/60)
                  .withMinute((int) end%60);
      } else {
        return now.withHour((int) end/60)
                  .withMinute((int) end%60);
      }
    } else {
      return now.with(TemporalAdjusters.next(weekday))
                .withHour((int) end/60)
                .withMinute((int) end%60);
    }
  }

  private class Time {

    private static final int HOURS = 0,
                             MINUTES = 1;

    private int hour, min;

    /* Format for time is HH:mm */
    public Time(String time) throws IllegalArgumentException {
      if (time == null) {
        throw new IllegalArgumentException("Illegal Argument: time is null");
      }

      parseTime(time);

      if (hour < 0 || hour > 24) {
        throw new IllegalArgumentException("Illegal Argument: hour value for time is out of range: " + hour);
      } else if (min < 0 || min > 60) {
        throw new IllegalArgumentException("Illegal Argument: minute value for time is out of range: " + min);
      }
    }

    private void parseTime(String time) {
      String[] splitTime = time.split(":");

      if (splitTime.length > 2) {
        throw new IllegalArgumentException("Illegal Argument: seconds should not be included in time range data");
      } else if (splitTime.length < 2) {
        throw new IllegalArgumentException("Illegal Argument: time input is invalid: " + time);
      }

      try {
        hour = Integer.parseInt(splitTime[HOURS]);
      } catch (Exception e) {
        throw new IllegalArgumentException("Illegal Argument: hours value must be an integer value: " + splitTime[HOURS]);
      }

      try {
        min = Integer.parseInt(splitTime[MINUTES]);
      } catch (Exception e) {
        throw new IllegalArgumentException("Illegal Argument: minutes value much be an interger value: " + splitTime[MINUTES]);
      }
    }

    public int getHour() { return hour; }

    public int getMinute() { return min; }
  }
}
