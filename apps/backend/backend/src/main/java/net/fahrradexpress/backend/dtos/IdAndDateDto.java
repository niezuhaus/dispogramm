package net.fahrradexpress.backend.dtos;

import java.time.ZonedDateTime;

import lombok.Data;

@Data
public class IdAndDateDto implements BaseDto {

	private String id;
	
	private ZonedDateTime date;

}
