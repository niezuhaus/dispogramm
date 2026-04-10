package net.fahrradexpress.backend.services;

import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.repository.MongoRepository;

import net.fahrradexpress.backend.entities.BaseEntity;
import net.fahrradexpress.backend.tools.ConversionTools;

public abstract class AbstractService <Entity extends BaseEntity, Dto, Repository extends MongoRepository<Entity, ObjectId>>{

	protected Supplier<Entity> entitySupplier;
	
	protected Supplier<Dto> dtoSupplier;
	
	protected Repository repository;
	
	@Autowired
	protected ConversionTools conversionTools;
	
	public AbstractService(Supplier<Entity> entitySupplier, Supplier<Dto> dtoSupplier, Repository repository) {
		this.entitySupplier = entitySupplier;
		this.dtoSupplier = dtoSupplier;
		this.repository = repository;
	}
	
	protected abstract Dto toDto(Entity entity);

	protected abstract Entity toEntity(Dto dto);
	
	protected List<Dto> toDtoList(List<? extends Entity> entityList) {
		return entityList.stream().map(this::toDto).collect(Collectors.toList());
	}
	
}
