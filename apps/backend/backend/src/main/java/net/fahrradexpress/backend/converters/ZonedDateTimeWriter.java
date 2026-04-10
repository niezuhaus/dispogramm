package net.fahrradexpress.backend.converters;

import java.time.ZonedDateTime;
import java.util.Date;

import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.WritingConverter;

@WritingConverter
enum ZonedDateTimeWriter implements Converter<ZonedDateTime, Date> {
	
	INSTANCE;

	@Override
	public Date convert(ZonedDateTime source) {
		return Date.from(source.toInstant());
	}

}
