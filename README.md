# Pokémon Card Explorer

A small Pokémon search app built for the API homework. Type a Pokémon name, press search, and the PokéAPI response is rendered as a trading-card-style entry with artwork, types, measurements, abilities and base stats.

## Features

- Search any Pokémon by name or Pokédex number
- Quick-search buttons for Pikachu, Charizard, Bulbasaur and Mewtwo
- Proper loading, success, empty and error states
- Card shows the artwork, Pokédex number, type badges, height, weight, abilities and all six base stats
- Type-aware design: the badge, type label and artwork glow all take the Pokémon's own type color
- Responsive layout that stacks cleanly on phones
- No API key, no build step, no runtime dependencies

## Built with

Plain HTML, CSS and JavaScript in three separate files. Nothing is bundled or transpiled, there is no build step, and no secrets or keys are stored anywhere in the code. The only tooling is a static file server for local development.

## Running it

```bash
npm start
```

That serves the folder at `http://localhost:5173`. The `start` script runs [`serve`](https://www.npmjs.com/package/serve) through `npx`, so there is nothing to install first — just open the URL in a browser.

Other ways that work just as well:

```bash
python -m http.server 5173
```

or simply open `index.html` directly in a browser.

A local server is recommended rather than opening the file directly, because browsers treat `file://` pages differently and the page loads fonts and images from the network.

## The API

### Endpoint

```
GET https://pokeapi.co/api/v2/pokemon/{name}
```

`{name}` is the Pokémon's name or its numeric ID, so `/pokemon/pikachu` and `/pokemon/25` return the same Pokémon.

### Fields used

| JSON path | Example value | Used for |
| --- | --- | --- |
| `id` | `25` | Card number, formatted as `#025` |
| `name` | `"pikachu"` | Card title |
| `sprites.other["official-artwork"].front_default` | image URL | Large artwork (falls back to `sprites.front_default`) |
| `types[].type.name` | `"electric"` | Type badge(s) and the card's accent color |
| `height` | `4` | Height, displayed as `0.4 M` |
| `weight` | `60` | Weight, displayed as `6.0 Kg` |
| `abilities[].ability.name` | `"static"` | Abilities list |
| `stats[].stat.name` | `"special-attack"` | Stat labels (`Sp. Attack`) |
| `stats[].base_stat` | `50` | Stat values and progress-bar widths |

Two things worth knowing about the data: `height` and `weight` are returned in decimetres and hectograms, so both are divided by 10 before display, and the artwork lives in a nested `sprites.other["official-artwork"]` object, so a plain sprite is kept as a fallback.

## Project structure

```
index.html   markup and the <template> blocks for the card, stat rows, empty state and error state
style.css    dark theme, type-colored accents and the responsive rules
script.js    fetch with async/await, response.ok checks, data transformation and rendering
favicon.ico  browser tab icon
```

## How it works

1. The form's `submit` event fires for both the search button and the Enter key, and calls `searchPokemon()`.
2. The request URL is built with `encodeURIComponent()`, and the status line switches to a loading state while the search button is disabled.
3. `fetch()` runs inside a `try/catch`, because it only rejects when the request could not be made at all (offline, blocked network).
4. `response.ok` is checked manually afterwards — a 404 still resolves — and a 404 gets a friendly "no Pokémon named…" message while other statuses get a technical one.
5. `normalizePokemon()` flattens the nested JSON into a small object and converts units once, so the rendering code never touches API paths.
6. `renderCard()` clones the HTML templates, fills them using `textContent`, and replaces the contents of the result area.

## Screenshots

| Successful search | Error state |
| --- | --- |
| ![Successful search](screenshots/success.png) | ![Error state](screenshots/error.png) |
