const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3030;
// Middleware per parsejar el cos de les sol·licituds a JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Connecta't a MongoDB (modifica l'URI amb la teva pròpia cadena de connexió)
mongoose.connect('mongodb+srv://pau:pau@pau.2qrey.mongodb.net', { dbName:'MediaRankDB' },{collection:'MediaRank'})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Definició del model de dades (un exemple simple d'un model de "Usuari")
const userSchema = new mongoose.Schema({
  usuario: {
    nombre: String,
    apellido: String,
    email: String
  },
  contenido:[
    {
      url:String,
      generos:[{type:String}],
      titulo: String,
      tipo: String,
      fecha_subida: Date
    }
  ],
  votos:[
    {
      usuario:String,
      titulo:String,
      fecha_voto: Date
    }
  ]
});

const User = mongoose.model('MediaRank', userSchema,'MediaRank');

// post user
// get votes
// get media/:dataini/:datafi
// delete user

app.get('/', async (req, res) => {
  res.send("Hellw");
});


app.post('/MediaRank', async (req, res) => {
  try {
    const { usuario, contenido = [], votos = [] } = req.body;

    if (!usuario?.nombre || !usuario?.email) {
      return res.status(400).json({ message: "Nombre y email son obligatorios" });
    }

    const newUser = new User({ usuario, contenido, votos });
    await newUser.save();

    res.status(201).json({ message: "Usuario creado con éxito", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Error al crear usuario", error: err.message });
  }
});

app.get('/MediaRank/vote', async (req, res) => {
  try {
    const users = await User.find({}, 'votos');
    const voteCount = {};

    users.forEach(user => {
      user.votos.forEach(({ titulo }) => {
        voteCount[titulo] = (voteCount[titulo] || 0) + 1;
      });
    });

    res.status(200).json(Object.entries(voteCount).map(([titulo, total_votos]) => ({ titulo, total_votos })));
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo votos', error: err.message });
  }
});

app.get('/MediaRank/:dataini/:datafi', async (req, res) => {
  try {
    const startDate = new Date(req.params.dataini);
    const endDate = new Date(req.params.datafi);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ message: "Fechas no válidas. Usa formato YYYY-MM-DD" });
    }

    const users = await User.find({}, 'contenido');
    const filteredContent = users.flatMap(user =>
      user.contenido.filter(({ fecha_subida }) => fecha_subida >= startDate && fecha_subida <= endDate)
    );

    res.status(200).json(filteredContent);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo contenido', error: err.message });
  }
});

// Ruta per obtenir tots els usuaris
app.get('/MediaRank', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// Inicia el servidorxºxºz  
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
