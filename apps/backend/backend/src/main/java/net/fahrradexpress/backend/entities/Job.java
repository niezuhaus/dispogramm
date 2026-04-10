package net.fahrradexpress.backend.entities;

import java.time.ZonedDateTime;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

import lombok.Data;

@Data
public class Job implements BaseEntity {
	
	@Id
	private ObjectId _id;
	
	//TODO: ObjectId
	private String regularJobId;
	
	private String name;
	
	private String colour;
	
	private ObjectId center;
	
	private List<IdAndPosition> pickups;
	
	private List<IdAndPosition> deliveries;
	
	private List<ObjectId> expenses;
	
	private Price price;
	
	private ObjectId specialPrice;
	
	private ZonedDateTime date;
	
	private ZonedDateTime creationDate;
	
	private ObjectId client;
	
	private Double traveldist;

	private boolean isStreetRouted;
	
	private boolean isConnection;
	
	private int cargoType;
	
	private String description;
	
	private ObjectId messenger;
	
	private ObjectId creator;
	
	private ObjectId dispatcher;
	
	private boolean clientInvolved;
	
	private boolean finished;
	
	private int modus;
	
	private int waitingMinutes;
	
	private int priceStrategy;
	
	private int distributeNumber;
	
	private boolean canceled;
	
	private boolean falseArrival;
	
	private int morningTour;
	
	private boolean billingTour;
	
}
