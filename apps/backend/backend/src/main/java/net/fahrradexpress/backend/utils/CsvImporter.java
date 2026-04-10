package net.fahrradexpress.backend.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import net.fahrradexpress.backend.services.ClientService.ClientOrigin;

public class CsvImporter {
	
	public static List<String[]> getElements(MultipartFile file) {
		return getElements(file, ClientOrigin.FRED);
	}
	
	public static List<String[]> getElements(MultipartFile file, ClientOrigin origin) {

		List<String[]> result = new ArrayList<>();

		try {
			InputStream inputStream = file.getInputStream();
			Charset charSet = origin == ClientOrigin.LEX ? StandardCharsets.UTF_8 : StandardCharsets.UTF_16;
			BufferedReader br = new BufferedReader(new InputStreamReader(inputStream, charSet));

			String line;
			br.readLine();

			while ((line = br.readLine()) != null) {

				line = line.replace("\"", "");
				String[] splitLine = line.split(";");
				String[] elements = new String[splitLine.length];
				Arrays.fill(elements, "");

				for (int i = 0; i < splitLine.length; i++) {
					elements[i] = new String(splitLine[i].strip());
				}

				result.add(elements);
			}

			inputStream.close();
		} catch (IOException e) {
			e.printStackTrace();
		}

		return result;
	}

}
