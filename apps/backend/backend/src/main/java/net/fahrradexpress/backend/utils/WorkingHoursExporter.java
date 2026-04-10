package net.fahrradexpress.backend.utils;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerException;

import net.fahrradexpress.backend.entities.Messenger;
import net.fahrradexpress.backend.entities.MessengerShift;
import net.fahrradexpress.backend.tools.CollectionTools;
import net.fahrradexpress.backend.tools.DateTools;
import net.fahrradexpress.backend.tools.DateTools.DoubleDate;
import net.fahrradexpress.backend.tools.StringTools;

public class WorkingHoursExporter extends XMLExporter {

	private ZonedDateTime date;

	private Messenger messenger;

	private Map<LocalDate, List<MessengerShift>> shiftMap;

	public WorkingHoursExporter(ZonedDateTime date, Messenger messenger, Map<LocalDate, List<MessengerShift>> shiftMap)
			throws ParserConfigurationException, TransformerException {
		this.date = date;
		this.messenger = messenger;
		this.shiftMap = shiftMap;
	}

	@Override
	protected ElementBuilder createRootElement() {
		ElementBuilder workbook = createWorkbook();
		
		workbook.appendChild(buildStyles());
		workbook.appendChild(createNames());
		
		workbook.appendChild(createWorksheet());
		
		return workbook;
	}

	private ElementBuilder buildStyles() {
		ElementBuilder styles = factory.create("Styles"); //
		
		styles.appendChild(
				factory.createStyle("Default").withAttribute("ss:Name", "Normal").withAlignment(null, "Bottom") //
				.appendChild(factory.create("Borders")) //
				.appendChild(factory.createCalibri("11").withAttribute("ss:Color", "#000000")) //
				.appendChild(factory.create("Interior")) //
				.appendChild(factory.create("NumberFormat")) //
				.appendChild(factory.create("Protection")));
		
		styles.appendChild(factory.createStyle("s21")
				.appendChild(factory.createBoldCalibri("20").withAttribute("ss:Color", "#000000")));
		
		styles.appendChild(factory.createStyle("s22").withAlignment("Right", "Bottom"));
		
		styles.appendChild(factory.createStyle("s23")
				.appendChild(factory.create("Borders").withBorder("Bottom", "Double", "Weight"))
				.appendChild(factory.createBoldCalibri("11")));
		
		styles.appendChild(factory.createStyle("s24") //
				.appendChild(factory.create("Borders")) //
				.appendChild(factory.createBoldCalibri("11")));
		
		styles.appendChild(styleWithCompleteBordersAndNumberFormat("s25", "Short Date"));
		styles.appendChild(styleWithCompleteBordersAndNumberFormat("s26", "@"));
		styles.appendChild(styleWithCompleteBordersAndNumberFormat("s27", "h:mm;@"));
		styles.appendChild(styleWithCompleteBordersAndNumberFormat("s28", null));
		styles.appendChild(styleWithCompleteBordersAndNumberFormat("s30", "h:mm;@") //
				.appendChild(factory.createCalibri("11")));
		
		return styles;
	}
	
	private ElementBuilder createNames() {
		return factory.create("Names") //
				.appendChild(factory.createNamedRange("MA_Name", "=Tabelle1!R2C2"))
				.appendChild(factory.createNamedRange("PersNr", "=Tabelle1!R3C2"))
				.appendChild(factory.createNamedRange("TemplateStart", "=Tabelle1!R7C1"))
				.appendChild(factory.createNamedRange("Zeitraum", "=Tabelle1!R4C2"));
	}

	private ElementBuilder createWorkbook() {
		ElementBuilder workbook = factory.create("Workbook")
				.withAttribute("xmlns:ss", "urn:schemas-microsoft-com:office:spreadsheet") //
				.withAttribute("xmlns:x", "urn:schemas-microsoft-com:office:excel") //
				.withAttribute("xmlns", "urn:schemas-microsoft-com:office:spreadsheet") //
				.withAttribute("xmlns:o", "urn:schemas-microsoft-com:office:office") //
				.withAttribute("xmlns:html", "http://www.w3.org/TR/REC-html40");

		workbook.appendChild(
				factory.create("ExcelWorkbook").withAttribute("xmlns", "urn:schemas-microsoft-com:office:excel") //
						.appendChild(factory.create("WindowHeight").withTextContent("12435")) //
						.appendChild(factory.create("WindowWidth").withTextContent("28800")) //
						.appendChild(factory.create("WindowTopX").withTextContent("0")) //
						.appendChild(factory.create("WindowTopY").withTextContent("0")) //
						.appendChild(factory.create("ProtectStructure").withTextContent("False")) //
						.appendChild(factory.create("ProtectWindows").withTextContent("False")));

		return workbook;
	}

