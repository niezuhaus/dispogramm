package net.fahrradexpress.backend.services;

import java.util.List;

import org.springframework.stereotype.Service;

import net.fahrradexpress.backend.dtos.ExpenseDto;
import net.fahrradexpress.backend.dtos.IdAndDateDto;
import net.fahrradexpress.backend.entities.Expense;
import net.fahrradexpress.backend.repositories.ExpenseRepository;
import net.fahrradexpress.backend.tools.DatabaseTools;
import net.fahrradexpress.backend.tools.DateTools;

@Service
public class ExpenseService extends AbstractIdService<Expense, ExpenseDto, ExpenseRepository> {

	public ExpenseService(ExpenseRepository repository) {
		super(Expense::new, ExpenseDto::new, repository);
	}

	public List<ExpenseDto> findByClientAndMonth(IdAndDateDto idAndDateDto) {
		return toDtoList(cache.getFiltered().withId("client", DatabaseTools.getObjectId(idAndDateDto))
				.withDateIn(DateTools.getMonthSpan(idAndDateDto.getDate())).getList());
	}

}
