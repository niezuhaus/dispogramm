package net.fahrradexpress.backend.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.fahrradexpress.backend.dtos.ZoneDto;
import net.fahrradexpress.backend.services.ZoneService;

@RestController
@RequestMapping("/zones")
public class ZoneController extends AbstractController<ZoneDto, ZoneService> {

	public ZoneController(ZoneService service) {
		super(service);
	}
	
}
