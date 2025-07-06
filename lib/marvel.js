import 'dotenv/config';
import { getMD5, getRandomInt } from './utils.js';
import * as database from './database.js';

function createParameters() {
  const timestamp = Date.now().toString();
  const hash = getMD5(timestamp + process.env.PRIVATE_KEY + process.env.PUBLIC_KEY);
  return `ts=${timestamp}&apikey=${process.env.PUBLIC_KEY}&hash=${hash}&`;
}

export async function returnCharactersNumber() {  
  const parameters = createParameters();
  // Corretto: https!
  const response = await fetch(`https://gateway.marvel.com/v1/public/characters?${parameters}limit=1&`);
  return response.json();
}

export async function returnPackage(param) {
  let valid_characters_count = 0;
  let loop_check = 0;
  let query;
  let response_package = [];
  let max_characters;

  const creditChange = {
    username: param.username,
    credits: -1
  };

  const creditResponse = await database.variate_credits(creditChange).catch(response => { 
    if (response.code === 401) {
      throw { code: 401, message: "Insufficient credits" };
    }
    return response;
  });

  if (!creditResponse || creditResponse.code !== 401) {
    const charNumResp = await returnCharactersNumber();
    max_characters = charNumResp.data?.total || 0;

    do {
      const offset = getRandomInt(0, max_characters);
      query = `limit=1&offset=${offset}&`;

      try {
        // Corretto: https!
        const response = await fetch(`https://gateway.marvel.com/v1/public/characters?${createParameters()}${query}`);
        const data = await response.json();

        // Controllo robusto sulla struttura della risposta
        if (data && data.data && Array.isArray(data.data.results) && data.data.results.length > 0) {
          const character = data.data.results[0];
          if (
            isCharacterValid(character) &&
            !response_package.some(item => item.data.results[0].id === character.id)
          ) {
            const saveCard = {
              cardID: character.id,
              userID: param.user_id,
              albumID: param.album_id
            };

            try {
              await database.savecard(saveCard);
              response_package.push(data);
              valid_characters_count++;
            } catch (e) {
              console.error(`Generic Error: ${e}`);
              throw e; // oppure gestisci come vuoi
            }
          }
        } else {
          // Logga eventuali anomalie Marvel
          console.error("Marvel API structure unexpected:", data);
        }
      } catch (error) {
        console.error('Error fetching Marvel data:', error);
        throw error;
      }

      loop_check++;
    } while (valid_characters_count < param.cards && loop_check < 200);

    return response_package;
  }
}

export async function getFromMarvel(res, url, query) {
  const parameters = createParameters();

  try {
    const marvelUrl = `https://gateway.marvel.com/v1/${url}?${parameters}${query}`;
    console.log("Marvel fetch URL:", marvelUrl);

    const response = await fetch(marvelUrl);
    const data = await response.json();

    if (data && data.data && Array.isArray(data.data.results)) {
      return {
        code: 200,
        data: {
          results: data.data.results.filter(isCharacterValid)
        }
      };
    } else {
      // Logga la risposta inattesa
      console.error("Marvel API structure unexpected:", data);
      return {
        code: 500,
        data: {
          results: []
        },
        error: data ? data.status || "Marvel API error" : "No data from Marvel"
      };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      code: 500,
      data: {
        results: []
      },
      error: "Failed to fetch characters"
    };
  }
}

function isCharacterValid(character) {
  // To be valid, the character must have a description, an image and a name
  return (
    character &&
    typeof character === 'object' &&
    character.description &&
    character.thumbnail?.path &&
    character.name
  );
}