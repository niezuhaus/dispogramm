package net.fahrradexpress.backend.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.fahrradexpress.backend.dtos.ConfigValueDto;
import net.fahrradexpress.backend.dtos.IdDto;
import net.fahrradexpress.backend.services.ConfigService;

@RestController
@RequestMapping("/configs")
public class ConfigController extends AbstractCriterionController<ConfigValueDto, IdDto, ConfigService>{

	public ConfigController(ConfigService service) {
		super(service);
	}
	
}
