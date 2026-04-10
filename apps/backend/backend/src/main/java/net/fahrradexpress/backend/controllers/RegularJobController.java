package net.fahrradexpress.backend.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.fahrradexpress.backend.dtos.DateDto;
import net.fahrradexpress.backend.dtos.IdAndDateDto;
import net.fahrradexpress.backend.dtos.IdAndNumberDto;
import net.fahrradexpress.backend.dtos.JobDto;
import net.fahrradexpress.backend.dtos.RegularJobDto;
import net.fahrradexpress.backend.services.RegularJobService;

@RestController
@RequestMapping("/regularjobs")
public class RegularJobController extends AbstractController<RegularJobDto, RegularJobService> {

	public RegularJobController(RegularJobService service) {
		super(service);
	}
	
	//TODO: bei der konvertierung wird das Datum falsche gesetzt? 
	@PostMapping("/convert")
	public JobDto convert(@RequestBody IdAndDateDto idAndDateDto) {
		return service.convertForDate(idAndDateDto);
	}

	@PostMapping("/convert/morningtour")
	public List<JobDto> convertMorningTour(@RequestBody IdAndNumberDto idAndNumberDto) {
		return service.convertMorningTour(idAndNumberDto);
	}
	
	@PostMapping("/all/date")
	public List<RegularJobDto> findByDate(@RequestBody DateDto dateDto) {
		return service.findByDate(dateDto);
	}
	

}
