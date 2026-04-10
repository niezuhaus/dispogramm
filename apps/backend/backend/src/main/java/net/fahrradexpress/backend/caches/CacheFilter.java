package net.fahrradexpress.backend.caches;

import java.lang.reflect.Method;
import java.time.ZonedDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;

import lombok.Getter;
import net.fahrradexpress.backend.entities.BaseEntity;
import net.fahrradexpress.backend.tools.CollectionTools;
import net.fahrradexpress.backend.tools.ConversionTools;
import net.fahrradexpress.backend.tools.DateTools;
import net.fahrradexpress.backend.tools.DateTools.DoubleDate;

public class CacheFilter<Entity extends BaseEntity> {

	@Getter
	private List<Entity> list;

	Map<String, Method> getters = new HashMap<>();

	public CacheFilter(Class<?> clazz, List<Entity> list) {
		this.list = list;
		getters = ConversionTools.getGetters(clazz);
	}
	
	public CacheFilter<Entity> withDateIn(DoubleDate dateSpan) {
		return withDateIn("date", dateSpan);
	}

	public CacheFilter<Entity> withDateIn(String fieldName, DoubleDate dateSpan) {
		return filter(fieldName, ZonedDateTime.class, entity -> DateTools.dateIn(getDate(entity, fieldName), dateSpan));
	}
	
	public CacheFilter<Entity> withDateAfter(String fieldName, ZonedDateTime date) {
		return filter(fieldName, ZonedDateTime.class, entity -> getDate(entity, fieldName).isAfter(date));
	}

	public CacheFilter<Entity> withId(String fieldName, ObjectId id) {
		return filter(fieldName, ObjectId.class, entity -> {
			ObjectId value = getId(entity, fieldName);
			return value != null && value.equals(id);
			});
	}
	
	public CacheFilter<Entity> withInt(String fieldName, int i) {
		return filter(fieldName, int.class, entity -> getInt(entity, fieldName) == i);
	}
	
	public CacheFilter<Entity> withString(String fieldName, String string) {
		return filter(fieldName, String.class, entity -> get(entity, fieldName, String.class).equals(string));
	}
	
	public CacheFilter<Entity> filter(Predicate<Entity> filter) {
		list.removeIf(filter.negate());
		
		return this;
	}
	
	public CacheFilter<Entity> filter(String fieldName, Class<?> fieldType, Predicate<Entity> filter) {
		if (validateField(fieldName, fieldType)) {
			list.removeIf(filter.negate());
		}
		return this;
	}
	
	public CacheFilter<Entity> sortByDate() {
		if (validateField("date", ZonedDateTime.class)) {
			list = list.stream().sorted(Comparator.comparing(this::getDate))
			.collect(Collectors.toList());
		}
		return this;
	}

	private boolean validateField(String fieldName, Class<?> fieldType) {
		Method getter = getters.get(fieldName);
		return getter != null && getter.getReturnType().equals(fieldType);
	}

	private ObjectId getId (Entity entity, String fieldName) {
		return get(entity, fieldName, ObjectId.class);
	}
	
	private ZonedDateTime getDate(Entity entity) {
		return getDate(entity, "date");
	}
	
	private ZonedDateTime getDate(Entity entity, String fieldName) {
		return get(entity, fieldName, ZonedDateTime.class);
	}
	
	private int getInt(Entity entity, String fieldName) {
		return get(entity, fieldName, int.class);
	}
	
	private <T> T get(Entity entity, String fieldName, Class<T> fieldType) {
		return fieldType.cast(ConversionTools.get(getters.get(fieldName), entity));
	}
	
	public Entity getFirst() {
		return !CollectionTools.isEmpty(list) ? list.get(0) : null;
	}

}
