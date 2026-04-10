package net.fahrradexpress.backend.entities;

import java.util.List;

import org.bson.types.ObjectId;

import lombok.Data;

@Data
public class SpecialPrice implements BaseEntity {
	
	private ObjectId _id;

	private String name;
	
	private List<ObjectId> clients;
	
	private Price base;
	
	private Price extra;
	
	private int quantityIncluded;
	
	private Price group;
	
	private List<ObjectId> zones;
	
	private List<String> zipCodes;
	
}
