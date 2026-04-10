package net.fahrradexpress.backend.dtos;

import java.time.ZonedDateTime;

import lombok.Data;

@Data
public class ExpenseDto implements BaseDto {
	
	private String id;
	
	private String clientId;
	
	private String jobId;
	
	private ZonedDateTime date;
	
	private String description;
	
	private PriceDto price;
}
