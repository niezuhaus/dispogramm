import { Component, Inject, ViewChild } from '@angular/core';
import { SpecialPrice } from '../classes/SpecialPrice';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SearchinputComponent } from '../views/newtour/inputfield/searchinput/searchinput.component';
import { Client } from '../classes/Client';

@Component({
  selector: 'app-special-price-dialog',
  template: `
    <mat-tab-group dynamicHeight class="animated-width">
      <mat-tab label="{{ new ? 'neuen sonderpreis erstellen' : 'sonderpreis bearbeiten' }}">
        <div class="flex flex-column p-4">
          <mat-form-field style="width: 250px">
            <mat-label>name</mat-label>
            <input matInput type="text" [(ngModel)]="specialPrice.name" autofocus />
          </mat-form-field>

          <searchinput
            #searchbar
            [width]="'250px'"
            [placeholder]="'name, kund:innennummer'"
            [label]="'kund:innen verknüpfen'"
            [searchClients]="true"
            (clientClientSelected)="clientSelected($event)"
          ></searchinput>

          <mat-chip-listbox *ngIf="specialPrice.clients.length" selectable multiple class="mb-3">
            <mat-chip-option *ngFor="let client of specialPrice.clients" (removed)="specialPrice.clients.findAndRemove(client)">
              {{ client.name }}
              <button matChipRemove><mat-icon>cancel</mat-icon></button>
            </mat-chip-option>
          </mat-chip-listbox>

          <mat-form-field style="width: 250px">
            <mat-label>preismodell</mat-label>
            <mat-select #mode [(ngModel)]="specialPrice.type">
              <mat-option [value]="0">keine auswahl</mat-option>
              <mat-option [value]="2">gruppentarif</mat-option>
              <mat-option [value]="3">grundpreis + inkludierte stops</mat-option>
            </mat-select>
          </mat-form-field>

          <div *ngIf="mode.value === 2" class="flex flex-row align-items-center mb-3">
            <app-price-input [width]="45" [(price)]="specialPrice.group" [type]="0"></app-price-input>
            <span class="ml-2">€ pro stop</span>
          </div>

          <div *ngIf="mode.value === 3" class="mb-3">
            <div class="flex flex-row align-items-center mb-2">
              <app-price-input [width]="45" [(price)]="specialPrice.base" [type]="0"></app-price-input>
              <span class="mx-2">€ für</span>
              <mat-form-field style="width: 45px">
                <input #number [(ngModel)]="specialPrice.quantityIncluded" matInput type="number" />
              </mat-form-field>
              <span class="ml-2">stop{{ number.valueAsNumber > 1 ? 's' : '' }}</span>
            </div>
            <div class="flex flex-row align-items-center">
              <app-price-input [width]="45" [(price)]="specialPrice.extra" [type]="0"></app-price-input>
              <span class="ml-2">€ für jeden weiteren</span>
            </div>
          </div>

          <mat-checkbox [(ngModel)]="specialPrice.grossPrice" class="mb-4">preise sind barpreise</mat-checkbox>

          <searchinput
            #zoneSearchbar
            [width]="'250px'"
            [label]="'zone hinzufügen'"
            [searchPostCodeZones]="true"
            [searchZones]="true"
            (zoneSelected)="specialPrice.zones.push($event); zoneSearchbar.reset()"
          ></searchinput>

          <mat-chip-listbox *ngIf="specialPrice.zones?.length" selectable multiple class="mb-3 mt-3">
            <mat-chip-option *ngFor="let zone of specialPrice.zones" (removed)="specialPrice.zones.findAndRemove(zone)">
              {{ zone.name }}
              <button matChipRemove><mat-icon>cancel</mat-icon></button>
            </mat-chip-option>
          </mat-chip-listbox>
          <button mat-raised-button class="mt-3 fex-button" mat-dialog-close (click)="specialPrice.save()">speichern</button>
        </div>
      </mat-tab>
    </mat-tab-group>
  `,
  styles: []
})
export class SpecialPriceDialogComponent {
  specialPrice = new SpecialPrice();
  new = true;
  @ViewChild('searchbar') searchbar: SearchinputComponent;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      specialPrice: SpecialPrice;
    }
  ) {
    if (data.specialPrice) {
      this.new = false;
      this.specialPrice = new SpecialPrice(data.specialPrice);
    }
  }

  clientSelected(client: Client): void {
    if (!this.specialPrice.clients.fastfind(client.id)) {
      this.specialPrice.clients.push(client);
    }
    this.searchbar.reset();
  }
}
