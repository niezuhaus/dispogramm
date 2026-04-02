import { Pipe, PipeTransform } from '@angular/core';
import { Geolocation } from '../classes/Geolocation';

@Pipe({ name: 'activeLocations' })
export class ActiveLocationsPipe implements PipeTransform {
  transform(locations: Geolocation[], deactivated = false): Geolocation[] {
    return locations.filter((l) => !!l.deactivated === deactivated);
  }
}
