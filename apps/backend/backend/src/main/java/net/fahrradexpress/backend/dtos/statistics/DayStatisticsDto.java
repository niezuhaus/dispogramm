package net.fahrradexpress.backend.dtos.statistics;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DayStatisticsDto {

	private String day;
	
	private List<TimeframeStatisticsDto> statistics;
	
	public DayStatisticsDto(String day) {
		this.day = day;
		this.statistics = new ArrayList<>();
	}
}
