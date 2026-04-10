package net.fahrradexpress.backend.entities;

import java.time.ZonedDateTime;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

import lombok.Data;

@Data
public class MessengerShift implements BaseEntity {

	@Id
	private ObjectId _id;
	
	private ObjectId messenger;
	
	private ZonedDateTime start;
	
	private ZonedDateTime end;
	
	private int type;

}
