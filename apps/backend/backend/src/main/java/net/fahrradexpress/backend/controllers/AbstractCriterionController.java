package net.fahrradexpress.backend.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import net.fahrradexpress.backend.services.AbstractCriterionService;

public abstract class AbstractCriterionController<Dto, IdentDto, Service extends AbstractCriterionService<?, Dto, IdentDto, ?>> {

	protected Service service;
	
	public AbstractCriterionController(Service service) {
		this.service = service;
	}
	
	@PostMapping("/save")
	public Dto save(@RequestBody Dto dto) {
		return service.save(dto);
	}
	
	@PostMapping("/find")
	public Dto find(@RequestBody IdentDto dto) {
		return service.find(dto);
	}
	
	@PostMapping("/delete")
	public boolean delete(@RequestBody IdentDto dto) {
		return service.delete(dto);
	}
	
	@GetMapping("/all")
	public List<Dto> all() {
		return service.getAll();
	}
}
