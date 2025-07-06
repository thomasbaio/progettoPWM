import 'dotenv/config';
import fetch from 'node-fetch'; // Import fetch for Node.js
import { getMD5, getRandomInt } from './utils.js';
import * as database from './database.js';

// Helper to build parameters string with timestamp and hash
function createParameters() {
  const timestamp = Date.now().toString();
  const hash = getMD5(timestamp + process.env.PRIVATE_KEY + process.env.PUBLIC_KEY);
  return `ts=${timestamp}&apikey=${process.env.PUBLIC_KEY}&hash=${hash}`;
}

/**
 * Retrieves the total number of Marvel characters available.
 * @returns {Promise<Object>} JSON response containing total count
 */
export async function returnCharactersNumber() {
  const params = createParameters();
 const query = `limit=1&offset=${offset}`;
const url = `https://gateway.marvel.com/v1/public/characters?${createParameters()}&${query}`;
  const response = await fetch(url);
  return response.json();
}

/**
 * Returns a package of random, valid Marvel character cards.
 * @param {Object} param - { username, user_id, album_id, cards }
 * @returns {Promise<Array>} Array of response objects for each character
 */
export async function returnPackage(param) {
  let validCount = 0;
  let attempts = 0;
  const packageResults = [];

  // Deduct one credit
  const creditChange = { username: param.username, credits: -1 };
  const creditResp = await database.variate_credits(creditChange).catch(err => {
    if (err.code === 401) throw { code: 401, message: 'Insufficient credits' };
    throw err;
  });

  // If still have credits
  if (!creditResp || creditResp.code !== 401) {
    const charCountResp = await returnCharactersNumber();
    const maxChars = charCountResp.data.total;

    while (validCount < param.cards && attempts < 200) {
      const offset = await getRandomInt(0, maxChars);
      const params = createParameters();
      const url = `https://gateway.marvel.com/v1/public/characters?${params}&limit=1&offset=${offset}`;

      try {
        const resp = await fetch(url);
        const data = await resp.json();
        const character = data.data.results[0];

        if (
          character &&
          character.description &&
          character.thumbnail?.path &&
          character.name &&
          !packageResults.some(item => item.data.results[0].id === character.id)
        ) {
          // Save card
          const saveCard = {
            cardID: character.id,
            userID: param.user_id,
            albumID: param.album_id,
          };
          await database.savecard(saveCard);

          packageResults.push(data);
          validCount++;
        }
      } catch (e) {
        console.error('Error in returnPackage:', e);
        throw e;
      }

      attempts++;
    }
  }

  return packageResults;
}

/**
 * Generic function to fetch resources from Marvel API.
 * @param {string} urlPath - API endpoint path (e.g., 'public/characters')
 * @param {string} query - Additional query string (e.g., 'limit=10')
 * @returns {Promise<Object>} { code, data | message }
 */
export async function getFromMarvel(urlPath, query = '') {
  const params = createParameters();
  const url = `https://gateway.marvel.com/v1/${urlPath}?${params}${query ? `&${query}` : ''}`;

  try {
    const resp = await fetch(url);
    const data = await resp.json();

    if (data.code !== 'RequestThrottled') {
      const result = data.data.results.filter(
        char => char.description && char.thumbnail?.path && char.name
      );
      return { code: 200, data: result };
    } else {
      return { code: 401, message: data.message };
    }
  } catch (error) {
    console.error('Error in getFromMarvel:', error);
    throw error;
  }
}
