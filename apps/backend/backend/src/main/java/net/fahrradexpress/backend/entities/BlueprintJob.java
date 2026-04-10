package net.fahrradexpress.backend.entities;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper=false)
@NoArgsConstructor
public class BlueprintJob extends Job implements Comparable<BlueprintJob> {
	
//	@Id
//	private ObjectId _id;
//	
//	private String name;
//	
//	private ObjectId center;
//	
//	private List<IdAndPosition> pickups;
//	
//	private List<IdAndPosition> deliveries;
//	
//	private Price price;
//	
//	private ZonedDateTime creationDate;
//	
//	private ObjectId client;
//	
//	private Double traveldist;
//	
//	private boolean isConnection;
//	
//	private int cargoType;
//	
//	private String description;
//	
//	private boolean clientInvolved;
//	
//	private int modus;
//	
//	private int distributeNumber;
//	
	private int hashValue;
	
	private int frequency;
	
	public BlueprintJob(Job job) {
		//TODO: use converter
		setName(job.getName());
		
		setCenter(job.getCenter());
		setPickups(job.getPickups());
		setDeliveries(job.getDeliveries());

		setPrice(job.getPrice());
		
		setCreationDate(job.getCreationDate());
		
		setClient(job.getClient());
		
		setTraveldist(job.getTraveldist());
		
		setConnection(job.isConnection());
		
		setCargoType(job.getCargoType());
		
		setDescription(job.getDescription());
		
		setCargoType(job.getCargoType());
		
		setClientInvolved(job.isClientInvolved());
//		setFinished(job.isFinished());
		setModus(job.getModus());
		setDistributeNumber(job.getDistributeNumber());
		this.hashValue = generateHashCode();		
	}
	
	private int generateHashCode() {
		StringBuilder builder = new StringBuilder();
		
		builder.append(getClient().toHexString());
		
		builder.append(getCenter().toHexString());
		getPickups().stream().forEach(loc -> builder.append(loc.getId().toHexString()));
		getDeliveries().stream().forEach(loc -> builder.append(loc.getId().toHexString()));
		
		builder.append(String.valueOf(getModus()));
		builder.append(String.valueOf(getCargoType()));
		
		return builder.toString().hashCode();		
	}
	
	public void increaseFrequency() {
		this.frequency++;
	}
	
	@Override
	public int compareTo(BlueprintJob o) {
		return o.getFrequency() - this.getFrequency();
	}

}
