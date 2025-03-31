import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { TitleComponent } from '../app.component';
import { GC } from 'src/app/common/GC';
import { Messenger } from 'src/app/classes/Messenger';
import { zip } from 'rxjs';
import { ShiftTableComponent } from '../shift-table.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-shifts-overwiew',
  template: `
  <div class="h-100">
    <div class="flex w-100 pt-3 p-4 flex-column justify-content-between" style="background-color: white; z-index: 1;">
        <datepicker [(date)]="date" [monthly]="true" (dateChange)="monthChanged($event)" #datepicker>
        </datepicker>

          <div *ngFor="let m of messengers()">
              <div [style.opacity]="m.shifts.length ? 1 : .25">
                  <h3 style="cursor: pointer; white-space: nowrap; margin: 0">
                      <a (click)="m.openDialog(true)">{{!m.lastName ? '(kein nachname)' : m.lastName}}, {{!m.firstName ?
                          'vornamen eintragen' : m.firstName}}</a>
                  </h3>
                  <h5 style="font-style: italic;">
                      {{m.nickname}}
                  </h5>
                  <h6>{{m.shifts?.length}} schicht(en) im {{months()[date.getMonth()]}} {{date.getFullYear()}}</h6>
                  <h6 *ngIf="m.shifts?.length">insgesamt {{m.hours}} stunden ({{(m.hours * minimumWage()).round(2)}}€)</h6>
                  <shift-table *ngIf="m.shifts?.length" [shifts]="m.shifts" [messenger]="m">
  
                  </shift-table>
              </div>
              <hr>
          </div>
    </div>
</div>
  `,
  styleUrls: ['./shifts-overwiew.component.scss']
})
export class ShiftsOverwiewComponent extends TitleComponent implements AfterViewInit {

  override title = 'schichten';
  shiftsLoaded = false;

  date = new Date;

  messengers = () => {
    return GC.messengers.sort((a, b) => {
      return (a.lastName || 'ß').localeCompare(b.lastName || 'ß');
    });
  };

  months = () => {
    return GC.months;
  }

  minimumWage = () => {
    return GC.config.minimumWage;
  }

  @ViewChild('table') table: ShiftTableComponent;


  constructor(
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
  ) {
    super();
  }

  ngAfterViewInit(): void {
    this.route.paramMap.subscribe(params => {
      if (params.get('month')) {
        this.date.setDateByString(params.get('month' + '-01'));
      } else {
        GC.location.replaceState(`${GC.routes.shifts};month=${this.date.yyyymm()}`);
      }
    });
    GC.loaded().subscribe(() => {
      this.load();
    })
  }

  load(): void {
    zip(this.messengers().map(m => m.loadShifts(this.date))).subscribe(() => {
      this.shiftsLoaded = true;
      this.cd.detectChanges();
    })

  }

  monthChanged(month: Date): void {
    this.load();
    GC.location.replaceState(`${GC.routes.shifts};month=${this.date.yyyymm()}`);
  }
}
