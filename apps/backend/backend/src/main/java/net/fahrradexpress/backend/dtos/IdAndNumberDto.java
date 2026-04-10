package net.fahrradexpress.backend.dtos;

import lombok.Data;

@Data
public class IdAndNumberDto implements BaseDto{
	
	private String id;
	
	private int number;

}
