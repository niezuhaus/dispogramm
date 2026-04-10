package net.fahrradexpress.backend.repositories;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import net.fahrradexpress.backend.entities.Zone;

public interface ZoneRepository extends MongoRepository<Zone, ObjectId> {

}
