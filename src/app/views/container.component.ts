import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { take } from 'rxjs/operators';
import { MatMenuTrigger } from '@angular/material/menu';
import { Geolocation } from '../classes/Geolocation';
import { GC } from '../common/GC';
import { LocationDialogComponent } from '../dialogs/location-dialog.component';
import { Contact } from '../classes/Contact';
import { ContactDialogComponent } from '../dialogs/contact-dialog.component';
import { Client } from '../classes/Client';
import { SpecialPriceDialogComponent } from '../dialogs/special-price-dialog.component';
import { SpecialPrice } from '../classes/SpecialPrice';
import { Zone } from '../classes/Zone';
import { ZoneDialogComponent } from '../dialogs/zone-dialog.component';

@Component({
  selector: 'app-container',
  template: `
    <div
      class="container flex align-items-center justify-content-center"
      [class.new]="new"
      [class.existing]="!new"
      [class.deactivated]="type === 'location' && location?.deactivated"
      style="position: relative"
      (mouseenter)="hover = true"
      (mouseleave)="hover = false"
    >
      <div *ngIf="type === 'contact'">
        <div *ngIf="!contact" (click)="openContactDialog()" class="flex flex-column align-items-center justify-content-center">
          <i class="bi bi-plus-circle"></i><br />
          <span>neuer kontakt</span>
        </div>
        <div *ngIf="location" (click)="openContactDialog()" class="flex flex-column">
          <span class="small" style="font-weight: 600">{{ contact.name }}</span>
          <span class="small">{{ contact.phone }}</span>
          <span class="small">{{ contact.email }}</span>
        </div>
      </div>

      <div *ngIf="type === 'location'">
        <div *ngIf="!location" (click)="openLocationDialog()" class="flex flex-column align-items-center justify-content-center">
          <i class="bi bi-plus-circle"></i><br />
          <span>neuer standort</span>
        </div>
        <div *ngIf="location" (click)="openLocationDialog()" (contextmenu)="onRightClick($event)" class="flex flex-column" [class.deactivated-location]="location.deactivated">
          <span class="small" style="font-weight: 600">{{ location.name }}</span>
          <span class="small">{{ location.street }}</span>
          <span class="small">{{ location.zipCode }} {{ location.city }}</span>
          <span *ngIf="location.deactivated" class="small deactivated-label">deaktiviert</span>
        </div>
      </div>

      <div *ngIf="type === 'specialPrice'">
        <div *ngIf="!price" (click)="openSpecialPriceDialog()" class="flex flex-column align-items-center justify-content-center">
          <i class="bi bi-plus-circle"></i><br />
          <span>neuer sonderpreis</span>
        </div>
        <div *ngIf="price" (click)="openSpecialPriceDialog()" class="flex flex-column">
          <span class="small" style="font-weight: 600">{{ price.name }}</span>
          <span class="small"
            ><em>- {{ price.typeString }} -</em></span
          >
          <span class="small" *ngIf="price.type === 2; else baseExtra">
            <em>{{ price.group?._netto }} / stop</em>
          </span>
          <ng-template #baseExtra>
            <span class="small">
              <em
                >{{ price.base?._netto }} für {{ price.quantityIncluded === 1 ? 'einen' : price.quantityIncluded }} stop{{
                  price.quantityIncluded > 1 ? 's' : ''
                }}</em
              >
            </span>
            <span class="small">
              <em>+ {{ price.extra?._netto }} / weiteren stop</em>
            </span>
          </ng-template>
          <span *ngFor="let client of price.clients">
            <small><i class="mr-2 bi bi-person small"></i>{{ client.name }}</small>
          </span>
        </div>
      </div>

      <div *ngIf="type === 'zone'">
        <div *ngIf="!zone" (click)="openZoneDialog()" class="flex flex-column align-items-center justify-content-center">
          <i class="bi bi-plus-circle"></i><br />
          <span>neue zone</span>
        </div>
        <div *ngIf="zone" class="flex flex-column" (click)="openZoneDialog()">
          <span class="small" style="font-weight: 600">{{ zone.name }}</span>
          <span class="small italic" *ngIf="zone.exclusive">außenring-zone</span>
          <span class="small">{{ zone.price._netto }} / stop</span>
          <span class="small">{{ zone.area }}km²</span>
        </div>
      </div>

      <div *ngIf="!new && hover"><i class="pencil bi bi-pencil" (click)="openEditDialog()"></i></div>
    </div>

    <div *ngIf="type === 'location' && location">
      <div
        style="visibility: hidden; position: fixed"
        [style.left.px]="menuTopLeftPosition.x"
        [style.top.px]="menuTopLeftPosition.y"
        [matMenuTriggerFor]="locationMenu"
      ></div>
      <mat-menu #locationMenu="matMenu">
        <ng-template matMenuContent>
          <button mat-menu-item (click)="openLocationDialog()">
            <i class="p-1 bi bi-pencil bi-context"></i>bearbeiten
          </button>
          <button mat-menu-item (click)="toggleDeactivated()">
            <i class="p-1 bi bi-archive bi-context"></i>{{ location.deactivated ? 'aktivieren' : 'deaktivieren' }}
          </button>
        </ng-template>
      </mat-menu>
    </div>
  `,
  styles: [
    `
      @import '../../const.scss';

      .container {
        border-radius: 10px;
        padding: 3px 5px;
        cursor: pointer;
        max-width: 200px;
      }

      .existing {
        border: 2px solid $fex-dark;
      }

      .existing.deactivated {
        border-color: #aaa;
      }

      .new {
        border: 2px dotted $fex-dark;
        min-width: 120px;
        min-height: 70px;
      }

      span {
        hyphens: auto;
      }

      .pencil {
        position: absolute;
        bottom: 5px;
        right: 5px;
        color: $fex-dark;
      }

      .deactivated-location {
        opacity: 0.45;
      }

      .deactivated-label {
        color: #888;
        font-style: italic;
        margin-top: 2px;
      }
    `
  ]
})
export class ContainerComponent implements OnInit {
  @Input() client: Client;
  @Input() location: Geolocation;
  @Input() contact: Contact;
  @Input() price: SpecialPrice;
  @Input() zone: Zone;
  @Input() type: 'location' | 'contact' | 'specialPrice' | 'zone';
  @Output() deleted = new EventEmitter<boolean>();
  @Output() updated = new EventEmitter<Geolocation>();
  @Output() created = new EventEmitter<Geolocation>();
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  hover = false;
  new = false;
  menuTopLeftPosition = { x: 0, y: 0 };

