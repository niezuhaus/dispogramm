package net.fahrradexpress.backend.caches;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import net.fahrradexpress.backend.entities.BaseEntity;

public class Cache<Entity extends BaseEntity, Repository extends MongoRepository<Entity, ObjectId>> {

	private Repository repository;

	private Map<ObjectId, Entity> map = new HashMap<>();
	
	private Class<?> clazz;
	
	public Cache(Class<?> clazz, Repository repository) {
		this.clazz = clazz;
		this.repository = repository;
		this.fill();
	}

	private void fill() {
		repository.findAll().forEach(entity -> put(entity));
	}
	
	public void put(Entity entity) {
		map.put(entity.get_id(), entity);
	}
	
	public void remove(ObjectId id) {
		map.remove(id);
	}

	public Entity findById(ObjectId id) {
		
		if (id == null) {
			return null;
		}
		
		//TODO is this necessary? if its in the database it should exists in the cache
		if (!map.containsKey(id)) {
            repository.findById(id).ifPresent(this::put);
		}
		return map.get(id);
	}

	public List<Entity> findByIds(Collection<ObjectId> ids) {
		List<Entity> result = ids.stream().map(id -> map.get(id)).collect(Collectors.toList());
		return result;
	}
	
	public List<Entity> findAll() {
		return new ArrayList<>(map.values());
	}

	public CacheFilter<Entity> getFiltered() {
		return getFiltered(this.findAll());
	}
	
	public CacheFilter<Entity> getFiltered(List<Entity> list) {
		return new CacheFilter<>(clazz, list);
	}
}
