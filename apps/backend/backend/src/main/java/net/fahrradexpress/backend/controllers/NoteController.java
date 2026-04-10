package net.fahrradexpress.backend.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.fahrradexpress.backend.dtos.DateDto;
import net.fahrradexpress.backend.dtos.NoteDto;
import net.fahrradexpress.backend.services.NoteService;

@RestController
@RequestMapping("/notes")
public class NoteController extends AbstractController<NoteDto, NoteService> {

	public NoteController(NoteService service) {
		super(service);
	}
	
	@PostMapping("/find/date")
	public List<NoteDto> findByDate(@RequestBody DateDto dateDto) {
		return service.findByDate(dateDto);
	}
	
}
