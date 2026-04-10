package net.fahrradexpress.backend.repositories.custom;

import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.BulkOperations;
import org.springframework.data.mongodb.core.BulkOperations.BulkMode;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import net.fahrradexpress.backend.entities.BlueprintJob;
import net.fahrradexpress.backend.entities.Job;
import net.fahrradexpress.backend.entities.RegularJob;
import net.fahrradexpress.backend.repositories.LocationRepository;
import net.fahrradexpress.backend.tools.DatabaseTools;

@Repository
public class CustomRepositoryImpl implements CustomRepository {
	
	@Autowired
	MongoTemplate template;
	
	@Autowired
	LocationRepository locationRepository;

	@Override
	public String replaceLocationIds(String mainId, Collection<String> affectedIds) {

		ObjectId mainClientId = DatabaseTools.getObjectId(locationRepository.findById(DatabaseTools.getObjectId(mainId)).get().getClientId());
		
		String jobResult = replaceLocationsIdsForClass(Job.class, mainId, mainClientId, affectedIds);
		String regularJobResult = replaceLocationsIdsForClass(RegularJob.class, mainId, mainClientId, affectedIds);
		String blueprintJobResult = replaceLocationsIdsForClass(BlueprintJob.class, mainId, mainClientId, affectedIds);
		
		return "modified " + jobResult + ", " + regularJobResult + ", and " + blueprintJobResult;
	}
	
	private String replaceLocationsIdsForClass(Class<?> clazz, String mainId, ObjectId mainClientId, Collection<String> affectedIds) {
		
		BulkOperations operations = template.bulkOps(BulkMode.UNORDERED, clazz);
		
		//TODO: figure out why it only works with ObjectId for center and String for the rest
		List<ObjectId> affectedObjectIds = affectedIds.stream().map(i -> new ObjectId(i)).collect(Collectors.toList());
		
		operations.updateMulti(new Query(Criteria.where("center").in(affectedObjectIds)), new Update().set("center", new ObjectId(mainId)).set("client", mainClientId));
		operations.updateMulti(new Query(Criteria.where("pickups.id").in(affectedIds)), new Update().set("pickups.$.id", mainId));
		operations.updateMulti(new Query(Criteria.where("deliveries.id").in(affectedIds)), new Update().set("deliveries.$.id", mainId));
		
		return String.valueOf(operations.execute().getModifiedCount()) + " " + clazz.getSimpleName();
	}
	
	@Override
	public List<Job> findJobsWithLocation(ObjectId locationId, ZonedDateTime date) {
		List<Criteria> orCriteriaList = Arrays.asList(
				Criteria.where("center").is(locationId),
				Criteria.where("pickups.id").is(locationId),
				Criteria.where("deliveries.id").is(locationId));
		
		List<Criteria> andCriteriaList = Arrays.asList(
				Criteria.where("date").gte(date),
				Criteria.where("date").lte(ZonedDateTime.now()));
		
		return template.find(new Query(new Criteria().orOperator(orCriteriaList).andOperator(andCriteriaList)), Job.class);
	}

}
