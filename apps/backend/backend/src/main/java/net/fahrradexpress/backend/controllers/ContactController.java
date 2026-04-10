package net.fahrradexpress.backend.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import net.fahrradexpress.backend.dtos.ContactDto;
import net.fahrradexpress.backend.dtos.IdDto;
import net.fahrradexpress.backend.services.ContactService;

@RestController
@RequestMapping("/contacts")
public class ContactController extends AbstractController<ContactDto, ContactService>{

	public ContactController(ContactService service) {
		super(service);
	}
	
	@PostMapping("all/client")
	public List<ContactDto> findByClientId(@RequestBody IdDto idDto) {
		return service.findByClient(idDto);
	}
	
	@PostMapping("all/location")
	public List<ContactDto> findByLocationId(@RequestBody IdDto idDto) {
		return service.findByLocation(idDto);
	}
	
	@PostMapping("/upload/import")
	public List<ContactDto> importContacts(@RequestParam("file") MultipartFile file) {
		return service.importContacts(file);
	}

}
