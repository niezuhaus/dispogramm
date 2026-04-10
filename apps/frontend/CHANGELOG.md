# Changelog

## v1.4.7

### Features
- client *stammblatt* can be exported as PDF
- locations can be deactivated — deactivated locations no longer appear in search results
- client view uses tabs instead of expansion panels
- unsaved changes guard for client editing
- confirmation dialog when changing billing address asks whether locations should be updated, old location will get deactivated
- input validation with shake animation on invalid submit
- restructured special price dialog
- removed bing/azure geocoding, switched to autocomplete API

### Improvements
- price on tourplan shows tooltip whether it was calculated via street routing or air-line distance
- client list reflects URL query terms in the search bar
- search input reflects search word in URL bar
- cargo type now visible when highlights are hidden
- minor layout fixes and UI improvements

### Fixes
- posttour names
- zone options were not displayed
- null crash in `Shift.startTimeGuess` when accessing `startTimes` map
- expenses handling
- issue when entering new client from clients page
- memory leaks

---

## v1.4.6

### Features
- notes can now be marked as `done`

---

## v1.4.5

### Features
- added *außenring*: a zone that is subtractive / is being triggered when left

### Improvements
- upgrade to material 15 UI elements + layout changes
- removed bing/azure for geocoding

---

## v1.4.4

### Features
- displaying `README.md` in `einstellungen > information`

### Improvements
- more improvements to shift view: layout changes

### Fixes
- when opening newtour view via `anmeldung` time was set to `0:00`, now `8:00`
- shift end times were not saved correctly

---

## v1.4.3

### Features
- finished shift now linked in name of messenger in check-in view > closed shifts
- more shift right click options

### Fixes
- when adding new shift, only shift types available that match `messenger.dispatcher` status
- `shifts-overview`: no page reload when adding/deleting shifts
- `shifts-overview`: hours didn't get recalculated when a shift was edited
- minor UI fixes

---

## v1.4.2

### Features
- messengers in shifts view can be filtered to the ones having shifts
- version tag now visible in menu bar
- `Shifttype.ag` added
- compiled backend added

### Improvements
- search improvements
- shift table now refreshing when deleting shifts from it

### Fixes
- `Shifttype.kitah` removed
- dispatcher-only people were not to be found
- center of route is outside of inclusive but inside of exclusive zone
- adding shift button in shifts view not working properly
- minor UI changes

---

## v1.4.1

### Features
- "exclusive zones" available (currently hardcoded to work only on the name "außenring")
- minimum wage can be configured in options
- new shifts overview available in side menu

### Fixes
- minor fixes and typos

---

## v1.4.0

### Features
- street navigation via OSM available as toggle button in planning view

### Improvements
- small layout changes

### Fixes
- red pin now showing up when `job.clientInvolved = false`

---

## v1.3.10

### Features
- introduced changelog 🥳

### Fixes
- wrong API call while creating zone
- map would not open to show a zone
