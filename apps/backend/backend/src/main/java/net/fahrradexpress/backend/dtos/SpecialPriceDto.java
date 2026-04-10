package net.fahrradexpress.backend.dtos;

import java.util.List;

import lombok.Data;

@Data
public class SpecialPriceDto implements BaseDto {
	
	private String id;

	private String name;
	
	private List<ClientDto> clients;
	
	private PriceDto base;
	
	private PriceDto extra;
	
	private int quantityIncluded;
	
	private PriceDto group;
	
	private List<ZoneDto> zones;
	
	private List<String> zipCodes;
	
}
