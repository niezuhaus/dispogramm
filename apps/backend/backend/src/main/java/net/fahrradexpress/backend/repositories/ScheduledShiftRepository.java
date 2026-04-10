package net.fahrradexpress.backend.repositories;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import net.fahrradexpress.backend.entities.ScheduledShift;

public interface ScheduledShiftRepository extends MongoRepository<ScheduledShift, ObjectId>{

}
