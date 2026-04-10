package net.fahrradexpress.backend.entities;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

import lombok.Data;

@Data
public class Messenger implements BaseEntity {
	
	@Id
	private ObjectId _id;
	
	private String messengerId;
	
	private String nickname;
	
	private String firstName;
	
	private String lastName;
	
	private boolean active;
	
	private boolean dispatcher;
	
	private String telNumber;

	private String lastSeenVersion;
	
}
