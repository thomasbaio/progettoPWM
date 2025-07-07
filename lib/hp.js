import 'dotenv/config';
import fetch from 'node-fetch'; // Import fetch for Node.js
import { getMD5, getRandomInt } from './utils.js';
import * as database from './database.js';

// hp.js: versione per HP API

// Esempio funzione per ottenere tutti i personaggi
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

// Esempio funzione per personaggi filtrati per casa (house)
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

// Esempio funzione generica per endpoint custom della HP API
export async function getFromHP(endpoint = "characters", queryParams = "") {
  let url = `https://hp-api.onrender.com/api/${endpoint}`;
  if (queryParams) {
    url += `?${queryParams}`;
  }
  try {
    const response = await fetch(url);
    const data = await response.json();
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

// Esempio di filtro validità (modificabile secondo le tue esigenze)
export function isCharacterValid(character) {
  // Un personaggio HP è valido se ha nome, casa e immagine
  return (
    character &&
    typeof character === 'object' &&
    character.name &&
    character.house &&
    character.image
  );
}