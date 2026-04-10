package net.fahrradexpress.backend.controllers;

import java.io.ByteArrayInputStream;
import java.util.List;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import net.fahrradexpress.backend.dtos.BaseDto;
import net.fahrradexpress.backend.dtos.ExportColumnsDto;
import net.fahrradexpress.backend.dtos.IdDto;
import net.fahrradexpress.backend.services.AbstractIdService;


public abstract class AbstractController <Dto extends BaseDto, Service extends AbstractIdService< ?, Dto, ? >>{

	protected Service service;
	
	public AbstractController(Service service) {
		this.service = service;
	}
	
	@PostMapping("/create")
	public Dto create(@RequestBody Dto dto) {
		return service.create(dto);
	}
	
	@PostMapping("/update")
	public Dto update(@RequestBody Dto dto) {
		return service.update(dto);
	}
	
	@PostMapping("/find")
	public Dto find(@RequestBody IdDto idDto) {
		return service.findDtoById(idDto);
	}
	
	@PostMapping("/delete")
	public void delete(@RequestBody IdDto idDto) {
		service.delete(idDto);
	}	

	@GetMapping("/all")
	public List<Dto> getAll() {
		return service.getAll();
	}
	
	@GetMapping("/all/save")
	public void saveAll() {
		service.saveAll();
	}
	
	@PostMapping("/all/xlsx")
	public ResponseEntity<InputStreamResource> getXLSX(@RequestBody ExportColumnsDto dto) {
		return getResponseEntity(service.getXLSX(dto), "list.xlsx");
	}
	
	@PostMapping("/find/byexample")
	public List<Dto> findByExample(@RequestBody Dto dto) {
		return service.findByExample(dto);
	}
	
	protected ResponseEntity<InputStreamResource> getResponseEntity(ByteArrayInputStream dataStream, String fileName) {
		return ResponseEntity.ok()
				.contentType(MediaType.APPLICATION_OCTET_STREAM)
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachement; filename = " + fileName)
				.body(new InputStreamResource(dataStream));
	}
	
}
