package net.fahrradexpress.backend.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import net.fahrradexpress.backend.dtos.ContactDto;
import net.fahrradexpress.backend.dtos.IdDto;
import net.fahrradexpress.backend.dtos.LocationDto;
import net.fahrradexpress.backend.entities.Client;
import net.fahrradexpress.backend.entities.Contact;
import net.fahrradexpress.backend.repositories.ContactRepository;
import net.fahrradexpress.backend.tools.DatabaseTools;
import net.fahrradexpress.backend.tools.StringTools;
import net.fahrradexpress.backend.utils.CsvImporter;

@Service
public class ContactService extends AbstractIdService<Contact, ContactDto, ContactRepository> {

	@Autowired
	ClientService clientService;
	
	@Autowired
	LocationService locationService;

	public ContactService(ContactRepository repository) {
		super(Contact::new, ContactDto::new, repository);
	}

	public List<ContactDto> findByClient(IdDto idDto) {
		return toDtoList(cache.getFiltered().withId("client", DatabaseTools.getObjectId(idDto)).getList());
	}

	public List<ContactDto> findByLocation(IdDto idDto) {
		return toDtoList(cache.getFiltered().withId("location", DatabaseTools.getObjectId(idDto)).getList());
	}

	public List<ContactDto> importContacts(MultipartFile file) {

		List<ContactDto> result = new ArrayList<>();

		for (String[] element : CsvImporter.getElements(file)) {

			if (!StringTools.isEmpty(element[3]) && !StringTools.isEmpty(element[7])) {

				Client client = clientService.findByClientId(element[3]);

				if (client != null) {
					ContactDto contact = new ContactDto();
					contact.setName(client.getName());
					contact.setClient(clientService.toDto(client));
					
					List<LocationDto> locations = locationService.findByClientId(client.get_id().toHexString());
					if (locations.size() == 1) {
						contact.setLocation(locations.get(0));
					} else {
						System.out.println("client: " + client.getName() + " locations: " + locations.size());
					}
					contact.setPhone(element[7]);

					result.add(contact);
				}
			}
		}
		return result;
	}

}
