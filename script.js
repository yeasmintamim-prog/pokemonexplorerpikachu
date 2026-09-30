const API_URL = "https://pokeapi.co/api/v2/pokemon";
const MAX_STAT_VALUE = 150;

const TYPE_COLORS = {
  normal: "#a8a77a",
  fire: "#ee8130",
  water: "#6390f0",
  electric: "#f7d02c",
  grass: "#7ac74c",
  ice: "#96d9d6",
  fighting: "#c22e28",
  poison: "#a33ea1",
  ground: "#e2bf65",
  flying: "#a98ff3",
  psychic: "#f95587",
  bug: "#a6b91a",
  rock: "#b6a136",
  ghost: "#735797",
  dragon: "#6f35fc",
  dark: "#705746",
  steel: "#b7b7ce",
  fairy: "#d685ad",
};

const STAT_LABELS = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Attack",
  "special-defense": "Sp. Defense",
  speed: "Speed",
};

const form = document.querySelector("#search-form");
const input = document.querySelector("#search-input");
const clearButton = document.querySelector("#clear-button");
const searchButton = document.querySelector("#search-button");
const statusBar = document.querySelector("#status");
const resultArea = document.querySelector("#result");
const cardTemplate = document.querySelector("#card-template");
const statTemplate = document.querySelector("#stat-template");
const emptyTemplate = document.querySelector("#empty-template");
const errorTemplate = document.querySelector("#error-template");

let isBusy = false;

form.addEventListener("submit", function (event) {
  event.preventDefault();
  searchPokemon(input.value);
});

input.addEventListener("input", function () {
  clearButton.hidden = input.value === "";
});

clearButton.addEventListener("click", function () {
  input.value = "";
  clearButton.hidden = true;
  showStatus("", "");
  showEmptyState();
  input.focus();
});

document.querySelectorAll(".chip").forEach(function (chip) {
  chip.addEventListener("click", function () {
    input.value = chip.dataset.pokemon;
    clearButton.hidden = false;
    searchPokemon(chip.dataset.pokemon);
  });
});

async function searchPokemon(rawName) {
  if (isBusy) {
    return;
  }

  const name = rawName.trim().toLowerCase();

  if (name === "") {
    showStatus("error", "Type a Pokémon name before searching.");
    return;
  }

  isBusy = true;
  searchButton.disabled = true;
  showStatus("loading", "Looking up " + name + "...");

  let response;

  try {
    response = await fetch(API_URL + "/" + encodeURIComponent(name));
  } catch (networkError) {
    finishWithError("Could not reach the PokéAPI. Check your internet connection and try again.");
    return;
  }

  if (!response.ok) {
    if (response.status === 404) {
      finishWithError("No Pokémon named \"" + name + "\" was found. Check the spelling and try again.");
    } else {
      finishWithError("The PokéAPI replied with status " + response.status + ". Please try again.");
    }
    return;
  }

  const data = await response.json();
  const pokemon = normalizePokemon(data);

  renderCard(pokemon);
  showStatus("success", "Loaded " + pokemon.displayName + " successfully.");
  isBusy = false;
  searchButton.disabled = false;
}

function normalizePokemon(data) {
  const types = data.types.map(function (entry) {
    return entry.type.name;
  });

  const artwork = data.sprites.other && data.sprites.other["official-artwork"];

  return {
    number: "#" + String(data.id).padStart(3, "0"),
    displayName: capitalize(data.name),
    types: types,
    typeLabel: types.map(capitalize).join(" / "),
    accent: TYPE_COLORS[types[0]] || "#d4d4d8",
    height: (data.height / 10).toFixed(1) + " M",
    weight: (data.weight / 10).toFixed(1) + " Kg",
    abilities: data.abilities.map(function (entry) {
      return capitalize(entry.ability.name);
    }),
    stats: data.stats.map(function (entry) {
      return {
        label: STAT_LABELS[entry.stat.name] || capitalize(entry.stat.name),
        value: entry.base_stat,
      };
    }),
    artwork: (artwork && artwork.front_default) || data.sprites.front_default,
  };
}

function renderCard(pokemon) {
  const fragment = cardTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".card");

  card.style.setProperty("--accent", pokemon.accent);
  fragment.querySelector(".card-kicker-type").textContent = pokemon.typeLabel;
  fragment.querySelector(".card-number").textContent = pokemon.number;
  fragment.querySelector(".card-type-label").textContent = pokemon.typeLabel + " type";
  fragment.querySelector(".card-name").textContent = pokemon.displayName;

  const badgeList = fragment.querySelector(".card-badges");

  pokemon.types.forEach(function (type) {
    const badge = document.createElement("span");
    badge.className = "type-badge";
    badge.textContent = type;
    badge.style.backgroundColor = TYPE_COLORS[type] || "#a8a77a";
    badgeList.appendChild(badge);
  });

  const artwork = fragment.querySelector(".card-art");
  artwork.src = pokemon.artwork;
  artwork.alt = pokemon.displayName + " official artwork";

  fragment.querySelector(".fact-height").textContent = pokemon.height;
  fragment.querySelector(".fact-weight").textContent = pokemon.weight;
  fragment.querySelector(".fact-abilities").textContent = pokemon.abilities.join(", ");

  const statsList = fragment.querySelector(".stats-list");

  pokemon.stats.forEach(function (stat) {
    statsList.appendChild(createStatRow(stat));
  });

  resultArea.replaceChildren(fragment);
}

function createStatRow(stat) {
  const fragment = statTemplate.content.cloneNode(true);
  const percent = Math.min(100, Math.round((stat.value / MAX_STAT_VALUE) * 100));

  fragment.querySelector(".stat-name").textContent = stat.label;
  fragment.querySelector(".stat-value").textContent = stat.value;
  fragment.querySelector(".stat-fill").style.width = percent + "%";

  return fragment;
}

function showEmptyState() {
  resultArea.replaceChildren(emptyTemplate.content.cloneNode(true));
}

function showErrorState(message) {
  const fragment = errorTemplate.content.cloneNode(true);
  fragment.querySelector(".error-message").textContent = message;
  resultArea.replaceChildren(fragment);
  showStatus("error", message);
}

function finishWithError(message) {
  isBusy = false;
  searchButton.disabled = false;
  showErrorState(message);
}

function showStatus(state, message) {
  statusBar.dataset.state = state;
  statusBar.textContent = message;
}

function capitalize(text) {
  return text
    .split("-")
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

showEmptyState();
