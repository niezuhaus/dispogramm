package net.fahrradexpress.backend.tools;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;

import lombok.AllArgsConstructor;
import lombok.Data;
import net.fahrradexpress.backend.dtos.DateDto;

public class DateTools {

	public static ZonedDateTime getLocalZonedDateTime(ZonedDateTime dateTime) {
		return dateTime.withZoneSameInstant(ZoneId.systemDefault());
	}

	public static String getLocalDateTimeString(ZonedDateTime dateTime) {
		return getLocalZonedDateTime(dateTime).toLocalDateTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + ".000";
	}

	public static ZonedDateTime getLocalZonedDateTimeDayBegin(ZonedDateTime dateTime) {
		return getLocalZonedDateTime(dateTime).with(LocalTime.MIN);
	}
	
	public static DoubleDate getOneDaySpan(DateDto dateDto) {
		return getOneDaySpan(dateDto.getDate());
	}

	public static DoubleDate getOneDaySpan(ZonedDateTime date) {
		date = getLocalZonedDateTimeDayBegin(date);
		ZonedDateTime end = date.plusDays(1);

		return new DoubleDate(date, end);
	}

	public static DoubleDate getMonthSpan(ZonedDateTime date) {
		date = getLocalZonedDateTimeDayBegin(date);
		ZonedDateTime start = date.with(TemporalAdjusters.firstDayOfMonth());
		ZonedDateTime end = date.with(TemporalAdjusters.lastDayOfMonth()).plusDays(1);

		return new DoubleDate(start, end);
	}

	public static boolean sameDayOfWeek(ZonedDateTime date1, ZonedDateTime date2) {
		return getLocalZonedDateTime(date1).getDayOfWeek() == getLocalZonedDateTime(date2).getDayOfWeek();
	}

	public static boolean sameDay(ZonedDateTime date1, ZonedDateTime date2) {
		if (date1 == null || date2 == null)
			return false;
		DoubleDate monthSpan = getOneDaySpan(date1);
		return date2.isAfter(monthSpan.getStart()) && date2.isBefore(monthSpan.getEnd());
	}

	public static boolean sameMonth(ZonedDateTime date1, ZonedDateTime date2) {
		if (date1 == null || date2 == null)
			return false;
		DoubleDate monthSpan = getMonthSpan(date1);
		return date2.isAfter(monthSpan.getStart()) && date2.isBefore(monthSpan.getEnd());
	}

	public static boolean dateIn(ZonedDateTime date, DoubleDate dateSpan) {
		return date != null ? date.isAfter(dateSpan.getStart()) && date.isBefore(dateSpan.getEnd()) : false;
	}

	@Data
	@AllArgsConstructor
	public static class DoubleDate {

		private ZonedDateTime start;

		private ZonedDateTime end;
	}

}
