package net.fahrradexpress.backend.services;

import java.util.List;

import org.springframework.stereotype.Service;

import net.fahrradexpress.backend.dtos.DateDto;
import net.fahrradexpress.backend.dtos.NoteDto;
import net.fahrradexpress.backend.entities.Note;
import net.fahrradexpress.backend.repositories.NoteRepository;
import net.fahrradexpress.backend.tools.DateTools;

@Service
public class NoteService extends AbstractIdService<Note, NoteDto, NoteRepository>{

	public NoteService(NoteRepository repository) {
		super(Note::new, NoteDto::new, repository);
	}
	
	public List<NoteDto> findByDate(DateDto dateDto) {
		return toDtoList(cache.getFiltered().withDateIn(DateTools.getOneDaySpan(dateDto.getDate())).getList());
	}

}
