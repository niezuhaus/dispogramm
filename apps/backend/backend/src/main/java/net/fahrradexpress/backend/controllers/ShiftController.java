package net.fahrradexpress.backend.controllers;

import java.util.List;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.fahrradexpress.backend.dtos.DateDto;
import net.fahrradexpress.backend.dtos.IdAndDateDto;
import net.fahrradexpress.backend.dtos.MessengerShiftDto;
import net.fahrradexpress.backend.services.MessengerShiftService;

@RestController
@RequestMapping("/shifts")
public class ShiftController extends AbstractController<MessengerShiftDto, MessengerShiftService> {

	public ShiftController(MessengerShiftService service) {
		super(service);
	}

	@GetMapping("/all/today")
	public List<MessengerShiftDto> findForToday() {
		return service.getForToday();
	}
	
	@PostMapping("/all/date")
	public List<MessengerShiftDto> findForDate(@RequestBody DateDto dateDto) {
		return service.getForDate(dateDto);
	}
	
	@PostMapping("/all/month")
	public List<MessengerShiftDto> findForMonth(@RequestBody DateDto dateDto) {
		return service.getForMonth(dateDto);
	}
	
	@PostMapping("/all/month/messenger")
	public List<MessengerShiftDto> findForMessengerAndMonth(@RequestBody IdAndDateDto idAndDateDto){
		return service.getForMessengerAndMonth(idAndDateDto);
	}
	
	@PostMapping("/export/month/messenger")
	public ResponseEntity<InputStreamResource> exportForMessengerAndMonth(@RequestBody IdAndDateDto idAndDateDto) {
		return getResponseEntity(service.exportForMessengerAndMonth(idAndDateDto), "shifts.xml");
	}
	
}
