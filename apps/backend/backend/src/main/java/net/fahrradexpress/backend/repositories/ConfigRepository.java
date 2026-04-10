package net.fahrradexpress.backend.repositories;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import net.fahrradexpress.backend.entities.ConfigValue;

public interface ConfigRepository extends MongoRepository<ConfigValue, ObjectId> {

	ConfigValue findByName(String name);
}
