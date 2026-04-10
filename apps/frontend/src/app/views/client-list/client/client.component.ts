import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../../http.service';
import { Observable, Subject, zip } from 'rxjs';
import { Contact } from '../../../classes/Contact';
import jsPDF from 'jspdf';
import { Job, RegularJob } from '../../../classes/Job';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { DateAdapter } from '@angular/material/core';
import { MatSort } from '@angular/material/sort';
import { AreYouSureDialogComponent } from '../../../dialogs/are-you-sure-dialog.component';
import { GC } from '../../../common/GC';
import { map, take, takeUntil } from 'rxjs/operators';
import { Price } from '../../../classes/Price';
import { Location } from '@angular/common';
import { MatMenuTrigger } from '@angular/material/menu';
import { Geolocation } from '../../../classes/Geolocation';
import { AsyncTitleComponent } from '../../app.component';
import { Client } from '../../../classes/Client';
import { LexContact, LexInvoice } from '../../../classes/LexInvoice';
import { HasUnsavedChanges } from '../../../guards/unsaved-changes.guard';

@Component({
  selector: 'app-client',
  templateUrl: 'client.component.html',
  styleUrls: ['client.component.scss']
})
export class ClientComponent extends AsyncTitleComponent implements OnInit, AfterViewInit, OnDestroy, HasUnsavedChanges {
  override titleEmitter = new EventEmitter<string>();
  override title = '';

  client: Client;
  lexContact: LexContact;
  clientBackup: Client = null;
  newStreet: Geolocation;
  locations: Geolocation[];
  contacts: Contact[] = [];
  jobs: Job[];
  sum = new Price();
  regularJobs: RegularJob[] = [];

  date: Date;
  years: number[] = [];
  dataSource: MatTableDataSource<Job>;
  displayedColumns: string[] = ['date', 'description', 'traveldist', 'price'];
  monthsSelection: number;
  yearSelection: number;
  loading = true;
  loadingTours = false;
  menuTopLeftPosition = { x: 0, y: 0 };
  private destroy$ = new Subject<void>();

  get totalSum() {
    const rjs = this.regularJobs
      .filter((rj) => this.date.isBefore(rj.startDate) && (!rj.endDate || this.date.monthStart().isBefore(rj.endDate)))
      .reduce((pv, cv) => pv.add(cv.monthlyPrice), new Price());
    return this.sum._add(rjs);
  }

  get routes() {
    return GC.routes;
  }

  get isDezwo() {
    return GC._isDezwo;
  }

