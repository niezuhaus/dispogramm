package net.fahrradexpress.backend.dtos.statistics;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class WeekStatisticsDto {

	private List<DayStatisticsDto> statistics = new ArrayList<>();
	
}
