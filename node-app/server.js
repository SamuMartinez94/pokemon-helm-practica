const express = require('express');
const Pokedex = require('pokedex-promise-v2');
const path = require('path');

const app = express();
const pokedex = new Pokedex.default();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//POKÉMON + EVOLUCIONES
app.get('/pokemon/:name', async (req, res) => {
  try {
    const name = req.params.name.toLowerCase();

// atos básicos
    const data = await pokedex.getPokemonByName(name);

// Species (para evolución y descripción)
    const species = await pokedex.getPokemonSpeciesByName(name);

//Obtener evolución
    const evoUrl = species.evolution_chain.url;
    const evoId = evoUrl.split("/").filter(Boolean).pop();
    const evolutionChain = await pokedex.getEvolutionChainById(evoId);

// Función recursiva evoluciones
    const extractEvolutions = (chain) => {
      let evolutions = [];
      evolutions.push(chain.species.name);

      if (chain.evolves_to.length > 0) {
        chain.evolves_to.forEach(evo => {
          evolutions = evolutions.concat(extractEvolutions(evo));
        });
      }

      return evolutions;
    };

    const evolutions = extractEvolutions(evolutionChain.chain);

//Descripción en español
    const descriptionEntry = species.flavor_text_entries.find(
      entry => entry.language.name === "es"
    );

    const filtered = {
      basic: {
        name: data.name,
        id: data.id,
        types: data.types.map(t => t.type.name),
        abilities: data.abilities.map(a => a.ability.name),
        base_experience: data.base_experience,
        height: data.height,
        weight: data.weight,
        sprite: data.sprites.front_default,
      },
      stats: data.stats.map(s => ({
        name: s.stat.name,
        value: s.base_stat
      })),
      evolution: evolutions.length > 1 ? evolutions : null,
      extra: {
        habitat: species.habitat ? species.habitat.name : null,
        description: descriptionEntry
          ? descriptionEntry.flavor_text.replace(/\f/g, ' ')
          : null
      }
    };

    res.json(filtered);

  } catch (error) {
    res.status(404).json({ message: "Pokémon no encontrado" });
  }
});

//GENERACIÓN
app.get('/generation/:name', async (req, res) => {
  try {
    const data = await pokedex.getGenerationByName(req.params.name);

    res.json({
      name: data.name,
      main_region: data.main_region.name,
      pokemon_species_count: data.pokemon_species.length,
      version_groups: data.version_groups.map(v => v.name)
    });

  } catch (error) {
    res.status(404).json({ message: "Generación no encontrada" });
  }
});

//POKÉDEX
app.get('/pokedex/:name', async (req, res) => {
  try {
    const data = await pokedex.getPokedexByName(req.params.name);

    res.json({
      name: data.name,
      region: data.region ? data.region.name : null,
      pokemon_count: data.pokemon_entries.length,
      pokemon_entries: data.pokemon_entries.slice(0, 30).map(p => ({
        entry_number: p.entry_number,
        name: p.pokemon_species.name
      }))
    });

  } catch (error) {
    res.status(404).json({ message: "Pokédex no encontrada" });
  }
});

//LOCALIZACION
app.get('/location/:name', async (req, res) => {
  try {
    const data = await pokedex.getLocationByName(req.params.name);

    res.json({
      name: data.name,
      region: data.region.name,
      areas: data.areas.map(a => a.name)
    });

  } catch (error) {
    res.status(404).json({ message: "Localización no encontrada" });
  }
});

//AREA
app.get('/location-area/:name', async (req, res) => {
  try {
    const data = await pokedex.getLocationAreaByName(req.params.name);

    res.json({
      name: data.name,
      location: data.location.name,
      pokemon_encounters: data.pokemon_encounters.map(p => p.pokemon.name)
    });

  } catch (error) {
    res.status(404).json({ message: "Área no encontrada" });
  }
});

//HÁBITAT
app.get('/habitat/:name', async (req, res) => {
  try {
    const data = await pokedex.getPokemonHabitatByName(req.params.name);

    res.json({
      name: data.name,
      pokemon_species: data.pokemon_species.map(p => p.name)
    });

  } catch (error) {
    res.status(404).json({ message: "Hábitat no encontrado" });
  }
});

//HOME
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//SERVER
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
