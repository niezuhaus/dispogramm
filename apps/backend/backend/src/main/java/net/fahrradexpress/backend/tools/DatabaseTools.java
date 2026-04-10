package net.fahrradexpress.backend.tools;

import java.util.List;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;

import net.fahrradexpress.backend.dtos.BaseDto;
import net.fahrradexpress.backend.entities.IdAndPosition;

public class DatabaseTools {
	
	public static boolean isValidId(String id) {
		return !StringTools.isEmpty(id) && ObjectId.isValid(id);
	}
	
	public static ObjectId getObjectId(String id) {
		return isValidId(id) ? new ObjectId(id) : null;
	}
	
	public static ObjectId getObjectId(BaseDto dto) {
		return dto != null ? getObjectId(dto.getId()) : null;
	}
	
	public static List<ObjectId> getIdsFromIdsAndPositions(List<IdAndPosition> idsAndPositions) {
		return idsAndPositions
				.stream()
				.map(IdAndPosition::getId)
				.collect(Collectors.toList());
	}
	
}
