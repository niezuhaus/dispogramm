package net.fahrradexpress.backend.services;


import org.springframework.stereotype.Service;

import net.fahrradexpress.backend.dtos.schedule.ScheduledShiftDto;
import net.fahrradexpress.backend.entities.ScheduledShift;
import net.fahrradexpress.backend.repositories.ScheduledShiftRepository;

@Service
public class ScheduledShiftService extends AbstractIdService<ScheduledShift, ScheduledShiftDto, ScheduledShiftRepository> {

	public ScheduledShiftService(ScheduledShiftRepository repository) {
		super(ScheduledShiftDto.class, ScheduledShift::new, ScheduledShiftDto::new, repository);
	}
	
}
