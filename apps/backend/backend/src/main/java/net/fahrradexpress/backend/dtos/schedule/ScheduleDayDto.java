package net.fahrradexpress.backend.dtos.schedule;

import java.time.ZonedDateTime;
import java.util.List;

import lombok.Data;
import net.fahrradexpress.backend.dtos.BaseDto;

@Data
public class ScheduleDayDto implements BaseDto {

	private String id;
	
	private ZonedDateTime date;
	
	private List<ScheduledShiftDto> shifts;	
	
}