	private ElementBuilder createWorksheet() {

		ElementBuilder worksheet = factory.create("Worksheet").withAttribute("ss:Name", "Tabelle1");
		ElementBuilder table = factory.create("Table") //
				.withAttribute("ss:ExpandedColumnCount", "13") //
				.withAttribute("ss:ExpandedRowCount", "37") //
				.withAttribute("x:FullColumns", "1") //
				.withAttribute("x:FullRows", "1") //
				.withAttribute("ss:DefaultColumnWidth", "60") //
				.withAttribute("ss:DefaultRowHeight", "15");

		table.appendChild(
				factory.create("Column").withAttribute("ss:AutoFitWidth", "0").withAttribute("ss:Width", "88.5"));
		table.appendChild(
				factory.create("Column").withAttribute("ss:AutoFitWidth", "0").withAttribute("ss:Width", "58.5"));

		table.appendChild(
				getPersonalDataRow("Stundenerfassung", "s21", null, null).withAttribute("ss:Height", "26.25"));
		table.appendChild(getPersonalDataRow("Name, Vorname:", "s22",
				messenger.getLastName() + ", " + messenger.getFirstName(), "MA_Name"));
		table.appendChild(getPersonalDataRow("Personalnummer:", "s22", messenger.getMessengerId(), "PersNr"));
		table.appendChild(
				getPersonalDataRow("Monat:", "s22", date.format(DateTimeFormatter.ofPattern("uuuu-MM")), "Zeitraum"));

		table.appendChild(factory.createRow("0"));

		ElementBuilder titleRow = factory.createRow("0").withAttribute("ss:StyleID", "s23");

		for (String title : Arrays.asList("Datum", "Wochentag", "Von", "Bis", "Von", "Bis", "Von", "Bis", "Von", "Bis",
				"Summe", "Datum", "Unterschrift")) {
			titleRow.appendChild(factory.createDataCell("String", title, "s24"));
		}

		table.appendChild(titleRow);

		DoubleDate monthSpan = DateTools.getMonthSpan(date);
		while (monthSpan.getStart().isBefore(monthSpan.getEnd())) {

			table.appendChild(getTimeRow(monthSpan.getStart()));
			monthSpan.setStart(monthSpan.getStart().plusDays(1));
		}

		worksheet.appendChild(table);

		return worksheet;
	}

	private ElementBuilder getPersonalDataRow(String title, String styleID, String value, String name) {

		ElementBuilder row = factory.createRow("0") //
				.appendChild(factory.createDataCell("String", title, styleID))
				.appendChild(factory.createDataCell("String", value, null).namedCell(name));

		return row;
	}

	private ElementBuilder getTimeRow(ZonedDateTime date) {

		ElementBuilder row = factory.createRow("0");

		row.appendChild(factory.createDataCell("DateTime", DateTools.getLocalDateTimeString(date), "s25"));
		row.appendChild(factory.createDataCell("String",
				date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.GERMAN), "s26"));

		List<MessengerShift> shifts = shiftMap.get(date.toLocalDate());

		for (int i = 0; i < 4; i++) {
			ElementBuilder startCell = factory.createCell("s27");
			ElementBuilder endCell = factory.createCell("s27");

			if (shifts != null && shifts.size() > i) {
				MessengerShift shift = shifts.get(i);
				startCell.appendDataElement("DateTime", DateTools
						.getLocalDateTimeString(DateTools.getLocalZonedDateTime(shift.getStart()).withYear(1899).withMonth(12).withDayOfMonth(31)));
				endCell.appendDataElement("DateTime",
						DateTools.getLocalDateTimeString(DateTools.getLocalZonedDateTime(shift.getEnd()).with(LocalDate.of(1899, 12, 31))));
			}
			row.appendChild(startCell);
			row.appendChild(endCell);
		}

		String sumString = "";
		if (!CollectionTools.isEmpty(shifts)) {

			ZonedDateTime sum = ZonedDateTime.of(1899, 12, 31, 0, 0, 0, 0, ZoneId.of("Z"));

			for (MessengerShift shift : shifts) {
				sum = sum.plusSeconds(shift.getEnd().minusSeconds(shift.getStart().toEpochSecond()).toEpochSecond());
			}
			sumString = sum.toLocalDateTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
		}

		row.appendChild(factory.createDataCell("DateTime", sumString, "s27") //
				.withAttribute("ss:Formula", //
						"=RC[-7]-RC[-8]+(RC[-7]<RC[-8])" //
								+ "+RC[-5]-RC[-6]+(RC[-5]<RC[-6])" //
								+ "+RC[-3]-RC[-4]+(RC[-3]<RC[-4])" //
								+ "+RC[-1]-RC[-2]+(RC[-1]<RC[-2])"));

		row.appendChild(factory.createCell("s28"));
		row.appendChild(factory.createCell("s28"));

		return row;
	}

	private ElementBuilder styleWithCompleteBordersAndNumberFormat(String name, String numberFormat) {
		ElementBuilder builder = factory.createStyle(name) //
				.appendChild(factory.create("Borders") //
						.withBorder("Bottom", "Continuous", "1") //
						.withBorder("Left", "Continuous", "1") //
						.withBorder("Right", "Continuous", "1") //
						.withBorder("Top", "Continuous", "1"));

		if (!StringTools.isEmpty(numberFormat)) {
			builder.appendChild(factory.create("NumberFormat").withAttribute("ss:Format", numberFormat));
		}

		return builder;
	}

}