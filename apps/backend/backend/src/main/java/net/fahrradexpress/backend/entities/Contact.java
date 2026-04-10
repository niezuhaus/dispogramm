package net.fahrradexpress.backend.entities;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import lombok.Data;

@Data
public class Contact implements BaseEntity{

	@Id
	private ObjectId _id;
	
	private String name;
	
	private ObjectId client;
	
	private ObjectId location;
	
	private String phone;
	
	private String email;
	
	private String info;
	
}
