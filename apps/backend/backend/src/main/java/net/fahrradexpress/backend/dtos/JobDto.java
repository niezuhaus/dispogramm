package net.fahrradexpress.backend.dtos;

import java.time.ZonedDateTime;
import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class JobDto implements BaseDto {
	
	private String id;
	
	private String regularJobId;
	
	private String name;
	
	private String colour;
	
	private LocationDto center;
	
	private List<LocationDto> pickups;
	
	private List<LocationDto> deliveries;
	
	private List<ExpenseDto> expenses;
	
	private PriceDto price;
	
	private SpecialPriceDto specialPrice;
	
	private ZonedDateTime date;
	
	private ZonedDateTime creationDate;
	
	private ClientDto client;
	
	private Double traveldist;

	private boolean isStreetRouted;
	
	private boolean isConnection;
	
	private int cargoType;
	
	private String description;
	
	private MessengerDto messenger;
	
	private MessengerDto creator;
	
	private MessengerDto dispatcher;
	
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
	
	//TODO use conversion instead
//	public JobDto(Job job) {
//		this.id = job.get_id() != null ? job.get_id().toHexString() : null;
//		this.regularJobId = job.getRegularJobId();
//		this.name = job.getName();
//		this.price = new PriceDto(job.getPrice());
//		this.date = job.getDate();
//		this.creationDate = job.getCreationDate();
//		this.traveldist = job.getTraveldist();
//		this.isConnection = job.isConnection();
//		this.cargoType = job.getCargoType();
//		this.description = job.getDescription();
//		this.clientInvolved = job.isClientInvolved();
//		this.finished = job.isFinished();
//		this.modus = job.getModus();
//		this.waitingMinutes = job.getWaitingMinutes();
//		this.priceStrategy = job.getPriceStrategy();
//		this.distributeNumber = job.getDistributeNumber();
//		this.canceled = job.isCanceled();
//		this.falseArrival = job.isFalseArrival();
//		this.morningTour = job.getMorningTour();
//		this.billingTour = job.isBillingTour();
//	}
	
//	public JobDto(BlueprintJob blueprintJob) {
//		this((Job)blueprintJob);
//	}
}
