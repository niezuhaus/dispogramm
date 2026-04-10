package net.fahrradexpress.backend.utils;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

import lombok.Getter;
import net.fahrradexpress.backend.tools.StringTools;

public class ElementBuilder {
	
	private ElementBuilderFactory factory;

	private Document document;

	@Getter
	private Element element;

	public ElementBuilder(ElementBuilderFactory factory, Document document) {
		this.factory = factory;
		this.document = document;
	}

	public ElementBuilder init(String name) {
		element = document.createElement(name);
		return this;
	}

	public ElementBuilder appendDataElement(String type, String content) {
		appendChild(factory.create("Data").withAttribute("ss:Type", type).withTextContent(content));
		return this;
	}
	
	public ElementBuilder withTextContent(String text) {
		element.setTextContent(text);
		return this;
	}

	public ElementBuilder withAlignment(String horizontal, String vertical) {
		ElementBuilder alignment = factory.create("Alignment");
		if (horizontal != null) {
			alignment = alignment.withAttribute("ss:Horizontal", "Right");
		}
		if (vertical != null) {
			alignment = alignment.withAttribute("ss:Vertical", "Bottom");
		}

		appendChild(alignment);
		return this;
	}

	public ElementBuilder withAttribute(String name, String value) {
		element.setAttribute(name, value);

		return this;
	}
	
	public ElementBuilder appendChild(ElementBuilder builder) {
		element.appendChild(builder.getElement());
		return this;
	}

	public ElementBuilder appendChild(Element child) {
		element.appendChild(child);
		return this;
	}

	public ElementBuilder withBorder(String position, String lineStyle, String weight) {
		appendChild(factory.create("Border") //
				.withAttribute("ss:Position", position) //
				.withAttribute("ss:LineStyle", lineStyle) //
				.withAttribute("ss:Weight", weight));
		return this;
	}

	public ElementBuilder namedCell(String name) {
		if (!StringTools.isEmpty(name)) {
			appendChild(factory.create("NamedCell").withAttribute("ss:Name", name));
		}

		return this;
	}

}
