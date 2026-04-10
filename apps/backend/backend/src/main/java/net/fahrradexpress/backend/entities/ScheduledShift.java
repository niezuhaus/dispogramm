package net.fahrradexpress.backend.entities;

import java.time.ZonedDateTime;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

import lombok.Data;

@Data
public class ScheduledShift implements BaseEntity {

	@Id
	private ObjectId _id;
	
	private String name;
	
	private ZonedDateTime start;
	
	private ZonedDateTime end;
	
	private int slots;
	
	private List<ObjectId> riding;
	
	private List<ObjectId> available;
	
	private List<ObjectId> notAvailable;
}
