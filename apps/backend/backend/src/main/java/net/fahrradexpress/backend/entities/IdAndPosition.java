package net.fahrradexpress.backend.entities;


import org.bson.types.ObjectId;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class IdAndPosition implements Comparable<IdAndPosition> {
	
	private ObjectId id;
	
	private int position;
	
	@Override
	public int compareTo(IdAndPosition o) {
		return this.position - o.getPosition();
	}

}
