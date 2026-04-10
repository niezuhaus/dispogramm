package net.fahrradexpress.backend.controllers;

import java.io.ByteArrayInputStream;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.fahrradexpress.backend.dtos.statistics.TimeframeStatisticsDto;
import net.fahrradexpress.backend.dtos.statistics.WeekStatisticsDto;
import net.fahrradexpress.backend.services.StatisticsService;

@RestController
@RequestMapping("/statistics")
public class StatisticsController {

	@Autowired
	private StatisticsService service;
	
	@GetMapping("/week")
	public WeekStatisticsDto getWeekStatistics() {
		return service.getWeekStatistics();
	}
	
	@GetMapping("week/detailed")
	public WeekStatisticsDto getDetailedWeekStatistics() {
		return service.getDetailedWeekStatistics();
	}
	
	@GetMapping("/day")
	public List<TimeframeStatisticsDto> getDayStatistics() {
		return service.getDayStatistics();
	}
	
	@GetMapping("/day/export")
	public ResponseEntity<InputStreamResource> exportDayStatistics() {
		return getResponseEntity(service.exportDayStatistics(), "dayStatistics.xlsx");
	}
	
	protected ResponseEntity<InputStreamResource> getResponseEntity(ByteArrayInputStream dataStream, String fileName) {
		return ResponseEntity.ok()
				.contentType(MediaType.APPLICATION_OCTET_STREAM)
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachement; filename = " + fileName)
				.body(new InputStreamResource(dataStream));
	}
}
