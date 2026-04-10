package net.fahrradexpress.backend.repositories;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import net.fahrradexpress.backend.entities.RegularJob;

public interface RegularJobRepository extends MongoRepository<RegularJob, ObjectId> {

	@Query("{ 'morningTour' : ?0 }")
	List<RegularJob> findByMorningTour(int morningTour);
	
}
