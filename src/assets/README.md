![fahrrad express](/logo/fex-logo.png)

### dispogramm `v1.4.4`

#### what's new

##### `v1.4.4`
- displaying `README.md` in `einstellungen > information`
- more improvements to shift view: layout changes
- fixed: when opening newtour view via `anmeldung` time was set to `0:00` now `8:00`
- fixed: shift end times were not saved correctly

##### `v1.4.3`
- finished shift now linked in name of messenger in check-in view > closed shifts
- more shift right click options
- fix: when adding new shift, only shifttypes are available, that match `messenger.dispatcher` status
- fix `shifts-overview`: no page reload when adding/deleting shifts
- fix `shifts-overview`: hours didn't get reculculated when a shift was edited
- minor ui fixes

##### `v1.4.2`
- messengers in shifts view can be filtered to the ones having shifts
- search improvements
- shift table now refreshing when deleting shifts from it
- version tag now visible in menu bar
- dispatcher-only people were not to be found
- `Shifttype.kitah` removed
- `Shifttype.ag` added
- minor ui changes
- compiled backend added
- fixed: center of route is outside of inclusive but inside of exclusive zone
- fixed: adding shift button in shifts view not working properly


##### `v1.4.1`
- "exclusive zones" are available (currently hardcoded to work only on the name "außenring")
- minimum wage can be configured in options
- new shifts overwiw available in side menu
- minor fixes and typos

##### `v1.4.0`
- street navigation via osm is available as toggle button in planning view
- small layout changes
- fixed: red pin now showing up when `job.clientInvolved = false`

##### `v1.3.10`
- introduced changelog 🥳
- fixed: wrong api call while creating zone 
- fixed: map would not open to show a zone
