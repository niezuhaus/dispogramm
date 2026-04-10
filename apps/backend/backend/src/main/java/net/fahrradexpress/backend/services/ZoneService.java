package net.fahrradexpress.backend.services;

import org.springframework.stereotype.Service;

import net.fahrradexpress.backend.dtos.ZoneDto;
import net.fahrradexpress.backend.entities.Zone;
import net.fahrradexpress.backend.repositories.ZoneRepository;

@Service
public class ZoneService extends AbstractIdService<Zone, ZoneDto, ZoneRepository> {

	public ZoneService(ZoneRepository repository) {
		super(Zone::new, ZoneDto::new, repository);
	}

}
