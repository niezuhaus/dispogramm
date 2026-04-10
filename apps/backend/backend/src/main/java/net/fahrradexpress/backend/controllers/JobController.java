 package net.fahrradexpress.backend.controllers;

import java.io.ByteArrayInputStream;
import java.util.List;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.fahrradexpress.backend.dtos.AmountDto;
import net.fahrradexpress.backend.dtos.DateDto;
import net.fahrradexpress.backend.dtos.DeepExportDto;
import net.fahrradexpress.backend.dtos.IdAndDateDto;
import net.fahrradexpress.backend.dtos.IdAndDoubleDateDto;
import net.fahrradexpress.backend.dtos.IdAndNumberDto;
import net.fahrradexpress.backend.dtos.IdDto;
import net.fahrradexpress.backend.dtos.JobDto;
import net.fahrradexpress.backend.services.JobService;

@RestController
@RequestMapping("/jobs")
public class JobController extends AbstractController<JobDto, JobService> {
	
	public JobController(JobService jobService) {
		super(jobService);
	}
	
	@PostMapping("find/by/clientanddates")
	public List<JobDto> findByClientAndDatesBetween(@RequestBody IdAndDoubleDateDto dto) {
		return service.findByClientIdAndDateBetween(dto);
	}
	
	@GetMapping("all/distinct")
	public List<JobDto> findDistinctList() {
		return service.getBlueprints();
	}
	
	@PostMapping("all/date")
	public List<JobDto> findByDate(@RequestBody DateDto dateDto) {
		return service.findByDate(dateDto);
	}
	
	@PostMapping("all/month")
	public List<JobDto> findByMonth(@RequestBody DateDto dateDto) {
		return service.findByMonth(dateDto);
	}
	
	@PostMapping("all/recent")
	public List<JobDto> findRecent(@RequestBody AmountDto amountDto) {
		return service.findForLastXDays(amountDto);
	}
	
	@PostMapping("location/recent")
	public List<JobDto> findRecentWithLocation(@RequestBody IdAndNumberDto idAndNumberDto) {
		return service.findForLocationAndLastXDays(idAndNumberDto);
	}
	
	@PostMapping("client/distinct")
	public List<JobDto> findDistinctForClient(@RequestBody IdDto idDto) {
		return service.getBlueprintsForClient(idDto);
	}
	
	@PostMapping("/export/clientandmonth")
	public ResponseEntity<InputStreamResource> exportForClientAndMonth(@RequestBody DeepExportDto deepExportDto) {
		return getResponseEntity(service.exportJobsForClientAndMonth(deepExportDto), "jobs.xlsx");
	}
	
	@PostMapping(value = "/export/list", produces = MediaType.APPLICATION_PDF_VALUE)
	public ResponseEntity<InputStreamResource> getInvoicePDF(@RequestBody IdAndDateDto idAndDateDto) {
		ByteArrayInputStream byteStream = service.exportTaskList(idAndDateDto);
		
		InputStreamResource inputStream = new InputStreamResource(byteStream);
		
		HttpHeaders headers = new HttpHeaders();
		headers.add("Content-Disposition", "inline; filename = invoice.pdf");
		
		return new ResponseEntity<>(inputStream, headers, HttpStatus.OK);
	}
	
	@GetMapping("/recreate/blueprints")
	public void recreateBlueprints() {
		service.recreateBlueprints();
	}
	
}
