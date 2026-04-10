
package net.fahrradexpress.backend.services;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerException;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import net.fahrradexpress.backend.dtos.DateDto;
import net.fahrradexpress.backend.dtos.IdAndDateDto;
import net.fahrradexpress.backend.dtos.MessengerShiftDto;
import net.fahrradexpress.backend.entities.Messenger;
import net.fahrradexpress.backend.entities.MessengerShift;
import net.fahrradexpress.backend.repositories.MessengerShiftRepository;
import net.fahrradexpress.backend.tools.DatabaseTools;
import net.fahrradexpress.backend.tools.DateTools;
import net.fahrradexpress.backend.tools.DateTools.DoubleDate;
import net.fahrradexpress.backend.utils.WorkingHoursExporter;

@Service
public class MessengerShiftService extends AbstractIdService<MessengerShift, MessengerShiftDto, MessengerShiftRepository> {

	@Autowired
	private MessengerService messengerService;

	@Autowired
	private JobService jobService;

	public MessengerShiftService(MessengerShiftRepository repository) {
		super(MessengerShift::new, MessengerShiftDto::new, repository);
	}

	@Override
	protected MessengerShiftDto toDto(MessengerShift entity) {
		MessengerShiftDto dto = super.toDto(entity);
		dto.setJobs(jobService.findByMessengerIdAndDateIn(entity.getMessenger(), dto.getStart(), dto.getEnd()));

		return dto;
	}

	public List<MessengerShiftDto> getForToday() {
		return getForDate(ZonedDateTime.now());
	}

	public List<MessengerShiftDto> getForDate(DateDto dto) {
		return getForDate(dto.getDate());
	}

	private List<MessengerShiftDto> getForDate(ZonedDateTime date) {
		return toDtoList(cache.getFiltered().withDateIn("start", DateTools.getOneDaySpan(date)).getList());
	}

	public List<MessengerShiftDto> getForMonth(DateDto dto) {
		return toDtoList(cache.getFiltered().withDateIn("start", DateTools.getMonthSpan(dto.getDate())).getList());
	}

	public ByteArrayInputStream exportForMessengerAndMonth(IdAndDateDto idAndDateDto) {
		try {
			Messenger messenger = messengerService.findEntityById(idAndDateDto.getId());
			Map<LocalDate, List<MessengerShift>> shiftMap = getShiftMap(
					getForMessengerAndMonth(idAndDateDto.getId(), idAndDateDto.getDate()));
			WorkingHoursExporter xmlExporter = new WorkingHoursExporter(idAndDateDto.getDate(), messenger, shiftMap);
			return xmlExporter.export();
		} catch (ParserConfigurationException | TransformerException e) {
			e.printStackTrace();
		}

		return new ByteArrayInputStream(null);
	}

	public List<MessengerShiftDto> getForMessengerAndMonth(IdAndDateDto idAndDateDto) {
		return toDtoList(getForMessengerAndMonth(idAndDateDto.getId(), idAndDateDto.getDate()));
	}

	//TODO: could be useful to generalize
	private Map<LocalDate, List<MessengerShift>> getShiftMap(List<MessengerShift> shifts) {
		Map<LocalDate, List<MessengerShift>> result = new HashMap<>();

		for (MessengerShift shift : shifts) {
			LocalDate date = shift.getStart().toLocalDate();
			if (!result.containsKey(date)) {
				result.put(date, new ArrayList<>());
			}
			result.get(date).add(shift);
		}
		return result;
	}

	private List<MessengerShift> getForMessengerAndMonth(String id, ZonedDateTime date) {

		List<MessengerShift> result = new ArrayList<>();

		if (DatabaseTools.isValidId(id)) {
			ObjectId messengerId = DatabaseTools.getObjectId(id);
			DoubleDate monthSpan = DateTools.getMonthSpan(date);

			result.addAll(cache.getFiltered().withId("messenger", messengerId).withDateIn("start", monthSpan).getList());
		}
		return result;
	}
	
	@Override
	public void saveAll() {
		List<MessengerShift> shifts = this.cache.findAll();
		
		for (MessengerShift shift : shifts) {
			int newType;
			
			switch(shift.getType()) {
			case 0: newType = 2; break;
			case 1: newType = 6; break;
			case 2: newType = 3; break;
			case 3: newType = 4; break;
			case 4: newType = 5; break;
			case 5: newType = 0; break;
			default : newType = 1; break;			
			}
			
			shift.setType(newType);
		}
		shifts.forEach(s -> save(s));
	}

}