  get config() {
    return GC.config;
  }

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('table') table: MatTable<Job>;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dateAdapter: DateAdapter<Date>,
    private location: Location
  ) {
    super();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.date = new Date().monthStart();
    for (let i = 2019; i <= this.date.getFullYear(); i++) {
      this.years.push(i);
    }
    this.monthsSelection = this.date.getMonth();
    this.yearSelection = this.date.getFullYear();
  }

  ngAfterViewInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      GC.loaded()
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          GC.http
            .getClient(params.get('id'))
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (client) => {
                if (GC.config.lexofficeActivated) {
                  GC.http
                    .lex_findClient(client)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe((c) => {
                      this.lexContact = c;
                    });
                }
                this.clientBackup = new Client(client);
                this.client = new Client(client);
                this.titleEmitter.emit(client.name);
                this.title = client.name;
                this.query(this.date);
              },
              error: (error) => {
                console.log(error);
              }
            });
        });
    });
  }

  query(date: Date): void {
    this.date = date;
    this.loadingTours = true;
    GC.http
      .jobsForClientInMonth(this.client.id, date)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (jobs) => {
          this.getRegularJobs()
            .pipe(takeUntil(this.destroy$))
            .subscribe((rjs) => {
              this.regularJobs = rjs;
            });
          this.jobs = jobs.filter((j) => !j.regularJobId);
          this.dataSource = new MatTableDataSource(this.jobs);
          this.dataSource.sort = this.sort;
          this.dataSource.sortingDataAccessor = (item, property): string | number => {
            switch (property) {
              case 'date':
                return new Date(item.date).getTime();
              case 'traveldist':
                return item.traveldist;
              case 'price':
                return item.price._netto;
              default:
                return property;
            }
          };
          this.sum = new Price();
          jobs
            .filter((j) => !j.regularJobId)
            .forEach((j) => {
              this.sum.add(j.price);
            });
          this.loadingTours = false;
          this.getLocations();
        },
        error: (err) => {
          console.log(err);
        }
      });
  }

  getLocations(): void {
    GC.http
      .getLocationsByClientId(this.client.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((locs) => {
        this.locations = locs;
        this.loading = false;
      });
  }

  getContacts(): void {
    GC.http
      .getContactsForClient(this.client)
      .pipe(takeUntil(this.destroy$))
      .subscribe((contacts) => {
        this.contacts = contacts;
      });
  }

  getRegularJobs(): Observable<RegularJob[]> {
    return GC.http.getRegularJobListForClient(this.client.id).pipe(
      map((rjs) => {
        this.regularJobs = rjs;
        return rjs;
      })
    );
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.data = this.jobs.filter((j) => {
      return j.contains(filterValue);
    });
  }

  hasUnsavedChanges(): boolean {
    if (!this.client || !this.clientBackup) return false;
    const fields: (keyof Client)[] = ['clientId', 'name', 'street', 'zipCode', 'city', 'info', 'billClient'];
    return fields.some((f) => this.client[f] !== this.clientBackup[f]);
  }

  save(): void {
    GC.http.updateClient(this.client).subscribe(() => {
      const idx = GC.clients.findIndex((c) => c.id === this.client.id);
      if (idx >= 0) GC.clients[idx] = this.client;
    });
  }

  streetSelected(loc: Geolocation): void {
    loc.clientId = this.client.id;
    this.newStreet = loc;
    this.client.street = loc.street;
    this.client.zipCode = loc.zipCode;
    this.client.city = loc.city;
  }

  saveClient(): void {
    let calls: Observable<any>[];

    const makeCall = (msg: string) => {
      if (GC.config.lexofficeActivated) {
        calls.push(GC.http.lex_updateContact(this.lexContact.setClient(this.client)));
      }
      zip(calls).subscribe(() => {
        const idx = GC.clients.findIndex((c) => c.id === this.client.id);
        if (idx >= 0) GC.clients[idx] = this.client;
        this.clientBackup = new Client(this.client);
        this.getLocations();
        GC.openSnackBarLong(msg);
      });
    };

    const proceedWithStreet = (renameLocations: boolean) => {
      if (renameLocations) {
        const matchingLocs = this.locations.filter((loc) => loc.name === this.clientBackup.name);
        matchingLocs.forEach((loc) => (loc.name = this.client.name));
        calls = [GC.http.updateClient(this.client), ...matchingLocs.map((loc) => GC.http.updateLocation(loc))];
      } else {
        calls = [GC.http.updateClient(this.client)];
      }

      if (!!this.newStreet && this.locations.map((loc) => loc.street).has(this.clientBackup.street)) {
        const dialog = GC.dialog.open(AreYouSureDialogComponent, {
          data: {
            headline: `soll die neue adresse als standort hinzugefügt werden?`,
            verbYes: 'standort hinzufügen und speichern',
            verbNo: 'nur rechnungsadresse ändern'
          }
        });
        dialog.componentInstance.confirm.pipe(take(1)).subscribe(() => {
          this.newStreet.name = this.client.name;
          calls.push(GC.http.createLocation(this.newStreet));
          const oldLocation = this.locations.find((loc) => loc.street === this.clientBackup.street);
          if (oldLocation) {
            oldLocation.deactivated = true;
            calls.push(GC.http.updateLocation(oldLocation));
          }
          makeCall(`${this.client.name} und neuer standort wurden gespeichert!`);
        });
        dialog.componentInstance.cancel.pipe(take(1)).subscribe(() => {
          makeCall(`${this.client.name} wurde gespeichert!`);
        });
      } else {
        makeCall(`${this.client.name} wurde gespeichert!`);
      }
    };

    const nameChanged = this.client.name !== this.clientBackup.name;
    const locationsWithOldName = nameChanged ? this.locations.filter((loc) => loc.name === this.clientBackup.name) : [];

    if (locationsWithOldName.length > 0) {
      const names = locationsWithOldName.map((loc) => `<i>${loc.name}</i>`).join(', ');
      const dialog = GC.dialog.open(AreYouSureDialogComponent, {
        data: {
          headline: `soll${locationsWithOldName.length === 1 ? ' der standort' : ' die standorte'} ${names} ebenfalls in <i>${this.client.name}</i> umbenannt werden?`,
          verbYes: 'standort umbenennen',
          verbNo: 'nur kund:in umbenennen'
        }
      });
      dialog.componentInstance.confirm.pipe(take(1)).subscribe(() => proceedWithStreet(true));
      dialog.componentInstance.cancel.pipe(take(1)).subscribe(() => proceedWithStreet(false));
    } else {
      proceedWithStreet(false);
    }
  }

  createInvoiceWrapper(): void {
    return ClientComponent.createInvoice(GC.http, this.client, this.date);
  }

  static createInvoice(http: HttpService, client: Client, month: Date): void {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    end.setHours(23);
    end.setMinutes(59);
    end.setSeconds(59);
    http.createInvoice(client.id, start, end).subscribe((invoice) => {
      http.getInvoicePDF(invoice.id).subscribe((pdf) => {
        const blob = new Blob([pdf], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.download = `${start.getFullYear()}-${start.getMonth() + 1}-rechnung-${client.name.toLowerCase()}.pdf`;
        link.href = window.URL.createObjectURL(blob);
        link.click();
      });
    });
  }

  deleteClient(): void {
    const dialog = GC.dialog.open(AreYouSureDialogComponent, {
      data: {
        headline: `
            <span style="white-space: nowrap">
                achtung! möchtest du <span class="fex-accent">${this.client.name}</span> wirklich löschen?
            </span>
`,
        verbYes: 'löschen',
        verbNo: 'abbrechen',
        highlightNo: true
      }
    });
    dialog.componentInstance.confirm.pipe(take(1)).subscribe(() => {
      GC.http.deleteClient(this.client).subscribe(() => {
        GC.openSnackBarLong(`${this.client.name} wurde gelöscht!`);
        this.location.back();
      });
    });
  }

  exportPdf(): void {
    const doc = new jsPDF();
    const rightX = 196;
    let y = 30;

    if (this.client.clientId) {
      doc.setFontSize(16);
      doc.setFont(undefined, 'bolditalic');
      doc.text(this.client.clientId, rightX, y, { align: 'right' });
      y += 8;
    }

    doc.setDrawColor(0);
    doc.setLineWidth(0.6);
    doc.line(14, y, rightX, y);
    y += 2;

    doc.setFontSize(16);
    doc.setFont(undefined, 'bolditalic');
    doc.text(this.client.name.toLowerCase(), rightX, y + 6, { align: 'right' });
    y += 20;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(this.client.name, rightX, y, { align: 'right' });
    y += 8;
    doc.text(this.client.street, rightX, y, { align: 'right' });
    y += 6;
    doc.text(`${this.client.zipCode} ${this.client.city}`, rightX, y, { align: 'right' });

    doc.save(`${this.client.name.toLowerCase().replace(/\s+/g, '-')}-stammblatt.pdf`);
  }

  onRightClick(event: MouseEvent, item: any) {
    event.preventDefault();
    this.menuTopLeftPosition.x = event.clientX;
    this.menuTopLeftPosition.y = event.clientY;
    this.matMenuTrigger.menuData = { item: item };
    this.matMenuTrigger.openMenu();
  }

  lexInvoice(): void {
    GC.http
      .lex_createInvoice(
        new LexInvoice({
          date: new Date(),
          client: this.client,
          jobs: this.jobs,
          xRechnung: false,
          lexContact: this.lexContact
        })
      )
      .subscribe({
        next: (response) => {
          GC.openSnackBarLong(`rechnung über einen betrag von ${this.jobs.map((j) => j.price._netto).sum()} erstellt.`);
        },
        error: (e) => {
          console.log(e.error.message);
        }
      });
  }

  getInvoices(client: LexContact): void {
    GC.http.lex_getInvoices(client, 0).subscribe((invoices) => {
      console.log('now');
      console.log(invoices.content);
    });
  }

  createMe(): void {
    GC.http.lex_createContact(this.client).subscribe((id) => {
      console.log(id);
    });
  }
}
