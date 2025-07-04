import 'dotenv/config';
import { getMD5, getRandomInt } from './utils.js';
import * as database from './database.js';

function createParameters() {
  const timestamp = Date.now().toString();
  const hash = getMD5(timestamp + process.env.PRIVATE_KEY + process.env.PUBLIC_KEY);
  return `ts=${timestamp}&apikey=${process.env.PUBLIC_KEY}&hash=${hash}&`;
}

/*To determine the maximum I can reach with the characters I make the first call by putting a single return line as a parameter*/
export async function returnCharactersNumber() {  
  const parameters = createParameters();
  const response = await fetch(`http://gateway.marvel.com/v1/public/characters?${parameters}limit=1&`);
  return response.json();
}

/*Print the package by calling the marvel 5 times with a limit of 1, random offset and validating each character before writing it into the json.
Once the number of characters required by the parameter is reached, the package is returned*/
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
    max_characters = charNumResp.data.total;

    do {
      const offset = getRandomInt(0, max_characters);
      query = `limit=1&offset=${offset}&`;

      try {
        const response = await fetch(`http://gateway.marvel.com/v1/public/characters?${createParameters()}${query}`);
        const data = await response.json();

        const character = data.data.results[0];
        if (isCharacterValid(character) &&
            !response_package.some(item => item.data.results[0].id === character.id)) {

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
      } catch (error) {
        console.error('Error fetching Marvel data:', error);
        throw error;
      }

      loop_check++;
    } while (valid_characters_count < param.cards && loop_check < 200);

    return response_package;
  }
}

/*Generic function*/
export async function getFromMarvel(res, url, query){
  const parameters = createParameters();

  try {
    const response = await fetch(`http://gateway.marvel.com/v1/${url}?${parameters}${query}`);
    const data = await response.json();

    if (data.code !== "RequestThrottled") {
      const response_package = data.data.results.filter(isCharacterValid);
      return {
        code: 200,
        data: response_package
      };
    } else {
      return {
        code: 401,
        message: data.message
      };
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

function isCharacterValid(character) {
  /*To be valid, the character must have a description, an image and a name*/
  return character.description && character.thumbnail?.path && character.name;
}
