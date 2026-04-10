package net.fahrradexpress.backend.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;
import net.fahrradexpress.backend.entities.Price;

@Data
@NoArgsConstructor

public class PriceDto {

	private Double brutto;
	
	private Double netto;
	
	private double vat;
	
	public PriceDto(Price price) {
		
		if (price != null) {
			this.brutto = price.getGross();
			this.netto = price.getNet();
			this.vat = price.getVat();
		}
	}
}
