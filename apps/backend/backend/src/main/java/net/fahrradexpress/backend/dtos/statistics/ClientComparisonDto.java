package net.fahrradexpress.backend.dtos.statistics;

import lombok.Data;
import net.fahrradexpress.backend.dtos.ClientDto;

@Data
public class ClientComparisonDto {

	private ClientDto dispoClient;
	
	private ClientDto fredClient;
	
	private ClientDto lexClient;
}
