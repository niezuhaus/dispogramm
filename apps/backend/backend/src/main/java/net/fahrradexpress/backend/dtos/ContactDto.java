package net.fahrradexpress.backend.dtos;

import lombok.Data;

@Data
public class ContactDto implements BaseDto{

	private String id;
	
	private String name;
	
	private ClientDto client;
	
	private LocationDto location;
	
	private String phone;
	
	private String fax;
	
	private String email;
	
	private String info;
	
}
