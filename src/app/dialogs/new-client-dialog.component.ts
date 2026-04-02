import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { GC } from '../common/GC';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Geolocation } from '../classes/Geolocation';
import { Client } from '../classes/Client';
import { FormControl, NgForm, FormGroupDirective } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

class SaveAttemptErrorStateMatcher implements ErrorStateMatcher {
  constructor(private shouldShowErrors: () => boolean) {}
  isErrorState(control: FormControl | null, _form: FormGroupDirective | NgForm | null): boolean {
    return !!control && control.invalid && (control.touched || control.dirty || this.shouldShowErrors());
  }
}

@Component({
  selector: 'app-new-client-dialog',
  template: `
    <div [appShakeOnInvalidSubmit]="saveAttemptCount" [appShakeInvalid]="!canSave()">
      <mat-tab-group dynamicHeight class="animated-width">
        <mat-tab label="neue kund:in erstellen">
          <div class="flex flex-col pb-4 px-4" style="min-width: 400px">
            <div class="m-auto mb-4" style="width: fit-content;">
              <mat-button-toggle-group [value]="clientObject.c.billClient" style="margin-bottom: 10px" class="flex flex-row">
                <mat-button-toggle [value]="true" (click)="billClientChange(true)">rechnungskund:in</mat-button-toggle>
                <mat-button-toggle [value]="false" (click)="billClientChange(false)">barkund:in</mat-button-toggle>
              </mat-button-toggle-group>
            </div>
            <mat-form-field>
              <mat-label>name</mat-label>
              <input
                #name
                type="text"
                cdkFocusInitial
                matInput
                required
                [(ngModel)]="clientObject.c.name"
                (keyup)="clientObject.l.name = name.value"
                [errorStateMatcher]="saveAttemptMatcher"
                #nameModel="ngModel"
              />
              <mat-error *ngIf="nameModel.hasError('required')">feld darf nicht leer sein</mat-error>
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
            <button mat-raised-button class="fex-button" (click)="onSaveClicked()">speichern</button>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: []
})
export class NewClientDialogComponent implements OnInit {
  saved = new EventEmitter<{ c: Client; l: Geolocation }>();
  clientObject: { c: Client; l: Geolocation } = { c: new Client(), l: null };
  nextClientIds: { netto: string; brutto: string };
  saveAttempted = false;
  saveAttemptCount = 0;
  saveAttemptMatcher: ErrorStateMatcher;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      location: Geolocation;
    }
  ) {
    this.saveAttemptMatcher = new SaveAttemptErrorStateMatcher(() => this.saveAttempted);
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

  ngOnInit(): void {}

  canSave(): boolean {
    return !!(this.clientObject.c.name || '').trim();
  }

  onSaveClicked(): void {
    this.saveAttempted = true;
    this.saveAttemptCount += 1;
    if (!this.canSave()) return;
    this.save();
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
            GC.dialog.closeAll();
          });
        } else {
          console.log(this.clientObject.l);
          GC.http.updateLocation(this.clientObject.l).subscribe((l) => {
            GC.openSnackBarLong(`kund:in und standort ${client.name} wurden gespeichert!`);
            this.clientObject.l = l;
            this.saved.emit(this.clientObject);
            GC.dialog.closeAll();
          });
        }
      } else {
        GC.openSnackBarLong(`kund:in ${client.name} wurde gespeichert!`);
        this.saved.emit(this.clientObject);
        GC.dialog.closeAll();
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
