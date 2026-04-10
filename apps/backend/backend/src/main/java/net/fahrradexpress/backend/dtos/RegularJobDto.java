package net.fahrradexpress.backend.dtos;

import java.time.ZonedDateTime;
import java.util.List;

import lombok.Data;

@Data
public class RegularJobDto implements BaseDto {
	
	private String id;
	private String name;
	private LocationDto center;
	private List<LocationDto> pickups;
	private List<LocationDto> deliveries;
	private PriceDto price;
	private PriceDto monthlyPrice;
	private ClientDto client;
	private Double traveldist;
	private int cargoType;
	private String description;
	private List<ZonedDateTime> dates;
	private boolean clientInvolved;
	private int modus;
	private int morningTour;	
	private ZonedDateTime endDate;
	
}
