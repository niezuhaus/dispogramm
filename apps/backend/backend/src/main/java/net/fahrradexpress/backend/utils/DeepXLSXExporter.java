package net.fahrradexpress.backend.utils;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.StringJoiner;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import lombok.AllArgsConstructor;
import lombok.Data;
import net.fahrradexpress.backend.dtos.DoubleStringDto;
import net.fahrradexpress.backend.tools.ConversionTools;

public class DeepXLSXExporter {

	private List<ColumnDescription> getPropertyDescriptions(Class<?> clazz, List<DoubleStringDto> properties) {

		List<ColumnDescription> propertyDescriptions = new ArrayList<>();

		for (DoubleStringDto property : properties) {

			List<Method> getterChain = new ArrayList<>();

			Class<?> itemClass = clazz;

			Method getter = null;

			for (String propertyName : Arrays.asList(property.getPropertyName().split("\\."))) {

				if (itemClass.equals(List.class)) {
					Type genericReturnType = getter.getGenericReturnType();
					Class<?> listItemClass = (Class<?>) ((ParameterizedType) genericReturnType).getActualTypeArguments()[0];
					getterChain.add(ConversionTools.getGetters(listItemClass).get(propertyName));
					break;
				} else {
					getter = ConversionTools.getGetters(itemClass).get(propertyName);
					getterChain.add(getter);
					itemClass = getter.getReturnType();
				}
			}
			propertyDescriptions.add(new ColumnDescription(property.getColumnName(), getterChain));
		}

		return propertyDescriptions;
	}

	private List<ValueColumn> getValues(List<? extends Object> items, List<ColumnDescription> propertyDescriptions) {

		List<ValueColumn> columns = new ArrayList<>();

		for (ColumnDescription propertyDescription : propertyDescriptions) {

			List<String> values = new ArrayList<>();

			for (Object item : items) {

				boolean list = false;

				for (Method getter : propertyDescription.getGetterList()) {

					if (list) {
						StringJoiner itemString = new StringJoiner(", ");
						for (Object listItem : List.class.cast(item)) {
							itemString.add(invokeGetter(getter, listItem).toString());
						}
						item = itemString;
						break;
					}

					if (getter.getReturnType().equals(List.class)) {
						list = true;
					}
					item = invokeGetter(getter, item);
				}

				values.add(item.toString());
			}

			columns.add(new ValueColumn(propertyDescription.getColumnName(), values));
		}

		return columns;
	}

	private Object invokeGetter(Method getter, Object object) {
		try {
			return getter.invoke(object, (Object[]) null);

		} catch (IllegalAccessException | IllegalArgumentException | InvocationTargetException e) {
			e.printStackTrace();
		}
		return null;
	}

	public ByteArrayInputStream getDeepXLSX(List<? extends Object> items, List<DoubleStringDto> doubleStringDtos) {
		List<ValueColumn> valueColumns = getValues(items,
				getPropertyDescriptions(items.get(0).getClass(), doubleStringDtos));

		XSSFWorkbook workbook = new XSSFWorkbook();
		XSSFSheet sheet = workbook.createSheet("test");

		int rowNum = 0;
		int columnNum = 0;

		Row titles = sheet.createRow(rowNum++);

		for (ValueColumn valueColumn : valueColumns) {
			Cell cell = titles.createCell(columnNum++);
			cell.setCellValue(valueColumn.getColumnName());
		}

		for (int i = 0; i < items.size(); i++) {
			Row row = sheet.createRow(rowNum++);

			for (int j = 0; j < valueColumns.size(); j++) {
				Cell cell = row.createCell(j);
				cell.setCellValue(valueColumns.get(j).getValues().get(i));
			}
		}

		ByteArrayOutputStream out = new ByteArrayOutputStream();

		try {
			workbook.write(out);
			workbook.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	
		return new ByteArrayInputStream(out.toByteArray());
	}
	
	@Data
	@AllArgsConstructor
	private static class ColumnDescription {

		private String columnName;

		private List<Method> getterList;

	}

	@Data
	@AllArgsConstructor
	private static class ValueColumn {

		private String columnName;

		private List<String> values;

	}

}
