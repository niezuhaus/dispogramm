package net.fahrradexpress.backend.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import net.fahrradexpress.backend.dtos.ClientDto;
import net.fahrradexpress.backend.dtos.statistics.ClientComparisonDto;
import net.fahrradexpress.backend.entities.Client;
import net.fahrradexpress.backend.repositories.ClientRepository;
import net.fahrradexpress.backend.tools.StringTools;
import net.fahrradexpress.backend.utils.CsvImporter;

@Service
public class ClientService extends AbstractIdService<Client, ClientDto, ClientRepository> {
	
	public enum ClientOrigin {
		DISPO,
		FRED,
		LEX
	}

	public ClientService(ClientRepository clientRepository) {
		super(ClientDto.class, Client::new, ClientDto::new, clientRepository);
	}

	protected Client findByClientId(String clientId) {
		return cache.getFiltered().withString("clientId", clientId).getFirst();
	}

	public List<ClientDto> compareList(MultipartFile file) {

		List<ClientDto> result = new ArrayList<>();

		for (String[] elements : CsvImporter.getElements(file)) {

			ClientDto clientInList = new ClientDto();
			clientInList.setName(elements[0]);
			clientInList.setClientId(elements[3]);
			clientInList.setStreet(elements[4]);
			clientInList.setZipCode(elements[5]);
			clientInList.setCity(elements[6]);

			List<Client> clientsInDatabase = cache.getFiltered().withString("clientId", clientInList.getClientId())
					.getList();

			if (clientsInDatabase.size() == 1) {
				Client clientInDatabase = clientsInDatabase.get(0);

				if (!StringTools.stringAlmostEquals(clientInList.getName(), clientInDatabase.getName()) //
						|| !StringTools.stringAlmostEquals(clientInList.getStreet(), clientInDatabase.getStreet()) //
						|| !StringTools.stringAlmostEquals(clientInList.getZipCode(), clientInDatabase.getZipCode()) //
						|| !StringTools.stringAlmostEquals(clientInList.getCity(), clientInDatabase.getCity())) {
					result.add(toDto(clientInDatabase));
					result.add(clientInList);
				}
			}
		}
		return result;
	}
	
	public List<ClientComparisonDto> compareClients(MultipartFile fred, MultipartFile lex) {
		Map<String, ClientComparisonDto> result = new HashMap<>();
		
		for (Client client : cache.findAll()) {
			addClientToComp(result, toDto(client), ClientOrigin.DISPO);
		}
		
		for (String[] fredClient : CsvImporter.getElements(fred, ClientOrigin.FRED)) {
			ClientDto fredClientDto = new ClientDto();
			fredClientDto.setName(fredClient[0]);
			fredClientDto.setClientId(fredClient[3]);
			fredClientDto.setStreet(fredClient[4]);
			fredClientDto.setZipCode(fredClient[5]);
			fredClientDto.setCity(fredClient[6]);	
			
			addClientToComp(result, fredClientDto, ClientOrigin.FRED);
		}
		
		for (String[] lexClient : CsvImporter.getElements(lex, ClientOrigin.LEX)) {
			ClientDto lexClientDto = new ClientDto();
			lexClientDto.setClientId(lexClient[0]);
			lexClientDto.setName(lexClient[1]);
			lexClientDto.setStreet(lexClient[3]);
			lexClientDto.setZipCode(lexClient[10]);
			lexClientDto.setCity(lexClient[11]);
			
			addClientToComp(result, lexClientDto, ClientOrigin.LEX);
		}
		
		
		return result.values().stream().collect(Collectors.toList());
	}
	
	private void addClientToComp(Map<String, ClientComparisonDto> map, ClientDto clientDto, ClientOrigin origin) {
		if (!map.containsKey(clientDto.getClientId())) {
			ClientComparisonDto comp = new ClientComparisonDto();
			map.put(clientDto.getClientId(), comp);
			comp.setFredClient(clientDto);
		}
				
		ClientComparisonDto comparison = map.get(clientDto.getClientId());
		switch(origin) {
		case DISPO: comparison.setDispoClient(clientDto); break;
		case FRED: comparison.setFredClient(clientDto); break;
		case LEX: comparison.setLexClient(clientDto); break;
		}
	}

}
