import { Feature, MultiPolygon, Polygon, Position } from '@turf/turf';
import { Price } from './Price';
import { area, polygon } from '@turf/turf';
import { IdObject } from '../common/interfaces';
import { GC } from '../common/GC';
import { AreYouSureDialogComponent } from '../dialogs/are-you-sure-dialog.component';
import { ZoneDialogComponent } from '../dialogs/zone-dialog.component';

export class Zone implements IdObject {
  id: string;
  name: string;
  price = new Price();
  index?: number;
  coordinates: Position[] = [];
  private _isSubstractive: boolean = false;
  get isSubstractive() {
    return this._isSubstractive;
  }
  get _coordinates() {
    return this.coordinates;
  }
  set _coordinates(coos: Position[]) {
    this.coordinates = coos;
    this.polygon = polygon([this.coordinates]);
    this._area = this.polygon ? (area(this.polygon) / 1000000).round(2) : 0;
  }
  private _polygon: Feature<Polygon | MultiPolygon>;
  get polygon(): Feature<Polygon | MultiPolygon> {
    return this._polygon;
  }
  set polygon(polygon: Feature<Polygon | MultiPolygon>) {
    if (!polygon) {
      this._polygon = null;
      this.coordinates = [];
      return;
    }
    this._polygon = polygon;
    if (polygon.geometry.coordinates.length > 1) {
      this.coordinates = (polygon.geometry.coordinates as unknown as Position[][]).map((a) => a[0]);
    } else {
      this.coordinates = polygon.geometry.coordinates[0] as Position[];
    }
  }
  // area in km2
  private _area: number;
  get area(): number {
    return this._area;
  }
  get nrOfPoints(): number {
    return this.coordinates?.map((a) => a.length).sum() || 0;
  }

  constructor(data?: Partial<Zone>) {
    if (data) {
      Object.assign(this, data);
      this.price = new Price(this.price);
    }
    this._polygon = this.coordinates.length > 0 ? polygon([this.coordinates]) : this._polygon;
    this._area = this._polygon ? (area(this._polygon) / 1000000).round(2) : 0;
    if (this.name === 'außenring') {
      this._isSubstractive = true;
    }
  }

  delete(): void {
    const dialog = GC.dialog.open(AreYouSureDialogComponent, {
      data: {
        headline: 'möchtest du diese zone löschen?',
        verbYes: 'löschen',
        verbNo: 'abbrechen',
        zone: this,
        highlightNo: true,
        warning: true
      }
    });
    dialog.componentInstance.confirm.subscribe(() => {
      GC.http.deleteZone(this).subscribe(() => {
        GC.openSnackBarLong('zone wurde gelöscht.');
        GC.refreshNeeded.emit(true);
      });
    });
  }

  openDialog(): void {
    GC.dialog.open(ZoneDialogComponent, {
      data: {
        zone: this
      }
    });
  }
}
