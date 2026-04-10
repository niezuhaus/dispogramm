package net.fahrradexpress.backend.dtos;

import lombok.Data;

@Data
public class LocationDto implements BaseDto{

	private String id;
	
	private String name;
	
	private Double longitude;
	
	private Double latitude;
	
	private String street;
	
	private String zipCode;
	
	private String quarter;
	
	private String city;
	
	private String clientId;
	
	private String address;
	
	private String description;

	private boolean deactivated;
	
}
