package net.fahrradexpress.backend.dtos.schedule;

import java.time.ZonedDateTime;
import java.util.List;

import lombok.Data;
import net.fahrradexpress.backend.dtos.BaseDto;
import net.fahrradexpress.backend.dtos.MessengerDto;

@Data
public class ScheduledShiftDto implements BaseDto {
	
	private String id;

	private String name;
	
	private ZonedDateTime start;
	
	private ZonedDateTime end;
	
	private int slots;
	
	private List<MessengerDto> riding;
	
	private List<MessengerDto> available;
	
	private List<MessengerDto> notAvailable;
}
