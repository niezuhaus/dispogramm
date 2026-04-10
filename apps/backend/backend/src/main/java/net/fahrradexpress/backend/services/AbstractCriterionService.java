package net.fahrradexpress.backend.services;

import java.util.List;
import java.util.function.Supplier;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import net.fahrradexpress.backend.entities.BaseEntity;

public abstract class AbstractCriterionService<Entity extends BaseEntity, Dto, IdentDto, Repository extends MongoRepository<Entity, ObjectId>> extends AbstractService<Entity, Dto, Repository>{

	public AbstractCriterionService(Supplier<Entity> entitySupplier, Supplier<Dto> dtoSupplier, Repository repository) {
		super(entitySupplier, dtoSupplier, repository);
	}
	
	protected abstract Entity findEntity(IdentDto identDto);
	
	public Dto find(IdentDto identDto) {
		Entity entity = findEntity(identDto);
		return entity != null ? toDto(entity) : null;
	}
	
	public abstract IdentDto getIdentDto(Dto dto );
	
	public Dto save(Dto dto) {
		Entity entity = toEntity(dto);
		
		IdentDto identDto = getIdentDto(dto);
		Entity oldEntity = findEntity(identDto);
		
		if (oldEntity != null) {
			entity.set_id(oldEntity.get_id());
		}
		
		return toDto(repository.save(entity));
	}
	
	protected Dto toDto(Entity entity) {
		return conversionTools.betweenObjects(entity, dtoSupplier.get());
	}
	
	protected Entity toEntity(Dto dto) {
		return conversionTools.betweenObjects(dto, entitySupplier.get());
	}
	
	public boolean delete(IdentDto dto) {
		Entity entity = findEntity(dto);
		if (entity != null) {
			repository.delete(entity);
			return true;
		}		
		return false;
	};
	
	public List<Dto> getAll() {
		return toDtoList(repository.findAll()); 
	}
	
}
