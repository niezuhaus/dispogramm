package net.fahrradexpress.backend.repositories;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import net.fahrradexpress.backend.entities.Location;

public interface LocationRepository extends MongoRepository<Location, ObjectId>{

	List<Location> findByClientId(String clientId);
}
