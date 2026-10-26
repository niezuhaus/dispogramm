# What is this?

**dispogramm** — a dispatch management tool for a bicycle courier service. It is the
day-to-day operations software for *Fahrrad-Express* in Bremen, Germany: dispatchers
use it to take orders over the phone, price them, assign them to riders, plan the
week, track shifts, and export the billing and payroll data at the end of the month.

The UI is in German, the domain vocabulary is German (`tourplan`, `zwischi`,
`außenring`, `stammblatt`), and a lot of the business logic is specific to how this
one company prices and routes courier jobs.

Version `1.5.0` · demo at <https://cloud.niezuhaus.de/>

---

## Shape of the repo

```
apps/
  frontend/   Angular 20 SPA          (dev :4200, prod nginx :80)
  backend/    Spring Boot + Maven API (:8081)
docker-compose.yml                    frontend + backend + mongo:6
```

MongoDB is the only datastore. The whole stack comes up with `docker compose up`
from the repo root; see [README.md](README.md) for the dev-mode split.

The backend is a multi-module Maven project, but only the `backend` module is
active — `infrastructure` and `mongodb` (jkube/Kubernetes deployment descriptors)
are commented out in [apps/backend/pom.xml](apps/backend/pom.xml).

---

## The domain

The core entity is a **Job** — one courier order. Everything else hangs off it.

| Concept | Meaning |
|---|---|
| **Job** | A courier order: pickup(s), delivery(s), date, price, assigned messenger |
| **Branch / Section** | The legs a job is split into for routing and distance calculation |
| **Messenger** | A rider |
| **Shift** | A rider's or dispatcher's working block (`früh`, `zwischi`, `spät`, `doppel`, `friki`, `ag zeit`) |
| **Client / Contact / Location** | Customers, their people, and their addresses |
| **Zone** | Geographic price zones drawn on the map, including the subtractive *außenring* |
| **SpecialPrice** | Per-client negotiated pricing that overrides the default rules |
| **RegularJob** | A recurring order template (*blueprint*) that generates jobs |
| **TourplanItem** | A row in the dispatcher's daily plan |

Two strategy hierarchies carry most of the business logic, both on the frontend:

- **[PriceStrategies.ts](apps/frontend/src/app/classes/PriceStrategies.ts)** —
  `FexRules` (the house pricing rules), `Group`, `BaseExtra`
- **[RouteStrategies.ts](apps/frontend/src/app/classes/RouteStrategies.ts)** —
  `Cheapest`, `Star`, `Round`, `PrimitRound`

Price can be computed from real street routing or from air-line distance; the
tourplan shows which was used.

---

## Screens

Routes are defined in
[app-routing.module.ts](apps/frontend/src/app/app-routing.module.ts):

- **tourplan** — the dispatcher's main view for one day, with the map
- **weekplan** — the week at a glance
- **newtour / showTour** — order entry with address autocomplete and live pricing
- **clientlist / client** — customer records, tabs, PDF *stammblatt* export
- **locations** — address book, deactivatable entries
- **messengers** — riders
- **shifts** — check-in / check-out and shift overview
- **statistics** — day, week, timeframe, and client-comparison reports

---

## Frontend notes

Angular 20 + Angular Material + Bootstrap. Recently walked up through Angular
17 → 18 → 19 → 20 (see the git log) and from `@import` to `@use` in Sass.

- **Maps**: MapLibre GL with MapTiler tiles, plus terra-draw for drawing zones.
  Migrated off Mapbox.
- **Geocoding**: OSM/Nominatim and Geoapify autocomplete. Bing/Azure was removed.
- **Geometry**: turf.js for point-in-polygon and zone intersection.
- **Export**: jsPDF + autotable client-side.
- **[GC.ts](apps/frontend/src/app/common/GC.ts)** is a large static "global context"
  class — config, backend IP, loading state, event emitters, and a pile of German
  string literals and Bremen-specific constants (postcodes left of the Weser,
  bridge coordinates, map center).
- **[http.service.ts](apps/frontend/src/app/http.service.ts)** is ~1300 lines and
  the most connected node in the codebase — it fronts both the backend API and the
  external geo services.

---

## Backend notes

Spring Boot on Java 11, Swagger UI at `/swagger-ui.html`.

Conventional layering — `controllers` → `services` → `repositories` → `entities`,
with `dtos` between, and abstract base classes (`AbstractController`,
`AbstractService`, `AbstractCriterionService`) carrying the shared CRUD.

Beyond CRUD it does the reporting and integration work:

- **Exporters** in `utils/` — `PdfExporter`, `RawXLSXExporter`, `DeepXLSXExporter`,
  `StatisticsExporter`, `WorkingHoursExporter` (payroll), `XMLExporter`,
  `CsvImporter`, built on `ElementBuilder` / `ElementBuilderFactory`.
- **`LexOfficeClient`** — invoicing integration with lexoffice.
- **`caches/`** — a small request cache + filter.

---

## Testing and CI

- Unit: Karma + Jasmine (`npm test`).
- E2E: Playwright in [apps/frontend/e2e/](apps/frontend/e2e/), which boots a real
  backend (`backend.setup.ts`) — the CI job in
  [.github/workflows/e2e_tests.yml](.github/workflows/e2e_tests.yml) stands up
  backend + MongoDB and runs the specs against it.

---

## Things worth knowing before you touch it

- **Secrets are env-driven** via [config.ts](apps/frontend/src/app/config.ts)
  (`LEXOFFICE_API_KEY`, `GEOAPIFY_API_KEY`, `MAPTILER_API_KEY`, backend basic-auth).
  There is an untracked `config.private.ts` alongside it. The last few commits were
  churn on exactly this — `0cb0a7a "caused null pointer"` is the current HEAD.
- **`apps/middleware-api-proxy/` is deleted but not committed.** It was a small
  Express CORS proxy; the working tree has the deletions staged-but-unstaged.
- **Circular imports are pervasive** in the frontend domain layer — `Job` ↔
  `Messenger` ↔ `Shift`, `GC` ↔ `loading.component` ↔ `config-dialog`, `Geolocation`
  ↔ `location-dialog` ↔ `UTIL`. About 20 cycles of length 3–4. Adding an import
  between two `classes/` files will usually create another one.
- **`prototypes.ts` patches built-in prototypes** (e.g. `Array.fastfind`), so some
  methods you see called on arrays are project-local.
- **`CLAUDE.md` at the repo root is empty**, as is `apps/backend/CLAUDE.md`.
- A pre-built `apps/backend-26.4.2.jar` (60 MB) is checked into the tree.

---

## Where the knowledge graph is

`graphify-out/` holds a knowledge graph of this repo built at commit `0cb0a7a`:
2339 nodes, 5025 edges, 190 communities. `graph.html` is the interactive view,
`GRAPH_REPORT.md` the audit. Query it with `graphify query "<question>"`.

Most connected abstractions, by edge count: `HttpService` (138), `Job` (132),
`Geolocation` (106), `GC` (91), `Price` (86), `Messenger` (72), `Client` (63),
`TourplanItem` (63), `NewtourComponent` (61).
