package net.fahrradexpress.backend.services;

import org.springframework.stereotype.Service;
import net.fahrradexpress.backend.dtos.schedule.ScheduleDayDto;
import net.fahrradexpress.backend.entities.ScheduleDay;
import net.fahrradexpress.backend.repositories.ScheduleRepository;

@Service
public class ScheduleService extends AbstractIdService<ScheduleDay, ScheduleDayDto, ScheduleRepository> {

	public ScheduleService(ScheduleRepository repository) {
		super(ScheduleDayDto.class, ScheduleDay::new, ScheduleDayDto::new, repository);
	}
	
}
