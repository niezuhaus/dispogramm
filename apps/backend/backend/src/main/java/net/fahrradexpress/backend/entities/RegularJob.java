package net.fahrradexpress.backend.entities;

import java.time.ZonedDateTime;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

import lombok.Data;

@Data
public class RegularJob implements BaseEntity {
	
	@Id
	private ObjectId _id;
	private String name;
	
	private ObjectId center;
	private List<IdAndPosition> pickups;
	private List<IdAndPosition> deliveries;
	
	private Price price;
	private Price monthlyPrice;
	
	private ObjectId client;
	private Double traveldist;
	private int cargoType;
	private String description;
	private List<ZonedDateTime> dates;
	
	private boolean clientInvolved;
	private int modus;
	private int morningTour;
	
	private ZonedDateTime endDate;
	
}
