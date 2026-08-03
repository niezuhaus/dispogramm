// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
// Applies the Array/Date/String/Number extensions. Specs import components directly rather than
// through AppModule (the only other importer), so without this the global augmentations are
// absent from the spec program and every .floor()/.abs()/Date.set() fails to compile.
import './app/common/prototypes';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
