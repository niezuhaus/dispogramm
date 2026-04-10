package net.fahrradexpress.backend.entities;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

import lombok.Data;

@Data
public class Client implements BaseEntity {
	
	@Id
	private ObjectId _id;
	
	private String clientId;
	
	private String name;
	
	private String street;
	
	private String zipCode;
	
	private String city;
	
	private String info;
	
	private boolean billClient;

	private String invoiceMail;
	
}
