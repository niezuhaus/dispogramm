import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {AppRoutingModule, routingComponents} from './app-routing.module';
import {AppComponent} from './views/app.component';
import {InputFieldComponent} from './views/newtour/inputfield/input-field.component';
import {SearchinputComponent} from './views/newtour/inputfield/searchinput/searchinput.component';
import {HttpService} from './http.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacySliderModule as MatSliderModule} from '@angular/material/legacy-slider';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {DateAdapter, MatNativeDateModule, MatRippleModule} from '@angular/material/core';
import {MatLegacyOptionModule as MatOptionModule} from '@angular/material/legacy-core';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyAutocompleteModule as MatAutocompleteModule} from '@angular/material/legacy-autocomplete';
import {MatLegacySlideToggleModule as MatSlideToggleModule} from '@angular/material/legacy-slide-toggle';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyProgressSpinnerModule as MatProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatSortModule} from '@angular/material/sort';
import {MatLegacyTableModule as MatTableModule} from '@angular/material/legacy-table';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatLegacySnackBarModule as MatSnackBarModule} from '@angular/material/legacy-snack-bar';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {MatLegacyPaginatorModule as MatPaginatorModule} from '@angular/material/legacy-paginator';
import {LocationDialogComponent} from './dialogs/location-dialog.component';
import {NewClientDialogComponent} from './dialogs/new-client-dialog.component';
import {DescriptionComponent} from './views/tourplan/description/description.component';
import {DatepickerComponent} from './views/datepicker.component';
import {ContainerComponent} from './views/container.component';
import {AreYouSureDialogComponent} from './dialogs/are-you-sure-dialog.component';
import {CheckInDialog} from "./dialogs/shifts-dialog/check-in-dialog.component";
import {MatLegacyPaginatorIntl as MatPaginatorIntl} from "@angular/material/legacy-paginator";
import {ClientListComponent, fexPaginator} from "./views/client-list/client-list.component";
import {MessengerSelectorComponent} from './views/tourplan/messenger-selector.component';
import {MatLegacyTabsModule as MatTabsModule} from "@angular/material/legacy-tabs";
import {TimepickerComponent} from './views/timepicker.component';
import {NewShiftComponent} from './dialogs/shifts-dialog/new-shift.component';
import {MessengerListComponent} from './views/messenger-list.component';
import {MessengerDialogComponent} from './dialogs/messenger-dialog.component';
import {RegularJobDialogComponent} from './dialogs/regular-job-dialog.component';
import {LoadingComponent} from './views/loading.component';
import {MatLegacyProgressBarModule as MatProgressBarModule} from "@angular/material/legacy-progress-bar";
import {BikeComponent} from './views/bike.component';
import {ConfigDialogComponent} from './dialogs/config-dialog.component';
import {PriceInputComponent} from './views/price-input.component';
import {ZoneDialogComponent} from './dialogs/zone-dialog.component';
import {MatLegacyMenuModule as MatMenuModule} from "@angular/material/legacy-menu";
import {CheckoutDialogComponent} from './dialogs/checkout-dialog.component';
import {CustomDateAdapter} from "./common/prototypes";
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {environment} from '../environments/environment';
import {provideAuth, getAuth} from '@angular/fire/auth';
import {MorningTourDialogComponent} from './dialogs/morning-tour-dialog.component';
import {ShiftsWithoutEndDialogComponent} from './dialogs/shifts-without-end-dialog.component';
import {MatExpansionModule} from "@angular/material/expansion";
import {ContactDialogComponent} from './dialogs/contact-dialog.component';
import {WeekplanComponent} from './views/weekplan/weekplan.component';
import {MatDividerModule} from "@angular/material/divider";
import {RightClickMenuComponent} from './views/right-click-menu.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NewExpenseDialogComponent} from './dialogs/new-expense-dialog.component';
import {StatisticsComponent} from './views/statistics.component';
import {MatLegacyChipsModule as MatChipsModule} from "@angular/material/legacy-chips";
import {SpecialPriceDialogComponent} from './dialogs/special-price-dialog.component';
import {ShiftComponent} from './dialogs/shifts-dialog/shift.component';
import {CalendarRangeDialogComponent} from './dialogs/calendar-range-dialog/calendar-range-dialog.component';
import {MatLegacyCardModule as MatCardModule} from "@angular/material/legacy-card";
import {
  InlineRangeCalendarComponent
} from './dialogs/calendar-range-dialog/inline-range-calendar/inline-range-calendar.component';
import {MessengerViewComponent} from './views/tourplan/messenger-view/messenger-view.component';
import {MatSidenavModule} from "@angular/material/sidenav";

@NgModule({
  declarations: [
    AppComponent,
    InputFieldComponent,
    SearchinputComponent,
    ClientListComponent,
    routingComponents,
    LocationDialogComponent,
    NewClientDialogComponent,
    DescriptionComponent,
    DatepickerComponent,
    ContainerComponent,
    AreYouSureDialogComponent,
    CheckInDialog,
    MessengerSelectorComponent,
    TimepickerComponent,
    NewShiftComponent,
    MessengerListComponent,
    MessengerDialogComponent,
    RegularJobDialogComponent,
    LoadingComponent,
    BikeComponent,
    ConfigDialogComponent,
    PriceInputComponent,
    ZoneDialogComponent,
    CheckoutDialogComponent,
    MorningTourDialogComponent,
    ShiftsWithoutEndDialogComponent,
    ContactDialogComponent,
    WeekplanComponent,
    RightClickMenuComponent,
    NewExpenseDialogComponent,
    StatisticsComponent,
    SpecialPriceDialogComponent,
    ShiftComponent,
    CalendarRangeDialogComponent,
    InlineRangeCalendarComponent,
    MessengerViewComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatCheckboxModule,
    MatSliderModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    DragDropModule,
    MatSortModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatTabsModule,
    MatProgressBarModule,
    MatMenuModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    MatExpansionModule,
    MatDividerModule,
    NgbModule,
    MatChipsModule,
    MatCardModule,
    MatSidenavModule,
  ],
  providers: [HttpService,
    {provide: MatPaginatorIntl, useClass: fexPaginator},
    {provide: DateAdapter, useClass: CustomDateAdapter}],
  bootstrap: [AppComponent]
})
export class AppModule {
}
