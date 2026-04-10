package net.fahrradexpress.backend.utils;

import org.w3c.dom.Document;

public class ElementBuilderFactory {
	
	private Document document;
	
	public ElementBuilderFactory(Document document) {
		this.document = document;
	}
	
	public ElementBuilder create(String name) {
		return new ElementBuilder(this, document).init(name);
	}
	
	public ElementBuilder createStyle(String styleID) {
		return create("Style").withAttribute("ss:ID", styleID);
	}
	
	public ElementBuilder createCell(String styleID) {
		ElementBuilder builder = create("Cell");
		return styleID != null ? builder.withAttribute("ss:StyleID", styleID) : builder;
	}
	
	public ElementBuilder createDataCell(String type, String content, String styleID) {
		return createCell(styleID).appendDataElement(type, content);
	}
	
	public ElementBuilder createNamedRange(String name, String reference) {
		return create("NamedRange") //
				.withAttribute("ss:Name", name) //
				.withAttribute("ss:RefersTo", reference);
	}
	
	public ElementBuilder createCalibri(String size) {
		return create("Font") //
				.withAttribute("ss:FontName", "Calibri") //
				.withAttribute("x:Family", "Swiss") //
				.withAttribute("ss:Size", size); //
	}

	public ElementBuilder createBoldCalibri(String size) {
		return createCalibri(size) //
				.withAttribute("ss:Bold", "1");

	}
	
	public ElementBuilder createRow(String autoFitHeight) {
		return create("Row").withAttribute("ss:AutoFitHeight", autoFitHeight);
	}

}
