package net.fahrradexpress.backend.entities;

import java.time.ZonedDateTime;

import org.bson.types.ObjectId;

import lombok.Data;

@Data
public class Expense implements BaseEntity {

	private ObjectId _id;
	
	private ObjectId clientId;
	
	private ObjectId jobId;
	
	private ZonedDateTime date;
	
	private String description;
	
	private Price price;
}
