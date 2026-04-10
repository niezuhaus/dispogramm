package net.fahrradexpress.backend.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.fahrradexpress.backend.dtos.SpecialPriceDto;
import net.fahrradexpress.backend.services.SpecialPriceService;

@RestController
@RequestMapping("/prices")
public class SpecialPriceController extends AbstractController<SpecialPriceDto, SpecialPriceService> {

	public SpecialPriceController(SpecialPriceService service) {
		super(service);
	}
	
}
