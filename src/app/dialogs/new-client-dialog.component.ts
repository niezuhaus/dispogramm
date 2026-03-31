import { Component, EventEmitter, Inject } from '@angular/core';
import { GC } from '../common/GC';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Geolocation } from '../classes/Geolocation';
import { Client } from '../classes/Client';

@Component({
  selector: 'app-new-client-dialog',
  template: `
    <mat-tab-group dynamicHeight class="animated-width">
      <mat-tab label="neue kund:in erstellen">
        <div class="p-4" style="min-width: 400px">
          <div class="m-auto" style="width: fit-content;">
            <mat-button-toggle-group [value]="clientObject.c.billClient" style="margin-bottom: 10px" class="flex flex-row">
              <mat-button-toggle [value]="true" (click)="billClientChange(true)">rechnungskund:in</mat-button-toggle>
              <mat-button-toggle [value]="false" (click)="billClientChange(false)">barkund:in</mat-button-toggle>
            </mat-button-toggle-group>
          </div>
          <mat-form-field>
            <mat-label>name</mat-label>
            <input #name type="text" cdkFocusInitial matInput [(ngModel)]="clientObject.c.name" (keyup)="clientObject.l.name = name.value" />
          </mat-form-field>
          <mat-form-field>
            <mat-label>rufname</mat-label>
            <input #nick type="text" matInput [value]="clientObject.c.name" [(ngModel)]="clientObject.l.name" (focus)="nick.select()" autofocus />
          </mat-form-field>
          <searchinput
            [label]="'straße'"
            [searchOSM]="true"
            (locationSelected)="addressSelected($event)"
            (keyup)="clientObject.c.street = search.searchTerm"
            [(str)]="clientObject.c.street"
            class="w-100"
            (resetted)="clientObject.c.zipCode = ''; clientObject.c.city = ''"
            #search
          >
          </searchinput>
          <mat-form-field>
            <mat-label>postleitzahl</mat-label>
            <input type="text" matInput [(ngModel)]="clientObject.c.zipCode" />
          </mat-form-field>
          <mat-form-field>
            <mat-label>stadt</mat-label>
            <input type="text" matInput [(ngModel)]="clientObject.c.city" />
          </mat-form-field>
          <mat-form-field>
            <mat-label>fred kund:innennummer</mat-label>
            <input type="text" matInput [(ngModel)]="clientObject.c.clientId" />
          </mat-form-field>
          <button mat-raised-button class="fex-button" (click)="this.save()" matDialogClose="true">speichern</button>
        </div>
      </mat-tab>
    </mat-tab-group>
  `,
  styles: [
    `
      * {
        display: flex;
        flex-direction: column;
      }
    `
  ]
})
export class NewClientDialogComponent {
  saved = new EventEmitter<{ c: Client; l: Geolocation }>();
  clientObject: { c: Client; l: Geolocation } = { c: new Client(), l: null };
  nextClientIds: { netto: string; brutto: string };

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      location: Geolocation;
    }
  ) {
    this.clientObject.c.billClient = true;
    if (data?.location) {
      this.clientObject.l = data.location;
      this.clientObject.c.street = data.location.street;
      this.clientObject.c.zipCode = data.location.zipCode;
      this.clientObject.c.city = data.location.city;
    } else {
      this.clientObject.l = new Geolocation();
    }
    this.nextClientIds = GC.nextClientIds();
    this.clientObject.c.clientId = this.nextClientIds.netto;
  }

  save(): void {
    GC.http.createClient(this.clientObject.c).subscribe((client) => {
      this.clientObject.c = client;
      if (this.clientObject.l) {
        this.clientObject.l.clientId = client.id;
        if (!this.clientObject.l.id) {
          GC.http.createLocation(this.clientObject.l).subscribe((l) => {
            GC.openSnackBarLong(`kund:in und standort ${client.name} wurden gespeichert!`);
            this.clientObject.l = l;
            this.saved.emit(this.clientObject);
          });
        } else {
          console.log(this.clientObject.l);
          GC.http.updateLocation(this.clientObject.l).subscribe((l) => {
            GC.openSnackBarLong(`kund:in und standort ${client.name} wurden gespeichert!`);
            this.clientObject.l = l;
            this.saved.emit(this.clientObject);
          });
        }
      } else {
        GC.openSnackBarLong(`kund:in ${client.name} wurde gespeichert!`);
        this.saved.emit(this.clientObject);
      }
    });
  }

  billClientChange(isBillClient: boolean): void {
    this.clientObject.c.billClient = isBillClient;
    this.clientObject.c.clientId = isBillClient ? this.nextClientIds.netto : this.nextClientIds.brutto;
  }

  addressSelected(loc: Geolocation): void {
    loc.name = this.clientObject.l.name;
    this.clientObject.l = loc;
    this.clientObject.c.street = loc.street;
    this.clientObject.c.zipCode = loc.zipCode;
    this.clientObject.c.city = loc.city;
  }
}
