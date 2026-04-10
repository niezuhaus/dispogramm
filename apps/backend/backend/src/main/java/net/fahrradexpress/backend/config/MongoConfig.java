package net.fahrradexpress.backend.config;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

@Configuration
public class MongoConfig {
	
	@Bean
	public MongoCustomConversions mongoCustomConversions() {
		List<Converter<?,?>> converters = new ArrayList<>();
		converters.add(ZonedDateTimeWriter.INSTANCE);
		converters.add(ZonedDateTimeReader.INSTANCE);
		return new MongoCustomConversions(converters);
	}

	@WritingConverter
	enum ZonedDateTimeWriter implements Converter<ZonedDateTime, Date> {
		
		INSTANCE;

		@Override
		public Date convert(ZonedDateTime source) {
			return Date.from(source.toInstant());
		}

	}
	
	@ReadingConverter
	enum ZonedDateTimeReader implements Converter<Date, ZonedDateTime> {
		
		INSTANCE;

		@Override
		public ZonedDateTime convert(Date source) {
			return source.toInstant().atZone(ZoneId.of("Z"));
		}

	}
}
