import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgModelSuggestionsDirective } from './NgModelSuggestionsDirective';

@NgModule({
  declarations: [
    NgModelSuggestionsDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NgModelSuggestionsDirective
  ]
})
export class AppCommonModule { }