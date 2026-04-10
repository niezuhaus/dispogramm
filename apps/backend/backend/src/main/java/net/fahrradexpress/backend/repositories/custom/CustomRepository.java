package net.fahrradexpress.backend.repositories.custom;

import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.List;

import org.bson.types.ObjectId;

import net.fahrradexpress.backend.entities.Job;

public interface CustomRepository {
	
	String replaceLocationIds(String mainId, Collection<String> affectedIds);
	
	List<Job> findJobsWithLocation(ObjectId locationId, ZonedDateTime date);

}
