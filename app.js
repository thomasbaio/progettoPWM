// Importazione dei moduli necessari tramite sintassi ES6
import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import path from 'path';
import { fileURLToPath } from 'url'; // MANCAVA!
import { dirname } from 'path'; // MANCAVA!

import { marvel } from "./config/prefs.js";
import * as database from './lib/database.js';
import * as marvel_API from './lib/marvel.js';
import * as Utils from './lib/utils.js';
import * as register from './lib/register.js';
import { login } from './lib/login.js';
import {
  serve as swaggerUiServe,
  setup as swaggerUiSetup,
} from "swagger-ui-express";
import swaggerDocument from './lib/api/docs/swagger-output.json' with { type: 'json' };
// RIMOSSO: import 'dotenv/config'; (già fatto sopra)
// RIMOSSO: /*import swaggerUi from 'swagger-ui-express';*/

// Fix per __filename e __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Variabile globale
global.db;

// Dichiarazione dell'app Express
const app = express();
app.use(express.json());

// Routing per cartella statica
app.use(express.static(path.join(__dirname, 'public')));

// ENDPOINTS

app.get('/', async (_, res) => {
  res.sendFile(path.resolve("./public/html/index.html"));
});
app.get('/package', (req, res) => {
  res.sendFile(path.resolve("./public/html/package.html"));
});
app.get('/card', async (req, res) => {
  res.sendFile(path.resolve("./public/html/card_detail.html"));
});
app.get('/user', async (req, res) => {
  res.sendFile(path.resolve("./public/html/user_profile.html"));
});
app.get('/login', async (req, res) => {
  res.sendFile(path.resolve("./public/html/login.html"));
});
app.get('/register', async (req, res) => {
  res.sendFile(path.resolve("./public/html/register.html"));
});
app.get('/album', async (req, res) => {
  res.sendFile(path.resolve("./public/html/album.html"));
});
app.get('/sell_cards', async (req, res) => {
  res.sendFile(path.resolve("./public/html/sell_cards.html"));
});

// Album dell'utente
app.get('/albums/:userid', async (req, res) => {
  try {
    const response = await database.getUserAlbums(req.params.userid);
    res.send(response);
  } catch (error) {
    console.error("Error fetching albums:", error.message);
    res.status(500).json({ error: "Failed to fetch albums: " + error.message });
  }
});

app.get('/albums_cards/:albumid', async (req, res) => {
  try {
    const response = await database.getAlbumsCards(req.params.albumid);
    for (let i = 0; i < response.length; i++) {
      const marvelData = await marvel_API.getFromMarvel(req, 'public/characters/' + response[i].card_Id, '');
      response[i].marvel_data = marvelData;
    }
    res.send(response);
  } catch (error) {
    console.error("Error fetching albums:", error.message);
    res.status(500).json({ error: "Failed to fetch albums: " + error.message });
  }
});

app.get('/albums_duplicated_cards/:albumid', async (req, res) => {
  try {
    const response = await database.getDuplicatedAlbumsCards(req.params.albumid);
    for (let i = 0; i < response.length; i++) {
      const marvelData = await marvel_API.getFromMarvel(req, 'public/characters/' + response[i].card_Id, '');
      response[i].marvel_data = marvelData;
    }
    res.send(response);
  } catch (error) {
    console.error("Error fetching albums:", error.message);
    res.status(500).json({ error: "Failed to fetch albums: " + error.message });
  }
});

app.get('/create_exchange', async (req, res) => {
  res.sendFile(path.resolve("./public/html/create_exchange.html"));
});
app.get('/exchange', async (req, res) => {
  res.sendFile(path.resolve("./public/html/select_exchange.html"));
});
app.get('/get-credits', async (req, res) => {
  res.sendFile(path.resolve("./public/html/get_credits.html"));
});
app.get('/print-credits/:username', async (req, res) => {
  await database.get_Credits(req.params.username).then(response => { res.send(response); });
});
app.post('/create_exchange', async (req, res) => {
  await database.create_exchange(req.body).then(response => { res.send(response); });
});
app.post('/accept_exchange', async (req, res) => {
  await database.accept_exchange(req.body).then(response => { res.send(response); });
});
app.post('/check_card_album', async (req, res) => {
  await database.check_card_album(req.body).then(response => { res.send(response); });
});
app.post('/check_exchanges', async (req, res) => {
  await database.get_valid_exchanges(req.body).then(response => { res.send(response); });
});
app.post('/check_my_exchanges', async (req, res) => {
  await database.get_my_exchanges(req.body).then(response => { res.send(response); });
});

// Marvel API
app.get("/character/:id", async (req, res) => {
  try {
    const response = await marvel_API.getFromMarvel(req, 'public/characters/' + req.params.id, '');
    res.json(response);
  } catch (error) {
    console.error("Error fetching character:", error);
    res.status(500).json({ error: "Failed to fetch character" });
  }
});

// SWAGGER MANAGEMENT
app.use('/api-docs', swaggerUiServe, swaggerUiSetup(swaggerDocument));

// POST ENDPOINTS

app.post("/register", async (req, res) => {
  try {
    await register.register(res, req.body);
  } catch (error) {
    console.error("Registration error");
  }
});
app.post('/package', (req, res) => {
  marvel_API.returnPackage(req.body).then(response => { res.send(response); });
});
app.post('/create_album', (req, res) => {
  database.createAlbum(req.body).then(response => { res.send(response); });
});
app.post('/edit-credits', (req, res) => {
  database.variate_credits(req.headers).then(response => { res.send(response); });
});
app.post('/check-db', async (req, res) => {
  const result = await database.check_db_connection();
  res.status(result.status).json(result);
});
app.post("/characters", (req, res) => {
  marvel_API.getFromMarvel(req, 'public/characters', req.query.query)
    .then(response => { res.send(response); });
});

// AUTHENTICATION
app.post("/login", async (req, res) => {
  login(req, res);
});
app.post("/get_user_data", async (req, res) => {
  await register.authuser(req, res);
});

app.put("/update-user", async (req, res) => {
  await database.update_user(req.body).then(response => { res.send(response); });
});
app.delete("/delete-user/:userid", async (req, res) => {
  await database.delete_user(req.params.userid).then(response => { res.send(response); });
});
app.delete("/delete-exchange/:exchangeid", async (req, res) => {
  await database.delete_exchange(req.params.exchangeid).then(response => { res.send(response); });
});
app.delete("/sell_card/", async (req, res) => {
  await database.remove_card(req.body, 'sell_card').then(response => { res.send(response); });
});

// ATTIVA IL SERVER SULLA PORTA SPECIFICATA
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

// CHECK DI STARTUP
database.check_db_connection()
  .then(() => console.log("Database connection successful"))
  .catch(error => console.error("Database connection failed:", error));
