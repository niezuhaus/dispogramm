package net.fahrradexpress.backend.dtos;

import lombok.Data;

@Data
public class MessengerDto implements BaseDto {
	
	private String id;
	
	private String messengerId;
	
	private String nickname;
	
	private String firstName;
	
	private String lastName;
	
	private boolean active;
	
	private boolean dispatcher;
	
	private String telNumber;

	private String lastSeenVersion;
	
}
