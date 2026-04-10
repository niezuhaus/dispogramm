package net.fahrradexpress.backend.repositories;

import java.time.ZonedDateTime;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import net.fahrradexpress.backend.entities.Expense;

@Repository
public interface ExpenseRepository extends MongoRepository<Expense, ObjectId>{

	@Query("{ 'clientId' : ?0, 'date' : { $gte: ?1 }, 'date' : { $lte : ?2 } }")
	List<Expense> findByClientAndDateBetween(ObjectId clientId, ZonedDateTime start, ZonedDateTime end);
}
