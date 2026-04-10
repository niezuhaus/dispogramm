package net.fahrradexpress.backend.repositories;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import net.fahrradexpress.backend.entities.SpecialPrice;

public interface SpecialPriceRepository extends MongoRepository<SpecialPrice, ObjectId> {

}
