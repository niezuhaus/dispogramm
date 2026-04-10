package net.fahrradexpress.backend.services;

import org.springframework.stereotype.Service;

import net.fahrradexpress.backend.dtos.SpecialPriceDto;
import net.fahrradexpress.backend.entities.SpecialPrice;
import net.fahrradexpress.backend.repositories.SpecialPriceRepository;

@Service
public class SpecialPriceService extends AbstractIdService<SpecialPrice, SpecialPriceDto, SpecialPriceRepository>{

	public SpecialPriceService(SpecialPriceRepository repository) {
		super(SpecialPriceDto.class, SpecialPrice::new, SpecialPriceDto::new, repository);
	}
	
}
