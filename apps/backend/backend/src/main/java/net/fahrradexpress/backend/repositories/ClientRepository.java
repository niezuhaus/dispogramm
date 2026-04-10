package net.fahrradexpress.backend.repositories;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import net.fahrradexpress.backend.entities.Client;

public interface ClientRepository extends MongoRepository<Client, ObjectId>{
	
	Client findByClientId(String clientId);
	
}
