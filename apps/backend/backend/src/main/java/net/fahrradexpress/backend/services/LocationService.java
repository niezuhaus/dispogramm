package net.fahrradexpress.backend.services;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import net.fahrradexpress.backend.dtos.IdDto;
import net.fahrradexpress.backend.dtos.LocationDto;
import net.fahrradexpress.backend.entities.IdAndPosition;
import net.fahrradexpress.backend.entities.Location;
import net.fahrradexpress.backend.repositories.LocationRepository;
import net.fahrradexpress.backend.repositories.custom.CustomRepository;
import net.fahrradexpress.backend.tools.CollectionTools;
import net.fahrradexpress.backend.tools.ConversionTools;
import net.fahrradexpress.backend.tools.DatabaseTools;

@Service
public class LocationService extends AbstractIdService<Location, LocationDto, LocationRepository> {

	@Autowired
	private CustomRepository customRepository;

	public LocationService(LocationRepository repository) {
		super(LocationDto.class, Location::new, LocationDto::new, repository);
	}

	@Override
	protected void addConversions() {
		ConversionTools.addListConversion(LocationDto.class, IdAndPosition.class, this::createOrFindLocationIdList,
				this::getLocationList);
	}
	
	public List<LocationDto> findByClientId(String clientId) {
		return toDtoList(cache.getFiltered().withString("clientId", clientId).getList());
	}

	public List<LocationDto> findByClientId(IdDto idDto) {
		return findByClientId(idDto.getId());
	}

	protected List<LocationDto> getLocationList(List<IdAndPosition> locationIds) {

		if (!CollectionTools.isEmpty(locationIds)) {
			Collections.sort(locationIds);
			return locationIds.stream().map(iap -> toDto(findEntityById(iap.getId()))).collect(Collectors.toList());
		}
		return new ArrayList<>();
	}

	protected ObjectId findOrCreateId(LocationDto locationDto) {
		if (!DatabaseTools.isValidId(locationDto.getId())) {
			Location location = toEntity(locationDto);
			location = save(location);

			return location.get_id();
		}
		return DatabaseTools.getObjectId(locationDto.getId());
	}

	protected List<IdAndPosition> createOrFindLocationIdList(List<LocationDto> locationDtos) {
		List<IdAndPosition> locationIds = new ArrayList<>();

		for (int i = 0; i < locationDtos.size(); i++) {
			locationIds.add(new IdAndPosition(findOrCreateId(locationDtos.get(i)), i));
		}
		return locationIds;
	}

	public LocationDto mergeLocations(List<IdDto> idDtos) {

		// TODO: check if all ids exist

		List<String> ids = idDtos.stream().map(i -> i.getId()).collect(Collectors.toList());
		String mainId = ids.get(0);
		ids.remove(0);

		customRepository.replaceLocationIds(mainId, ids);

		
		//TODO: cache is probably not up to date afterwards...
		// TODO refactor this mess
		for (String id : ids) {
			ObjectId objectId = DatabaseTools.getObjectId(id);
			if (objectId != null) {
				repository.deleteById(objectId);
				cache.remove(objectId);
			}
		}

		return toDto(repository.findById(DatabaseTools.getObjectId(mainId)).get());
	}

}