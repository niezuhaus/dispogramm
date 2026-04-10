import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgModelSuggestionsDirective } from './NgModelSuggestionsDirective';
import { ShakeOnInvalidSubmitDirective } from './shake-on-invalid-submit.directive';

@NgModule({
  declarations: [NgModelSuggestionsDirective, ShakeOnInvalidSubmitDirective],
  imports: [CommonModule],
  exports: [NgModelSuggestionsDirective, ShakeOnInvalidSubmitDirective]
})
export class AppCommonModule {}
