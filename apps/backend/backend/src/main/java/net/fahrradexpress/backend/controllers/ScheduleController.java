package net.fahrradexpress.backend.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.fahrradexpress.backend.dtos.schedule.ScheduleDayDto;
import net.fahrradexpress.backend.services.ScheduleService;

@RestController
@RequestMapping("schedules")
public class ScheduleController extends AbstractController<ScheduleDayDto, ScheduleService> {

	public ScheduleController(ScheduleService service) {
		super(service);
	}

}