  constructor() {}

  ngOnInit() {
    switch (this.type) {
      case 'contact':
        this.new = !this.contact;
        break;

      case 'location':
        this.new = !this.location;
        break;

      case 'specialPrice':
        this.new = !this.price;
        break;

      case 'zone':
        this.new = !this.zone;
        break;
    }
  }

  openEditDialog(): void {
    switch (this.type) {
      case 'location':
        this.openLocationDialog();
        break;

      case 'contact':
        this.openContactDialog();
        break;

      case 'specialPrice':
        this.openSpecialPriceDialog();
        break;

      case 'zone':
        this.openZoneDialog();
    }
  }

  openContactDialog(): void {
    GC.dialog.open(ContactDialogComponent, {
      data: {
        contact: this.contact,
        client: this.client
      }
    });
  }

  openLocationDialog(): void {
    const dialog = GC.dialog.open(LocationDialogComponent, {
      data: {
        location: this.location,
        client: this.client
      }
    });
    dialog.componentInstance.deleted.pipe(take(1)).subscribe(() => {
      this.deleted.emit(true);
    });
    dialog.componentInstance.created.pipe(take(1)).subscribe((loc) => {
      this.created.emit(loc);
    });
    dialog.componentInstance.updated.pipe(take(1)).subscribe((loc) => {
      this.updated.emit(loc);
    });
  }

  openSpecialPriceDialog(): void {
    GC.dialog.open(SpecialPriceDialogComponent, {
      data: {
        specialPrice: this.price
      }
    });
  }

  openZoneDialog(): void {
    GC.dialog.open(ZoneDialogComponent, {
      data: {
        zone: this.zone
      }
    });
  }

  onRightClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.menuTopLeftPosition.x = event.clientX;
    this.menuTopLeftPosition.y = event.clientY;
    this.matMenuTrigger.openMenu();
  }

  toggleDeactivated(): void {
    this.location.deactivated = !this.location.deactivated;
    GC.http.updateLocation(this.location).subscribe(() => {
      GC.openSnackBarLong(`"${this.location.name}" wurde ${this.location.deactivated ? 'deaktiviert' : 'aktiviert'}.`);
      this.updated.emit(this.location);
    });
  }
}
