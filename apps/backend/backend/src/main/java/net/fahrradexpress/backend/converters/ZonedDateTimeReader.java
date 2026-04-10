package net.fahrradexpress.backend.converters;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;

import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;

@ReadingConverter
enum ZonedDateTimeReader implements Converter<Date, ZonedDateTime> {
	
	INSTANCE;

	@Override
	public ZonedDateTime convert(Date source) {
		return source.toInstant().atZone(ZoneId.systemDefault());
	}

}
