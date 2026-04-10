package net.fahrradexpress.backend.utils;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Document;

public abstract class XMLExporter {

	protected ElementBuilderFactory factory;

	private Document document;
	
	public XMLExporter() throws ParserConfigurationException, TransformerException {
		this.document = DocumentBuilderFactory.newDefaultInstance().newDocumentBuilder().newDocument();
		this.factory = new ElementBuilderFactory(document);
	}
	
	public ByteArrayInputStream export() {

		document.appendChild(createRootElement().getElement());
		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
		writeXml(outputStream);

		return new ByteArrayInputStream(outputStream.toByteArray());
	}
	
	private void writeXml(ByteArrayOutputStream output) {

		try {
			TransformerFactory transformerFactory = TransformerFactory.newInstance();
			Transformer transformer = transformerFactory.newTransformer();

			transformer.setOutputProperty(OutputKeys.INDENT, "yes");

			DOMSource source = new DOMSource(document);
			StreamResult result = new StreamResult(output);
			transformer.transform(source, result);
		} catch (TransformerException e) {
			e.printStackTrace();
		}

	}
	
	protected abstract ElementBuilder createRootElement();

}
