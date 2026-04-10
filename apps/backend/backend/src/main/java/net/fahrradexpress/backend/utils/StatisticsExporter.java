package net.fahrradexpress.backend.utils;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import net.fahrradexpress.backend.dtos.statistics.TimeframeStatisticsDto;

@Service
public class StatisticsExporter {

	public ByteArrayInputStream exportDayStatistics(List<TimeframeStatisticsDto> statistics) {
		XSSFWorkbook workbook = new XSSFWorkbook();
		XSSFSheet sheet = workbook.createSheet("Tagesdurchschnitte");

		Row titles = sheet.createRow(0);
		Row amount = sheet.createRow(1);
		Row distance = sheet.createRow(2);
		Row turnover = sheet.createRow(3);

		int columnNum = 0;

		titles.createCell(columnNum).setCellValue("Zeitraum");
		amount.createCell(columnNum).setCellValue("Touren");
		distance.createCell(columnNum).setCellValue("Kilometer");
		turnover.createCell(columnNum++).setCellValue("Umsatz");

		for (TimeframeStatisticsDto stats : statistics) {
			titles.createCell(columnNum).setCellValue(stats.getTimeframe());
			amount.createCell(columnNum).setCellValue(stats.getAmount());
			distance.createCell(columnNum).setCellValue(stats.getDistance());
			turnover.createCell(columnNum++).setCellValue(stats.getTurnover());
		}

		ByteArrayOutputStream out = new ByteArrayOutputStream();

		try {
			workbook.write(out);
			workbook.close();

		} catch (IOException e) {

		}

		return new ByteArrayInputStream(out.toByteArray());
	}

}
