package net.fahrradexpress.backend.repositories;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import net.fahrradexpress.backend.entities.ScheduleDay;

@Repository
public interface ScheduleRepository extends MongoRepository<ScheduleDay, ObjectId> {

}
