package net.fahrradexpress.backend.utils;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import net.fahrradexpress.backend.dtos.JobDto;
import net.fahrradexpress.backend.dtos.LocationDto;

public class PdfExporter {
	
	private BaseFont timesFont;
	
	private PdfContentByte contentByte;
	
	private NumberFormat euroFormat = NumberFormat.getCurrencyInstance(Locale.GERMANY);
	
	public ByteArrayInputStream createTaskList(List<JobDto> jobs) {
		
		Document document = new Document(PageSize.A4, 0, 0, 0, 0);
		ByteArrayOutputStream out = new ByteArrayOutputStream();
		
		try {
			
			PdfWriter writer = PdfWriter.getInstance(document, out);
			
			document.open();
			
			contentByte = writer.getDirectContent();
			timesFont = BaseFont.createFont(BaseFont.TIMES_ROMAN, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
			
			document.add(createTaskTable(jobs));
			
			document.close();
			
		} catch (DocumentException | IOException e) {
			e.printStackTrace();
		}
		
		return new ByteArrayInputStream(out.toByteArray());
	}
		
	private PdfPTable createTaskTable(List<JobDto> jobs) {
		PdfPTable table = new PdfPTable(6);		
		table.setSpacingBefore(30.0f);
		Font font = new Font(Font.TIMES_ROMAN, 8);
		Font headerFont = new Font(Font.TIMES_ROMAN, 10);
		
		contentByte.setFontAndSize(timesFont, 10);
		contentByte.beginText();
//		placeText("fahrten", 60, 800);
		contentByte.endText();
		
		
		table.addCell(getHeaderCell("datum", headerFont, 1, 5));
		table.addCell(getHeaderCell("abholungen", headerFont, 2, 5));
		table.addCell(getHeaderCell("abgaben", headerFont, 2, 5));
		table.addCell(getHeaderCell("preis (ohne mwst.)", headerFont, 1, 5));
		
		for (JobDto job : jobs) {
			table.addCell(getBorderlessCell(job.getDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy hh:mm")), font, 1));
			table.addCell(getBorderlessCell(locationNames(job.getPickups()), font, 2));
			table.addCell(getBorderlessCell(locationNames(job.getDeliveries()), font, 2));
			table.addCell(getBorderlessCell(euroFormat.format(job.getPrice().getNetto()), font, 1));
		}
		
		return table;
	}
	
	private String locationNames(List<LocationDto> locations) {
		return locations.stream().map(l -> l.getName()).collect(Collectors.joining(", "));
	}

		
	private PdfPCell getBorderlessCell(String content, Font font, int colspan) {
		PdfPCell cell = new PdfPCell(new Phrase(content, font));
		
		cell.setBorder(Rectangle.NO_BORDER);
		cell.setHorizontalAlignment(Element.ALIGN_LEFT);
		cell.setColspan(colspan);
		
		return cell;
	}

	private PdfPCell getHeaderCell(String content, Font font, int colspan, float paddingTopBottom) {
		PdfPCell cell = new PdfPCell(new Phrase(content, font));

		cell.setBorder(Rectangle.BOTTOM);;
		cell.setHorizontalAlignment(Element.ALIGN_LEFT);
		cell.setColspan(colspan);
		cell.setPaddingTop(paddingTopBottom);
		cell.setPaddingBottom(paddingTopBottom);

		return cell;
	}
	
//	private void placeText(String text, float x, float y) {
//		contentByte.setTextMatrix(x, y);
//		contentByte.showText(text);
//	}

}
