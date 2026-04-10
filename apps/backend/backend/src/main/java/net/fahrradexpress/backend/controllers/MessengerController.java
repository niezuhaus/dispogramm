package net.fahrradexpress.backend.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.fahrradexpress.backend.dtos.MessengerDto;
import net.fahrradexpress.backend.services.MessengerService;

@RestController
@RequestMapping("/messengers")
public class MessengerController extends AbstractController<MessengerDto, MessengerService> {

	public MessengerController(MessengerService messengerService) {
		super(messengerService);
	}
}
