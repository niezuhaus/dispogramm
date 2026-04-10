package net.fahrradexpress.backend.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.fahrradexpress.backend.dtos.ExpenseDto;
import net.fahrradexpress.backend.dtos.IdAndDateDto;
import net.fahrradexpress.backend.services.ExpenseService;

@RestController
@RequestMapping("/expenses")
public class ExpenseController extends AbstractController<ExpenseDto, ExpenseService> {
	
	public ExpenseController(ExpenseService expenseService) {
		super(expenseService);
	}
	
	@PostMapping("/client/month")
	List<ExpenseDto> findByClientAndMonth(@RequestBody IdAndDateDto idAndDateDto) {
		return service.findByClientAndMonth(idAndDateDto);
	}
	
	//TODO: checken wie sich das insgesamt verhält. Es darf duch das speichern einer Auslage kein neuer KundInnen Eintrag angelegt werden.

}
