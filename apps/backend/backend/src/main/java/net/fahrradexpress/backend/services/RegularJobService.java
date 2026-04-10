package net.fahrradexpress.backend.services;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import net.fahrradexpress.backend.dtos.DateDto;
import net.fahrradexpress.backend.dtos.IdAndDateDto;
import net.fahrradexpress.backend.dtos.IdAndNumberDto;
import net.fahrradexpress.backend.dtos.JobDto;
import net.fahrradexpress.backend.dtos.RegularJobDto;
import net.fahrradexpress.backend.entities.Job;
import net.fahrradexpress.backend.entities.Messenger;
import net.fahrradexpress.backend.entities.RegularJob;
import net.fahrradexpress.backend.repositories.RegularJobRepository;
import net.fahrradexpress.backend.tools.DateTools;

@Service
public class RegularJobService extends AbstractIdService<RegularJob, RegularJobDto, RegularJobRepository> {

	@Autowired
	private JobService jobService;

	@Autowired
	private MessengerService messengerService;

	public RegularJobService(RegularJobRepository repository) {
		super(RegularJob::new, RegularJobDto::new, repository);
	}

	public JobDto convertForDate(IdAndDateDto idAndDateDto) {

		ZonedDateTime date = idAndDateDto.getDate();
		RegularJob regularJob = findEntityById(idAndDateDto.getId());

		if (regularJob != null) {

			for (ZonedDateTime regularDate : regularJob.getDates()) {

				if (regularDate != null && checkForDate(regularJob, date)) {
					Job result = convertRegularJob(regularJob);

					// TODO: Hier nochmal überprüfen ob das nicht ein Problem geben könnte mit den
					// Zeitzonen.
					result.setDate(date.with(DateTools.getLocalZonedDateTime(regularDate).toLocalTime()));
					result = jobService.save(result);
					
					return jobService.toDto(result);
				}
			}
		}
		return null;
	}

	public List<JobDto> convertMorningTour(IdAndNumberDto idAndNumberDto) {

		List<JobDto> result = new ArrayList<>();
		Messenger messenger = messengerService.findEntityById(idAndNumberDto.getId());

		if (messenger != null) {
			List<RegularJob> regularJobs = cache.getFiltered().withInt("morningTour", idAndNumberDto.getNumber()).getList(); 

			for (RegularJob regularJob : regularJobs) {

				ZonedDateTime now = DateTools.getLocalZonedDateTime(ZonedDateTime.now());
				ZonedDateTime regularDate = getCorrectTime(regularJob, now);

				if (regularDate != null) {
					Job job = convertRegularJob(regularJob);
					job.setMessenger(messenger.get_id());
					job.setDate(now.with(regularDate.toLocalTime()));
					job = jobService.save(job);
					result.add(jobService.toDto(job));
				}
			}
		}

		return result;
	}

	private ZonedDateTime getCorrectTime(RegularJob regularJob, ZonedDateTime date) {
		for (ZonedDateTime regularDate : regularJob.getDates()) {
			if (DateTools.sameDayOfWeek(regularDate, date)) {
				return regularDate;
			}
		}
		return null;
	}

	private Job convertRegularJob(RegularJob regularJob) {

		Job job = new Job();

		job.setRegularJobId(regularJob.get_id().toHexString());
		job.setCreationDate(ZonedDateTime.now());
		job.setBillingTour(true);
		
		return conversionTools.betweenEntities(regularJob, job);
	}

	public List<RegularJobDto> findByDate(DateDto dateDto) {

		Set<String> regularIds = jobService.findByDate(dateDto).stream().filter(job -> job.getRegularJobId() != null)
				.map(job -> job.getRegularJobId()).collect(Collectors.toSet());

		return toDtoList(cache.getFiltered() //
				.filter(rj -> checkForDate(rj, dateDto.getDate())) //
				.filter(rj -> !regularIds.contains(rj.get_id().toHexString()))
				.withDateAfter("endDate", ZonedDateTime.now())
				.getList());
	}

	private boolean checkForDate(RegularJob job, ZonedDateTime checkDate) {
		for (ZonedDateTime date : job.getDates()) {
			if (date != null && DateTools.sameDayOfWeek(date, checkDate)) {
				return true;
			}
		}
		return false;
	}

}
