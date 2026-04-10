package net.fahrradexpress.backend.tools;

import java.beans.PropertyDescriptor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;
import lombok.Data;
import net.fahrradexpress.backend.dtos.BaseDto;
import net.fahrradexpress.backend.dtos.PriceDto;
import net.fahrradexpress.backend.entities.BaseEntity;
import net.fahrradexpress.backend.entities.BlueprintJob;
import net.fahrradexpress.backend.entities.Price;

@Service
public class ConversionTools {

	private static Map<Class<?>, Map<String, Method>> getterMap = new HashMap<>();

	private static Map<Class<?>, Map<String, Method>> setterMap = new HashMap<>();

	private static Map<ConversionPair, Function<Object, Object>> conversions = createBaseConversions();

	private static Map<ConversionPair, Function<Object, Object>> listConversions = new HashMap<>();

	public <T extends BaseDto> T toDto(BaseEntity entity, T dto) {
		dto.setId(entity.get_id().toHexString());
		return transferProperties(entity, dto);
	}

	public <T extends BaseEntity> T toEntity(BaseDto dto, T entity) {
		entity.set_id(DatabaseTools.getObjectId(dto.getId()));
		return transferProperties(dto, entity);
	}

	public <T> T betweenObjects(Object from, T to) {
		return transferProperties(from, to);
	}

	public <T extends BaseEntity> T betweenEntities(BaseEntity from, T to) {
		transferProperties(from, to).set_id(null);
		return to;
	}

	private <T> T transferProperties(Object from, T to) {
		Map<String, Method> getters = getGetters(from.getClass());
		Map<String, Method> setters = getSetters(to.getClass());

		for (String key : getters.keySet()) {
			if (setters.keySet().contains(key)) {
				Method getter = getters.get(key);
				Method setter = setters.get(key);

				if (setter.getParameterCount() == 1) {
					Class<?> returnType = getter.getReturnType();
					Class<?> parameterType = setter.getParameterTypes()[0];

					if (returnType.equals(parameterType)) {

						if (returnType.equals(List.class)) {

							Class<?> getterElementType = getListElementType(from, key);
							Class<?> setterElementType = getListElementType(to, key);

							if (!getterElementType.equals(setterElementType)) {

								ConversionPair conversionPair = new ConversionPair(getterElementType,
										setterElementType);

								if (listConversions.containsKey(conversionPair)) {
									set(setter, to, listConversions.get(conversionPair).apply(get(getter, from)));
								}
								continue;
							}
						}
						set(setter, to, get(getter, from));

					} else {

						ConversionPair conversionPair = new ConversionPair(returnType, parameterType);

						if (conversions.containsKey(conversionPair)) {
							Object object = get(getter, from);
							if (object != null) {
								set(setter, to, conversions.get(conversionPair).apply(object));
							}
						}
					}
				}
			}
		}

		return to;
	}

	private Class<?> getListElementType(Object object, String key) {
		try {
			// TODO: find better solution for this dirty stuff
			Field getterField = object instanceof BlueprintJob ? object.getClass().getSuperclass().getDeclaredField(key)
					: object.getClass().getDeclaredField(key);

			ParameterizedType getterFieldType = (ParameterizedType) getterField.getGenericType();

            return (Class<?>) getterFieldType.getActualTypeArguments()[0];

		} catch (NoSuchFieldException e) {
			System.out.println("object class: " + object.getClass() + ", key: " + key);
			e.printStackTrace();
		}

		return null;
	}

	private void set(Method setter, Object to, Object value) {
		try {
			setter.invoke(to, value);
		} catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {
			e.printStackTrace();
		}
	}

	public static Object get(Method getter, Object from) {
		try {
			return getter.invoke(from, (Object[]) null);
		} catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {
			e.printStackTrace();
		}
		return null;
	}

	public static Map<String, Method> getGetters(Class<?> clazz) {
		if (!getterMap.containsKey(clazz)) {
			Map<String, Method> getters = getDescriptors(clazz).stream()
					.collect(Collectors.toMap(PropertyDescriptor::getName, pd -> pd.getReadMethod()));
			getterMap.put(clazz, getters);
		}
		return getterMap.get(clazz);
	}

	private static Map<String, Method> getSetters(Class<?> clazz) {
		if (!setterMap.containsKey(clazz)) {
			Map<String, Method> setters = getDescriptors(clazz).stream()
					.collect(Collectors.toMap(PropertyDescriptor::getName, pd -> pd.getWriteMethod()));
			setterMap.put(clazz, setters);
		}
		return setterMap.get(clazz);
	}

	public static List<PropertyDescriptor> getDescriptors(Class<?> clazz) {
		return Arrays.asList(BeanUtils.getPropertyDescriptors(clazz)).stream()
				.filter(pd -> pd.getWriteMethod() != null && pd.getReadMethod() != null).collect(Collectors.toList());
	}

	private static Map<ConversionPair, Function<Object, Object>> createBaseConversions() {
		Map<ConversionPair, Function<Object, Object>> map = new HashMap<>();

		addConversion(map, String.class, ObjectId.class, DatabaseTools::getObjectId, ObjectId::toHexString);
		addConversion(map, Price.class, PriceDto.class, PriceDto::new, Price::new);

		return map;
	}

	public static <T, U> void addConversion(Class<T> from, Class<U> to, Function<T, U> conversion,
			Function<U, T> reverseConversion) {
		addConversion(conversions, from, to, conversion, reverseConversion);
	}

	@SuppressWarnings("unchecked")
	public static <T, U> void addListConversion(Class<T> from, Class<U> to, Function<List<T>, List<U>> conversion,
			Function<List<U>, List<T>> reverseConversion) {
		listConversions.put(new ConversionPair(from, to), input -> conversion.apply((List<T>) input));
		listConversions.put(new ConversionPair(to, from), input -> reverseConversion.apply((List<U>) input));
	}

	private static <T, U> void addConversion(Map<ConversionPair, Function<Object, Object>> map, Class<T> from,
			Class<U> to, Function<T, U> conversion, Function<U, T> reverseConversion) {
		map.put(new ConversionPair(from, to), input -> conversion.apply(from.cast(input)));
		map.put(new ConversionPair(to, from), input -> reverseConversion.apply(to.cast(input)));
	}

	@Data
	@AllArgsConstructor
	private static class ConversionPair {

		private Class<?> originClass;

		private Class<?> targetClass;

	}

}
