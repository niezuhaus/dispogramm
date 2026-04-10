package net.fahrradexpress.backend.services;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;
import org.springframework.data.domain.Example;
import org.springframework.data.mongodb.repository.MongoRepository;

import net.fahrradexpress.backend.caches.Cache;
import net.fahrradexpress.backend.dtos.BaseDto;
import net.fahrradexpress.backend.dtos.DeepExportDto;
import net.fahrradexpress.backend.dtos.ExportColumnsDto;
import net.fahrradexpress.backend.dtos.IdDto;
import net.fahrradexpress.backend.entities.BaseEntity;
import net.fahrradexpress.backend.tools.ConversionTools;
import net.fahrradexpress.backend.tools.DatabaseTools;
import net.fahrradexpress.backend.tools.StringTools;
import net.fahrradexpress.backend.utils.DeepXLSXExporter;
import net.fahrradexpress.backend.utils.RawXLSXExporter;

public abstract class AbstractIdService<Entity extends BaseEntity, Dto extends BaseDto, Repository extends MongoRepository<Entity, ObjectId>>
		extends AbstractService<Entity, Dto, Repository> {

	protected Cache<Entity, MongoRepository<Entity, ObjectId>> cache;

	protected RawXLSXExporter rawExporter;

	protected DeepXLSXExporter deepExporter;

	public AbstractIdService(Supplier<Entity> entitySupplier, Supplier<Dto> dtoSupplier, Repository repository) {
		super(entitySupplier, dtoSupplier, repository);

		this.cache = new Cache<>(entitySupplier.get().getClass(), repository);
		this.rawExporter = new RawXLSXExporter();
		this.deepExporter = new DeepXLSXExporter();
		this.addConversions();
	}
	
	public AbstractIdService(Class<Dto> clazz, Supplier<Entity> entitySupplier, Supplier<Dto> dtoSupplier, Repository repository) {
		this(entitySupplier, dtoSupplier, repository);
		this.addBaseConversions(clazz);
	}
	
	protected void addConversions() {}
	
	protected void addBaseConversions(Class<Dto> clazz) {
		ConversionTools.addConversion(clazz, ObjectId.class, this::findOrCreateId, this::findDtoById);
		ConversionTools.addListConversion(clazz, ObjectId.class, this::findOrCreateIdList, this::findDtosByIds);
	}
	
	public Dto create(Dto dto) {
		return StringTools.isEmpty(dto.getId()) ? save(dto) : //
				null;
	}

	public Dto update(Dto dto) {
		return findEntityById(dto.getId()) != null ? save(dto) : //
				null;
	}

	public void delete(IdDto idDto) {
		if (DatabaseTools.isValidId(idDto.getId())) {
			ObjectId id = new ObjectId(idDto.getId());
			repository.deleteById(id);
			cache.remove(id);
		}
	}
	
	protected Dto toDto(Entity entity) {
		return entity != null ? conversionTools.toDto(entity, dtoSupplier.get()) : null;
	}

	protected Entity toEntity(Dto dto) {
		return dto != null ? conversionTools.toEntity(dto, entitySupplier.get()) : null;
	}

	public List<Dto> findByExample(Dto dto) {
		// TODO: this might need some fine tuning with an example matcher.

		Example<Entity> example = Example.of(toEntity(dto));

		return toDtoList(repository.findAll(example));
	}

	protected Dto save(Dto dto) {
		return toDto(save(toEntity(dto)));
	}

	protected Entity save(Entity entity) {
		Entity savedEntity = repository.save(entity);
		cache.put(savedEntity);
		return savedEntity;
	}

	protected Entity findEntityById(String id) {
		return findEntityById(DatabaseTools.getObjectId(id));
	}

	protected Entity findEntityById(ObjectId id) {
		return cache.findById(id);
	}

	public Dto findDtoById(IdDto idDto) {
		return toDto(findEntityById(idDto.getId()));
	}

	public Dto findDtoById(ObjectId id) {
		return toDto(findEntityById(id));
	}

	public List<Dto> getAll() {
		return toDtoList(cache.findAll());
	}

	protected List<Entity> findByIds(List<ObjectId> ids) {
		return cache.findByIds(ids);
	}

	public void saveAll() {}

	public ByteArrayInputStream getXLSX(ExportColumnsDto dto) {
		return rawExporter.getRawXLSX(cache.findAll(), dto.getColumns());
	}

	protected ByteArrayInputStream getDeepXLSX(List<?> items, DeepExportDto deepExportDto) {
		return deepExporter.getDeepXLSX(items, deepExportDto.getExportColumns());
	}
	
	protected List<ObjectId> findOrCreateIdList(List<Dto> list) {
		return list.stream().map(this::findOrCreateId).collect(Collectors.toList());
	}
	
	protected List<Dto> findDtosByIds(List<ObjectId> list) {
		return list.stream().map(this::findDtoById).collect(Collectors.toList());
	}

	protected ObjectId findOrCreateId(Dto dto) {
		if (!DatabaseTools.isValidId(dto.getId())) {
			return save(toEntity(dto)).get_id();
		}
		return DatabaseTools.getObjectId(dto.getId());
	}

}
