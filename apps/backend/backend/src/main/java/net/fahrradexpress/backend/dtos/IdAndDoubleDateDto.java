package net.fahrradexpress.backend.dtos;

import java.time.ZonedDateTime;

import lombok.Data;

@Data
public class IdAndDoubleDateDto {

	private String id;
	
	private ZonedDateTime start;
	
	private ZonedDateTime end;
}
