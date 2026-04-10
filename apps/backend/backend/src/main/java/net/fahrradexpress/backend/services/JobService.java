package net.fahrradexpress.backend.services;

import java.io.ByteArrayInputStream;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import net.fahrradexpress.backend.dtos.AmountDto;
import net.fahrradexpress.backend.dtos.DateDto;
import net.fahrradexpress.backend.dtos.DeepExportDto;
import net.fahrradexpress.backend.dtos.IdAndDateDto;
import net.fahrradexpress.backend.dtos.IdAndDoubleDateDto;
import net.fahrradexpress.backend.dtos.IdAndNumberDto;
import net.fahrradexpress.backend.dtos.IdDto;
import net.fahrradexpress.backend.dtos.JobDto;
import net.fahrradexpress.backend.entities.BlueprintJob;
import net.fahrradexpress.backend.entities.Job;
import net.fahrradexpress.backend.repositories.BlueprintJobRepository;
import net.fahrradexpress.backend.repositories.JobRepository;
import net.fahrradexpress.backend.repositories.custom.CustomRepository;
import net.fahrradexpress.backend.tools.DatabaseTools;
import net.fahrradexpress.backend.tools.DateTools;
import net.fahrradexpress.backend.tools.DateTools.DoubleDate;
import net.fahrradexpress.backend.utils.PdfExporter;

@Service
public class JobService extends AbstractIdService<Job, JobDto, JobRepository> {

	@Autowired
	private BlueprintJobRepository blueprintJobRepository;

	@Autowired
	private CustomRepository customRepository;

	public JobService(JobRepository jobRepository) {
		super(Job::new, JobDto::new, jobRepository);
	}
	
	public void recreateBlueprints() {
		
		blueprintJobRepository.deleteAll();
		cache.findAll().forEach(job -> saveBlueprint(job, true));
	}

	@Override
	protected Job save(Job job) {

		saveBlueprint(job, job.get_id() == null);

        return super.save(job);
	}
	
	private void saveBlueprint(Job job, boolean isNew) {
		if (job.getClient() != null) {

			//TODO: wenn ein Job so verändert wird, dass sich der Hashvalue ändert und ein neuer Blueprint generiert wird, dann alten Blueprint löschen
			BlueprintJob blueprint = new BlueprintJob(job);
			BlueprintJob oldBlueprint = blueprintJobRepository.findByHashValue(blueprint.getHashValue());

			if (oldBlueprint != null) {
				blueprint.set_id(oldBlueprint.get_id());
				if (isNew) {
					blueprint.setFrequency(oldBlueprint.getFrequency());
				}
			}
			if (oldBlueprint == null || isNew) {
				blueprint.increaseFrequency();
			}
			blueprintJobRepository.save(blueprint);
		}
	}

	public List<JobDto> findByClientIdAndDateBetween(IdAndDoubleDateDto dto) {

		if (DatabaseTools.isValidId(dto.getId())) {
			return toDtoList(findByClientIdAndDateBetween(DatabaseTools.getObjectId(dto.getId()),
					new DoubleDate(dto.getStart(), dto.getEnd())));
		}
		return null;
	}

	protected List<Job> findByClientIdAndDateBetween(ObjectId clientId, DoubleDate dateSpan) {
		return cache.getFiltered().withId("client", clientId).withDateIn(dateSpan).sortByDate().getList();
	}

	public ByteArrayInputStream exportJobsForClientAndMonth(DeepExportDto exportDto) {
		List<JobDto> jobDtos = toDtoList(findByClientIdAndDateBetween(DatabaseTools.getObjectId(exportDto),
				DateTools.getMonthSpan(exportDto.getDate())));

		return getDeepXLSX(jobDtos, exportDto);
	}

	protected List<JobDto> findByMessengerIdAndDateIn(ObjectId messengerId, ZonedDateTime start,
			ZonedDateTime end) {

		if (messengerId == null || start == null || end == null) {
			return new ArrayList<>();
		}

		return toDtoList(cache.getFiltered()//
				.withId("messenger", messengerId)//
				.withDateIn(new DoubleDate(start, end))//
				.getList());
	}

	public List<JobDto> getBlueprints() {
		return toDtoList(blueprintJobRepository.findAll(Sort.by(Sort.Direction.DESC, "frequency")));
	}

	public List<JobDto> getBlueprintsForClient(IdDto idDto) {
		if (DatabaseTools.isValidId(idDto.getId())) {
			List<BlueprintJob> blueprints = blueprintJobRepository
					.findByClient(DatabaseTools.getObjectId(idDto.getId()));

			//TODO: wird das schon automatisch gemacht?
//			Collections.sort(blueprints);
			
						
			List<JobDto> dtoList = toDtoList(blueprints);
			dtoList.forEach(dto -> dto.setId(null));
			return dtoList;//.stream().map(bpj -> conversionTools.betweenEntities(bpj, entitySupplier.get())).collect(Collectors.toList()));
		}
		return null;
	}

	public List<JobDto> findByDate(DateDto dateDto) {
		return toDtoList(cache.getFiltered().withDateIn(DateTools.getOneDaySpan(dateDto.getDate())).getList());
	}

	public List<JobDto> findByMonth(DateDto dateDto) {
		return toDtoList(cache.getFiltered().withDateIn(DateTools.getMonthSpan(dateDto.getDate())).getList());
	}

	public List<JobDto> findForLastXDays(AmountDto days) {
		//TODO: make better?
		return toDtoList(cache.getFiltered().withDateIn(new DoubleDate(ZonedDateTime.now().plusDays(-days.getAmount()),
				DateTools.getLocalZonedDateTimeDayBegin(ZonedDateTime.now().plusDays(1)))).getList());
	}

	public List<JobDto> findForLocationAndLastXDays(IdAndNumberDto idAndNumberDto) {

		ObjectId id = DatabaseTools.getObjectId(idAndNumberDto);

		ZonedDateTime startDate = DateTools.getLocalZonedDateTimeDayBegin(ZonedDateTime.now())
				.minusDays(idAndNumberDto.getNumber());

		return toDtoList(customRepository.findJobsWithLocation(id, startDate));
	}
	
	public ByteArrayInputStream exportTaskList(IdAndDateDto idAndDateDto) {
		List<JobDto> jobDtos = toDtoList(findByClientIdAndDateBetween(DatabaseTools.getObjectId(idAndDateDto),
				DateTools.getMonthSpan(idAndDateDto.getDate())));
		
		PdfExporter exporter = new PdfExporter();
		
		return exporter.createTaskList(jobDtos);
		
	}
	
	@Override
	public void saveAll() {
		List<Job> jobs = this.cache.findAll();
		
		for (Job job : jobs) {
			String newId = null;
			switch (job.getPriceStrategy()) {
			case 1: {
					
				if (job.getClient() == null || !job.getClient().equals(new ObjectId("62cc259ade749857390bc0a1"))) {
					//sparkasse
					newId = "640d20a97326c321517fc50f";
				}
				else {
					//künneke
					newId = "640d20b67326c321517fc510";
				} 
				break;
			}
			case 2: {
				//dierksen hanker
				newId = "640d1e837326c321517fc50c";
				break;
			}
			case 3: {
				//hb nord 
				newId = "640d1ea07326c321517fc50d";
				break;
			}
			case 4: {
				//niemann banken
				newId = "640d20647326c321517fc50e";
			}
			default: break;//fex standard
			}
			
			if (DatabaseTools.isValidId(newId)) {
				job.setSpecialPrice(new ObjectId(newId));
			}
		}
		jobs.forEach(j -> save(j));
		
	}

}