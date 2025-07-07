import 'dotenv/config';
import fetch from 'node-fetch';
import { getMD5, getRandomInt } from './utils.js';
import * as database from './database.js';

// Ottieni tutti i personaggi HP
export async function getAllCharacters() {
  const url = "https://hp-api.onrender.com/api/characters";
  try {
    const response = await fetch(url);
    const data = await response.json();
    return {
      code: 200,
      data: { results: data }
    };
  } catch (error) {
    console.error('Error fetching HP characters:', error);
    return {
      code: 500,
      data: { results: [] },
      error: "Failed to fetch HP characters"
    };
  }
}

// Ottieni personaggi filtrati per casa
export async function getCharactersByHouse(house) {
  const url = `https://hp-api.onrender.com/api/characters/house/${encodeURIComponent(house)}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return {
      code: 200,
      data: { results: data }
    };
  } catch (error) {
    console.error('Error fetching HP characters by house:', error);
    return {
      code: 500,
      data: { results: [] },
      error: "Failed to fetch HP characters by house"
    };
  }
}

// Funzione principale: gestisci i filtri lato backend!
export async function getFromHP(endpoint = "characters", filters = {}) {
  let url = `https://hp-api.onrender.com/api/${endpoint}`;
  try {
    const response = await fetch(url);
    let data = await response.json();

    // Filtro per nome
    if (filters.nameStartsWith) {
      const search = filters.nameStartsWith.toLowerCase();
      data = data.filter(c => c.name && c.name.toLowerCase().startsWith(search));
    }
    // Filtro per nome esatto
    if (filters.name) {
      const search = filters.name.toLowerCase();
      data = data.filter(c => c.name && c.name.toLowerCase().includes(search));
    }
    // Filtro per house
    if (filters.house) {
      const house = filters.house.toLowerCase();
      data = data.filter(c => c.house && c.house.toLowerCase() === house);
    }
    // Altri filtri possono essere aggiunti qui

    return {
      code: 200,
      data: { results: data }
    };
  } catch (error) {
    console.error('Error fetching from HP API:', error);
    return {
      code: 500,
      data: { results: [] },
      error: "Failed to fetch from HP API"
    };
  }
}

// Validità personaggio
export function isCharacterValid(character) {
  return (
    character &&
    typeof character === 'object' &&
    character.name &&
    character.house &&
    character.image
  );
}