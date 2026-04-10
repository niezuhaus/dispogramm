package net.fahrradexpress.backend.services;

import org.springframework.stereotype.Service;

import net.fahrradexpress.backend.dtos.MessengerDto;
import net.fahrradexpress.backend.entities.Messenger;
import net.fahrradexpress.backend.repositories.MessengerRepository;

@Service
public class MessengerService extends AbstractIdService<Messenger, MessengerDto, MessengerRepository> {

	public MessengerService(MessengerRepository messengerRepository) {
		super(MessengerDto.class, Messenger::new, MessengerDto::new, messengerRepository);
	}
	
}
