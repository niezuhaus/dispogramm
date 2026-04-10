package net.fahrradexpress.backend.services;

import java.io.ByteArrayInputStream;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import net.fahrradexpress.backend.dtos.JobDto;
import net.fahrradexpress.backend.dtos.statistics.DayStatisticsDto;
import net.fahrradexpress.backend.dtos.statistics.TimeframeStatisticsDto;
import net.fahrradexpress.backend.dtos.statistics.WeekStatisticsDto;
import net.fahrradexpress.backend.tools.DateTools;
import net.fahrradexpress.backend.utils.StatisticsExporter;

@Service
public class StatisticsService {

	@Autowired
	private JobService jobService;
	
	@Autowired
	private StatisticsExporter exporter;
	
	public WeekStatisticsDto getWeekStatistics() {
		
		StatisticsWeekMap map = new StatisticsWeekMap();
		
		for (JobDto job : jobService.getAll()) {
			
			if (job.getDate() == null) {
				continue;
			}
			
			String time = getTime(job).getHour() < 13 ? "früh" : "spät";
			
			map.addJob(getDayOfWeek(job), time, job);
			
		}
		return map.toDto();
	}
	
	public WeekStatisticsDto getDetailedWeekStatistics() {
		
		StatisticsWeekMap map = new StatisticsWeekMap();
		
		for (JobDto job : jobService.getAll()) {
			
			if (job.getDate() == null) {
				continue;
			}
			
			String hourSpan = getHourSpanString(getTime(job).getHour());
			
			map.addJob(getDayOfWeek(job), hourSpan, job);
		}
		
		return map.toDto();
	}
	
	public List<TimeframeStatisticsDto> getDayStatistics() {
		
		StatisticsMap map = new StatisticsMap();
		
		for (JobDto job : jobService.getAll()) {
			if (job.getDate() == null) {
				continue;
			}
			map.addJob(getHourSpanString(getTime(job).getHour()), job);
		}
		
		return map.toList(true);	
	}
	
	public ByteArrayInputStream exportDayStatistics() {
		return exporter.exportDayStatistics(getDayStatistics());
	}

	private String getHourSpanString(int hour) {
		String start = String.format("%1$2s", String.valueOf(hour)).replace(' ', '0');
		String end = String.format("%1$2s", String.valueOf(hour + 1)).replace(' ', '0');
		return start + "-" + end;
	}

	private DayOfWeek getDayOfWeek(JobDto job) {
		return DateTools.getLocalZonedDateTime(job.getDate()).getDayOfWeek();
	}
	
	private LocalTime getTime(JobDto job) {
		return DateTools.getLocalZonedDateTime(job.getDate()).toLocalTime();
	}
	
	private static class StatisticsWeekMap extends HashMap<DayOfWeek, StatisticsMap> {
		
		private static final long serialVersionUID = 1L;

		public StatisticsWeekMap addJob(DayOfWeek day, String timeframe, JobDto job) {
			
			if (!this.containsKey(day)) {
				this.put(day, new StatisticsMap());
			}
			this.get(day).addJob(timeframe, job);
			return this;
		}
		
		public WeekStatisticsDto toDto() {
			List<DayStatisticsDto> days = this.keySet().stream()
					.map(k -> new DayStatisticsDto(k.getDisplayName(TextStyle.FULL, Locale.GERMANY), this.get(k)
							.toList(true))).collect(Collectors.toList());
			
			return new WeekStatisticsDto(days);
		}		
	}
	
	private static class StatisticsMap extends HashMap<String, TimeframeStatisticsDto> {

		private static final long serialVersionUID = 1L;
		
		public StatisticsMap addJob(String timeframe, JobDto job) {
			if (!this.containsKey(timeframe)) {
				this.put(timeframe, new TimeframeStatisticsDto(timeframe));
			}
			this.get(timeframe).addJob(job);
			
			return this;
		}
		
		public List<TimeframeStatisticsDto> toList(boolean sorted) {
			List<TimeframeStatisticsDto> result = this.values().stream().collect(Collectors.toList());
			
			if (sorted) {
				Collections.sort(result);
			}
			
			return result;	
		}
	}
	
}
