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
  /// res.status(200).json(req.body);
  // Check if request body is empty and fill with default values
  if (!req.body.name || !req.body.email) {
    req.body.name = req.body.name || "err";
    req.body.email = req.body.email || "err";
  }

  try {
    const user = new User({ name: req.body.name, email: req.body.email });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: 'Error creating user', error: err.message });
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

// Ruta per obtenir un usuari per ID
app.get('/MediaRank/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
});

// Ruta per actualitzar un usuari per ID
app.put('/MediaRank/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const user = await User.findByIdAndUpdate(id, { name, email }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ message: 'Error updating user', error: err.message });
  }
});

// Ruta per eliminar un usuari per ID
app.delete('/MediaRank/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
});

// Inicia el servidorxºxºz  
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
