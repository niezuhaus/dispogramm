package net.fahrradexpress.backend.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import net.fahrradexpress.backend.dtos.ClientDto;
import net.fahrradexpress.backend.dtos.statistics.ClientComparisonDto;
import net.fahrradexpress.backend.services.ClientService;

@RestController
@RequestMapping("/clients")
public class ClientController extends AbstractController<ClientDto, ClientService> {
	
	public ClientController(ClientService clientService) {
		super(clientService);
	}
	
	@PostMapping("/upload/compare")
	public List<ClientDto> compareList(@RequestParam("file") MultipartFile file) {
		return service.compareList(file);
	}
	
	@PostMapping("/upload/compare/triple")
	public List<ClientComparisonDto> compareClients(@RequestParam("fred") MultipartFile fred, @RequestParam("lex") MultipartFile lex) {
		return service.compareClients(fred, lex);
	}
	
}
