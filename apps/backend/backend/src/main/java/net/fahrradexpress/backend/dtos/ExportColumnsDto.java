package net.fahrradexpress.backend.dtos;

import java.util.List;

import lombok.Data;

@Data
public class ExportColumnsDto {
	
	private List<String> columns;
}
