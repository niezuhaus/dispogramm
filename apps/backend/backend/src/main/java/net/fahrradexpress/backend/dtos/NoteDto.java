package net.fahrradexpress.backend.dtos;

import java.time.ZonedDateTime;

import lombok.Data;

@Data
public class NoteDto implements BaseDto {

	private String id;
	
	private MessengerDto creator;
	
	private ZonedDateTime date;
	
	private String text;

	private boolean done;
	
}
