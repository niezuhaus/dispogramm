package net.fahrradexpress.backend.entities;

import org.bson.types.ObjectId;

public interface BaseEntity {

	ObjectId get_id();
	
	void set_id(ObjectId id);
}
