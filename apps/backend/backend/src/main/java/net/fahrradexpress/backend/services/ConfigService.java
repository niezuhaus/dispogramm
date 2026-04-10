package net.fahrradexpress.backend.services;

import org.springframework.stereotype.Service;

import net.fahrradexpress.backend.dtos.ConfigValueDto;
import net.fahrradexpress.backend.dtos.IdDto;
import net.fahrradexpress.backend.entities.ConfigValue;
import net.fahrradexpress.backend.repositories.ConfigRepository;

@Service
public class ConfigService extends AbstractCriterionService<ConfigValue, ConfigValueDto, IdDto, ConfigRepository>{
	
	public ConfigService(ConfigRepository repository) {
		super(ConfigValue::new, ConfigValueDto::new, repository);
	}

	@Override
	protected ConfigValue findEntity(IdDto identDto) {
		return repository.findByName(identDto.getId());
	}

	@Override
	public IdDto getIdentDto(ConfigValueDto dto) {
		return new IdDto(dto.getName());
	}
	
}
