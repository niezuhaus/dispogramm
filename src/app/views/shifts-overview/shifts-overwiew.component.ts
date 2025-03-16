import { AfterViewInit, Component, OnInit } from '@angular/core';
import { TitleComponent } from '../app.component';
import { GC } from 'src/app/common/GC';
import { Messenger } from 'src/app/classes/Messenger';
import { zip } from 'rxjs';

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
                    <a (click)="m.openDialog(true)">{{!m.lastName ? 'nachnamen eintragen' : m.lastName}}, {{!m.firstName ?
                        'vornamen eintragen' : m.firstName}}</a>
                </h3>
                <h5 style="font-style: italic;">
                    {{m.nickname}}
                </h5>
                <h6>{{m.shifts?.length}} schicht(en) im {{months()[date.getMonth()]}} {{date.getFullYear()}}</h6>
                <h6>insgesamt {{m.hours}} stunden</h6>
                <shift-table *ngIf="m.shifts?.length" [shifts]="m.shifts" [messenger]="m" #table>

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

  date = new Date;
  table: any;

  messengers = () => {
    return GC.messengers.sort((a, b) => a.lastName?.localeCompare(b.lastName));
  };

  months = () => {
    return GC.months;
  }

  ngAfterViewInit(): void {
    GC.loadedCompletely.subscribe(() => {
      this.messengers().forEach(m => m.loadShifts(this.date));
    })
  }

  openDialog(messenger: Messenger): void {
    new Messenger(messenger).openDialog();
  }

  monthChanged(month: Date): void {
    GC.messengers.forEach(m => m.loadShifts(month));
  }
}
