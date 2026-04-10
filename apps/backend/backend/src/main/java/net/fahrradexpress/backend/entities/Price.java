package net.fahrradexpress.backend.entities;

import lombok.Data;
import lombok.NoArgsConstructor;
import net.fahrradexpress.backend.dtos.PriceDto;

@Data
@NoArgsConstructor
public class Price {
	
	private Double gross;

	private Double net;
	
	private double vat;

	public Price(PriceDto priceDto) {
		this.gross = priceDto.getBrutto();
		this.net = priceDto.getNetto();
		this.vat = priceDto.getVat();
	}

}
