package net.fahrradexpress.backend.dtos.statistics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.fahrradexpress.backend.dtos.JobDto;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeframeStatisticsDto implements Comparable<TimeframeStatisticsDto>{
	
	private String timeframe;

	private int amount;
	
	private double distance;
	
	private double turnover;
	
	public TimeframeStatisticsDto(String timeframe) {
		this.timeframe = timeframe;
	}
	
	public TimeframeStatisticsDto(String timeframe, JobDto job) {
		this.timeframe = timeframe;
		this.amount = 1;
		this.distance = job.getTraveldist();
		this.turnover = job.getPrice().getBrutto();
	}
	
	public TimeframeStatisticsDto addJob(JobDto job) {
		this.amount++;
		this.distance += job.getTraveldist();
		this.turnover += job.getPrice().getBrutto();
		
		return this;
	}

	@Override
	public int compareTo(TimeframeStatisticsDto o) {
		return this.getTimeframe().compareTo(o.timeframe);
	}
}
