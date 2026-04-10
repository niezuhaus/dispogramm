package net.fahrradexpress.backend.entities;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;

import lombok.Data;

@Data
public class Zone implements BaseEntity {

	@Id
	private ObjectId _id;
	
	private String name;
	
	private List<float[]> coordinates;

	private boolean exclusive;

	private Price price;
}
