package net.fahrradexpress.backend.entities;

import java.time.ZonedDateTime;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

import lombok.Data;

@Data
public class Note implements BaseEntity{

	@Id
	private ObjectId _id;
	
	private ObjectId creator;
	
	private ZonedDateTime date;
	
	private String text;

	private boolean done;
	
}
