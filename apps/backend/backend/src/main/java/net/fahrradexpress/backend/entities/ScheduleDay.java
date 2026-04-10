package net.fahrradexpress.backend.entities;

import java.time.ZonedDateTime;
import java.util.List;

import org.bson.types.ObjectId;

import lombok.Data;

@Data
public class ScheduleDay implements BaseEntity {

	private ObjectId _id;
	
	private ZonedDateTime date;
	
	private List<ObjectId> shifts;	
	
}
