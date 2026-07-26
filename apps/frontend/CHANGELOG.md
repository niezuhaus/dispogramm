# changelog

## v1.5.1

### features

### improvements

## v1.5.0

### features
- client *stammblatt* can be exported as pdf
- locations can be deactivated — deactivated locations no longer appear in search results
- client view uses tabs instead of expansion panels
- unsaved changes guard for client editing
- confirmation dialog when changing billing address asks whether locations should be updated, old location will get deactivated
- input validation with shake animation on invalid submit
- restructured special price dialog
- removed bing/azure geocoding, switched to autocomplete api

### improvements
- price on tourplan shows tooltip whether it was calculated via street routing or air-line distance
- client list reflects url query terms in the search bar
- search input reflects search word in url bar
- cargo type now visible when highlights are hidden
- minor layout fixes and ui improvements

### fixes
- posttour names
- zone options were not displayed
- null crash in `shift.starttimeguess` when accessing `starttimes` map
- expenses handling
- issue when entering new client from clients page
- memory leaks

---

## v1.4.6

### features
- notes can now be marked as `done`

---

## v1.4.5

### features
- added *außenring*: a zone that is subtractive / is being triggered when left

### improvements
- upgrade to material 15 ui elements + layout changes
- removed bing/azure for geocoding

---

## v1.4.4

### features
- displaying `readme.md` in `einstellungen > information`

### improvements
- more improvements to shift view: layout changes

### fixes
- when opening newtour view via `anmeldung` time was set to `0:00`, now `8:00`
- shift end times were not saved correctly

---

## v1.4.3

### features
- finished shift now linked in name of messenger in check-in view > closed shifts
- more shift right click options

### fixes
- when adding new shift, only shift types available that match `messenger.dispatcher` status
- `shifts-overview`: no page reload when adding/deleting shifts
- `shifts-overview`: hours didn't get recalculated when a shift was edited
- minor ui fixes

---

## v1.4.2

### features
- messengers in shifts view can be filtered to the ones having shifts
- version tag now visible in menu bar
- `shifttype.ag` added
- compiled backend added

### improvements
- search improvements
- shift table now refreshing when deleting shifts from it

### fixes
- `shifttype.kitah` removed
- dispatcher-only people were not to be found
- center of route is outside of inclusive but inside of exclusive zone
- adding shift button in shifts view not working properly
- minor ui changes

---

## v1.4.1

### features
- "exclusive zones" available (currently hardcoded to work only on the name "außenring")
- minimum wage can be configured in options
- new shifts overview available in side menu

### fixes
- minor fixes and typos

---

## v1.4.0

### features
- street navigation via osm available as toggle button in planning view

### improvements
- small layout changes

### fixes
- red pin now showing up when `job.clientinvolved = false`

---

## v1.3.10

### features
- introduced changelog 🥳

### fixes
- wrong api call while creating zone
- map would not open to show a zone
