package net.fahrradexpress.backend.utils;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import lombok.AllArgsConstructor;
import lombok.Data;
import net.fahrradexpress.backend.tools.CollectionTools;
import net.fahrradexpress.backend.tools.ConversionTools;

public class RawXLSXExporter {
	
	public ByteArrayInputStream getRawXLSX(List<? extends Object> items, List<String> includedColumns) {

		XSSFWorkbook workbook = new XSSFWorkbook();
		XSSFSheet sheet = workbook.createSheet("test");

		writeRawLines(sheet, items, includedColumns);
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		
		try {
			workbook.write(out);
			workbook.close();

		} catch (IOException e) {
			
		}

		return new ByteArrayInputStream(out.toByteArray());

	}

	private void writeRawLines(XSSFSheet sheet, List<? extends Object> items, List<String> includedColumns) {
		List<PropertyColumn> properties = getProperties(items, includedColumns);

		int rowNum = 0;

		Row titles = sheet.createRow(rowNum++);

		int columnNum = 0;

		for (PropertyColumn column : properties) {
			Cell cell = titles.createCell(columnNum++);
			cell.setCellValue(column.getName());
		}

		for (int i = 0; i < items.size(); i++) {
			Row row = sheet.createRow(rowNum++);

			for (int j = 0; j < properties.size(); j++) {
				Cell cell = row.createCell(j);
				cell.setCellValue(properties.get(j).getValues().get(i));
			}
		}
	}

	private List<PropertyColumn> getProperties(List<? extends Object> items, List<String> includedColumns) {
		List<PropertyColumn> properties = new ArrayList<>();

		if (!CollectionTools.isEmpty(items)) {
			Map<String, Method> getters = ConversionTools.getGetters(items.get(0).getClass());
			if (!CollectionTools.isEmpty(includedColumns)) {
				Set<String> columns = new HashSet<>();
				getters.keySet().forEach(k -> {
					if (!includedColumns.contains(k)) {
						columns.add(k);
					}
				});
				columns.forEach(c -> getters.remove(c));
				
			}
			
			getters.keySet().forEach(g -> properties.add(new PropertyColumn(g, new ArrayList<>())));

			for (PropertyColumn column : properties) {

				String name = column.getName();
				List<String> values = column.getValues();
				Method getter = getters.get(name);

				try {
					for (Object item : items) {
						Object value = getter.invoke(item, (Object[]) null);
						String valueString = value != null ? value.toString() : "null";
						
						values.add(valueString);
					}
				} catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {
					e.printStackTrace();
				}
			}
		}

		return properties;
	}

	@Data
	@AllArgsConstructor
	private static class PropertyColumn {

		private String name;

		private List<String> values;
	}

}
