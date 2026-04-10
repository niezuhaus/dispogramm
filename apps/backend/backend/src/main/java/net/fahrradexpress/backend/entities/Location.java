package net.fahrradexpress.backend.entities;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

import lombok.Data;

@Data
public class Location implements BaseEntity{

	@Id
	private ObjectId _id;
	
	private String name;
	
	private Double longitude;
	
	private Double latitude;
	
	private String street;
	
	private String zipCode;
	
	private String quarter;
	
	private String city;
	
	//TODO: change to ObjectId
	private String clientId;
	
	private String address;
	
	private String description;

	private boolean deactivated;
	
}
