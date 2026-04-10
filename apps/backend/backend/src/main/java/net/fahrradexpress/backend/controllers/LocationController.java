package net.fahrradexpress.backend.controllers;


import java.util.List;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.fahrradexpress.backend.dtos.IdDto;
import net.fahrradexpress.backend.dtos.LocationDto;
import net.fahrradexpress.backend.services.LocationService;

@RestController
@RequestMapping("/locations")
public class LocationController extends AbstractController<LocationDto, LocationService>{
	
	public LocationController(LocationService locationService) {
		super(locationService);
	}
	//TODO: change endpoint name
	@PostMapping("/find/by/clientId")
	public List<LocationDto> findByClientId(@RequestBody IdDto idDto) {
		return service.findByClientId(idDto);
	}
	
	@PostMapping("/merge")
	public LocationDto mergeLocations(@RequestBody List<IdDto> idDtos) {
		return service.mergeLocations(idDtos);
	}

}
