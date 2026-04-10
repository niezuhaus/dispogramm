package net.fahrradexpress.backend.enums;

import lombok.Getter;

public enum Weekday {

	MONDAY("Montag", 1),
	TUESDAY("Dienstag", 2),
	WEDNESDAY("Mittwoch", 3),
	THURSDAY("Donnerstag", 4),
	FRIDAY("Freitag", 5);
	
	@Getter
	private int day;
	
	@Getter
	private String name;
	
	private Weekday(String name, int day) {
		this.name = name;
		this.day = day;
	}
}
