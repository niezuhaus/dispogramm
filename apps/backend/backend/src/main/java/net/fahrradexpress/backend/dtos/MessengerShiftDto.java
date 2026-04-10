package net.fahrradexpress.backend.dtos;

import java.time.ZonedDateTime;
import java.util.List;

import lombok.Data;

@Data
public class MessengerShiftDto implements BaseDto {

	private String id;
	
	private MessengerDto messenger;
	
	private ZonedDateTime start;
	
	private ZonedDateTime end;
	
	private int type;
	
	private List<JobDto> jobs;
	
}
