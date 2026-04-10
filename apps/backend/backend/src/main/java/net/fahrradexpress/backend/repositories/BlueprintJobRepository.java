package net.fahrradexpress.backend.repositories;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import net.fahrradexpress.backend.entities.BlueprintJob;

public interface BlueprintJobRepository extends MongoRepository<BlueprintJob, ObjectId> {

	BlueprintJob findByHashValue(int hashValue);
	
	@Query(value="{ 'client' : ?0 }", sort="{ 'frequency' : -1 }")
	List<BlueprintJob> findByClient(ObjectId clientId);
}
