package net.fahrradexpress.backend.repositories;

import java.time.LocalDate;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import net.fahrradexpress.backend.entities.Note;

public interface NoteRepository extends MongoRepository<Note, ObjectId> {
	
	@Query("{ 'date' : ?0 }")
	Note findByDate(LocalDate date);

}
