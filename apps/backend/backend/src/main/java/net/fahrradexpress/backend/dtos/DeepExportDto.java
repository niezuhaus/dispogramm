package net.fahrradexpress.backend.dtos;

import java.time.ZonedDateTime;
import java.util.List;

import lombok.Data;

@Data
public class DeepExportDto implements BaseDto{
	
	private String id;
	
	private ZonedDateTime date;

	private List<DoubleStringDto> exportColumns;
	
}
