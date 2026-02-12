const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

app.get("/pokemon/:name", async (req, res) => {
  try {
    const name = req.params.name.toLowerCase();
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!response.ok) throw new Error("No encontrado");
    const data = await response.json();

    const filtered = {
      name: data.name,
      id: data.id,
      types: data.types.map(t => t.type.name),
      abilities: data.abilities.map(a => a.ability.name),
      base_experience: data.base_experience,
      sprite: data.sprites.front_default,
    };

    res.json(filtered);
  } catch (err) {
    res.status(404).json({ message: "Pokémon no encontrado" });
  }
});

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><meta charset="UTF-8"><title>Mi Pokédex</title></head>
      <body>
        <h1>Mi Pokédex</h1>
        <input id="name" placeholder="Introduce el nombre del Pokémon"/>
        <button onclick="search()">Buscar</button>
        <div id="result"></div>

        <script>
          async function search() {
            const name = document.getElementById("name").value;
            const res = await fetch("/pokemon/" + name);
            const data = await res.json();
            if(data.message) {
              document.getElementById("result").innerText = data.message;
            } else {
              document.getElementById("result").innerHTML = 
                '<h2>' + data.name + ' (ID: ' + data.id + ')</h2>' +
                '<img src="' + data.sprite + '" />' +
                '<p>Tipos: ' + data.types.join(', ') + '</p>' +
                '<p>Habilidades: ' + data.abilities.join(', ') + '</p>' +
                '<p>Experiencia base: ' + data.base_experience + '</p>';
            }
          }
        </script>
      </body>
    </html>
  `);
});

app.listen(3000, () => console.log("Server running on port 3000"));
