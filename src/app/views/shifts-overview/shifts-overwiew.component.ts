import { AfterViewInit, Component, OnInit } from '@angular/core';
import { TitleComponent } from '../app.component';
import { GC } from 'src/app/common/GC';
import { Messenger } from 'src/app/classes/Messenger';
import { zip } from 'rxjs';

@Component({
  selector: 'app-shifts-overwiew',
  templateUrl: './shifts-overwiew.component.html',
  styleUrls: ['./shifts-overwiew.component.scss']
})
export class ShiftsOverwiewComponent extends TitleComponent implements AfterViewInit {

  override title = 'schichten';

  date = new Date;

  messengers = () => {
    return GC.messengers.sort((a, b) => a.lastName?.localeCompare(b.lastName));
  };

  months = () => {
    return GC.months;
  }

  ngAfterViewInit(): void {
    console.log('loading now');
    
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
