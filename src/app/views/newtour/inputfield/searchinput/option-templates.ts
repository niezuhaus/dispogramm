import { Component, Inject, Input } from '@angular/core';
import { Client } from 'src/app/classes/Client';
import { Geolocation } from 'src/app/classes/Geolocation';
import { Optionable } from 'src/app/common/interfaces';

@Component({
  selector: 'client-option',
  template: `
    <!-- Hello world -->
    <!-- <small>
      <strong>
        {{ location.name }}
      </strong>
    </small>
    <small>
      {{ location.street + ', ' + location.zipCode + ' ' + location.city }}
    </small> -->
  `,
  styles: [``]
})
export class ClientOptionComponent {
  @Input() location: Geolocation;

  constructor() {}
}
