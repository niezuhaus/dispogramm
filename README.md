![fahrrad expressx](src/assets/logo/fex-logo.png)

### dispogramm v1.4.2

#### demo
find demo here:
[https://cloud.niezuhaus.de/](https://cloud.niezuhaus.de)

#### how to install

1. set up a mongo db instance with standart port
1.1 you can use a [docker container](https://hub.docker.com/_/mongo) for that
2. `git clone git@github.com:niezuhaus/dispogramm.git`
3. start the backend via `java -jar backend-latest.jar`
4. run the frontend
4.1 install the node packeages via `npm install`
4.2 start the server via `npm run start` and access on `localhost:4200` or compile a production version via `npm run build` and host content of `/dist`

#### changelog

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
