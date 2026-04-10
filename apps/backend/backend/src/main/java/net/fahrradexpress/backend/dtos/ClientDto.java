package net.fahrradexpress.backend.dtos;

import lombok.Data;

@Data
public class ClientDto implements BaseDto{
	
	private String id;
	
	private String clientId;
	
	private String name;
	
	private String street;
	
	private String zipCode;

	private String city;
	
	private String info;
	
	private boolean billClient;

	private String invoiceMail;
	
	//String paymentMethod
	//String lexId;
	
}
