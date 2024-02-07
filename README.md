## To install dependencies:

```sh
bun install
```

## To run:

```sh
bun run migrate
bun run seed
bun run start
```

open http://localhost:3000


## To test:

```sh
bun run migrate
bun test
```

```text
bun test v1.0.26 (c75e768a)

src/index.test.ts:
✓ OpenAPI > should return the OpenAPI json [20.53ms]
✓ OpenAPI > should return the Swagger UI [1.18ms]
✓ GET /parcels/:id > should not return a parcel, no auth [0.51ms]
✓ GET /parcels/:id > should not return a parcel, bad auth [0.84ms]
✓ GET /parcels/:id > should not return a parcel, not found [7.60ms]
✓ GET /parcels/:id > should return a parcel [2.65ms]
✓ PUT /parcels/:id > should not work, no auth [0.59ms]
✓ PUT /parcels/:id > should not work, bad auth [0.77ms]
✓ PUT /parcels/:id > should not work, not found [9.09ms]
✓ PUT /parcels/:id > should not work, bad attributes, customer [3.14ms]
✓ PUT /parcels/:id > should not work, bad attributes, driver [2.25ms]
✓ PUT /parcels/:id > should work, customer [8.98ms]
✓ PUT /parcels/:id > should work, unknown attributes, customer [6.56ms]
✓ PUT /parcels/:id > should work, driver [6.43ms]
✓ PUT /parcels/:id > should work, unknown attributes, driver [5.68ms]

 15 pass
 0 fail
 47 expect() calls
Ran 15 tests across 1 files. [559.00ms]
```