const express = require('express');
const Pokedex = require('pokedex-promise-v2');
const path = require('path');

const app = express();
const pokedex = new Pokedex.default();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/pokemon/:name', async (req, res) => {
  try {
    const name = req.params.name.toLowerCase();
    const data = await pokedex.getPokemonByName(name);

    const filtered = {
      name: data.name,
      id: data.id,
      types: data.types.map(t => t.type.name),
      abilities: data.abilities.map(a => a.ability.name),
      base_experience: data.base_experience,
      sprite: data.sprites.front_default,
    };

    res.json(filtered);
  } catch (error) {
    res.status(404).json({ message: "Pokémon no encontrado" });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
