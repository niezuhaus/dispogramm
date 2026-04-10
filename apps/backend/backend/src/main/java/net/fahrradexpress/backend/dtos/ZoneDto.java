package net.fahrradexpress.backend.dtos;

import java.util.List;

import lombok.Data;

@Data
public class ZoneDto implements BaseDto {
	
	private String id;

	private String name;
	
	private List<float[]> coordinates;

	private boolean exclusive;

	private PriceDto price;
	
}
