
import java.lang.IllegalArgumentException;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.time.format.DateTimeFormatter;

public class TimeRange {

  private static final int START_RANGE = 0,
                           END_RANGE = 1;
  private static final int SECONDS_PER_HOUR = 3600,
                           SECONDS_PER_MINUTE = 60,
                           MINUTES_PER_HOUR = 60;

  private DayOfWeek weekday;
  /* Held in seconds since midnight */
  private int start,
              end;

  public TimeRange(String startWeekday, String timeRange) throws IllegalArgumentException {
    parseWeekday(startWeekday);
    parseTimeRange(timeRange);
  }

  private void parseWeekday(String weekday) {
    weekday = weekday.toUpperCase();
    this.weekday = DayOfWeek.valueOf(weekday);
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


    start = (startTime.getHour() * 60 + startTime.getMinute()) * 60;
    end = (endTime.getHour() * 60 + endTime.getMinute()) * 60;

    if (start >= end) {
      throw new IllegalArgumentException();
    }
  }

  /* Returns what minute it is with a given value of seconds past midnight */
  private int getMinute(int secsPastMidnight) {
    return (secsPastMidnight/SECONDS_PER_MINUTE) % MINUTES_PER_HOUR;
  }

  /* Returns what minute it is with a given value of seconds past midnight */
  private int getHour(int secsPastMidnight) {
    return secsPastMidnight / SECONDS_PER_HOUR;
  }

  /* Returns a LocalDateTime object correspoding to the next day weekday at the specified
     number of seconds past midnight

     Note: seconds are truncated and set to 0. This is due to Transient's minute resolution
           active/inactive timers
   */
  private LocalDateTime getNextWeekdayAtTime(DayOfWeek weekday, int secsPastMidnight) {
    return LocalDateTime.now().with(TemporalAdjusters.next(weekday))
                              .withHour(getHour(start))
                              .withMinute(getMinute(start))
                              .withSecond(0);
  }

  /* Returns a LocalDateTime object correspoding to today at the given number of seconds past 
     midnight
   */
  private LocalDateTime getTodayAtTime(int secs) {
    return LocalDateTime.now().with(TemporalAdjusters.next(weekday))
                              .withHour(getHour(secs))
                              .withMinute(getMinute(secs))
                              .withSecond(0);
  }

  public Boolean isInRange() {
    LocalDateTime now = LocalDateTime.now();

    DayOfWeek day = now.getDayOfWeek();
    int secsPastMidnight = (now.getHour() * 60 + now.getMinute()) * 60 + now.getSecond();

    if (day.equals(weekday) &&
        secsPastMidnight >= start &&
        secsPastMidnight <= end) {
      return true;
    }

    return false;
  }

  public LocalDateTime getNextStartDate() {
    LocalDateTime now = LocalDateTime.now();
    int secsPastMidnight = (now.getHour() * 60 + now.getMinute()) * 60 + now.getSecond();

    if (!now.getDayOfWeek().equals(weekday)) {
        return getNextWeekdayAtTime(weekday, start);
    }

    if (secsPastMidnight >= start) {
        return getNextWeekdayAtTime(weekday, start);
    }

    return getTodayAtTime(start);
  }

  public LocalDateTime getNextEndDate() {
    LocalDateTime now = LocalDateTime.now();
    int secsPastMidnight = (now.getHour() * 60 + now.getMinute()) * 60 + now.getSecond();

    if (!now.getDayOfWeek().equals(weekday)) {
        return getNextWeekdayAtTime(weekday, end);
    }

    if (secsPastMidnight >= end) {
        return getNextWeekdayAtTime(weekday, end);
    }

    return getTodayAtTime(start);
  }

  @Override
  public String toString() {
    return "(Start: " + start + ", End: " + end + ")";
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
