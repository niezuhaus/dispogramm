package net.fahrradexpress.backend.repositories;

import java.time.ZonedDateTime;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import net.fahrradexpress.backend.entities.Job;

public interface JobRepository extends MongoRepository<Job, ObjectId> {
	
	List<Job> findByDateBetween(ZonedDateTime start, ZonedDateTime end);
	
	List<Job> findByClientAndDateBetween(ObjectId clientId, ZonedDateTime start, ZonedDateTime end);
	
	List<Job> findByMessengerAndDateBetween(ObjectId messengerId, ZonedDateTime start, ZonedDateTime end);
	
	@Query(value="{ 'client : ?0, 'date' : { $gte: ?1 }, 'date' : { $lte: ?2 } }", fields="{ '_id' : 1 }")
	List<Job> fetchIdsForClientAndDatesBetween(ObjectId clientId, ZonedDateTime start, ZonedDateTime end);
	
}
