package net.fahrradexpress.backend.entities;

import lombok.Data;
import lombok.NoArgsConstructor;
import net.fahrradexpress.backend.dtos.ConfigValueDto;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;


@Data
@NoArgsConstructor
public class ConfigValue implements BaseEntity{

	@Id
	private ObjectId _id;
	
	private String name;
	
	private String value;
	
	public ConfigValue(ConfigValueDto dto) {
		this.name = dto.getName();
		this.value = dto.getValue();
	}
	
}
