const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const PORT = 2001;


const FiliereSchema = new mongoose.Schema({
    nom: String,
    inscrits: { type: Number, default: 0 } 
});
// Authentication Middleware
const AuthMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'Token not found' });
    }
  
    try {
      const decoded = jwt.verify(token, 'FST_KEY');
      req.user = decoded; 
      next();
    } catch (error) {
      return res.status(403).json({ error: 'Invalid token' });
    }
  };

const Filiere = mongoose.model('Filiere', FiliereSchema);

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/servicedb');

// Ajouter un filière
app.post('/filiers', async (req, res) => {
    try {
        const filiere = new Filiere(req.body);
        await filiere.save();
        res.json({ message: 'Filière ajoutée avec succès' });
    } catch (error) {
        res.json({ message: error.message });
    }
});

// Supprimer un filière
app.delete('/filiers/:id', async (req, res) => {
    try {
        await Filiere.findByIdAndDelete(req.params.id);
        res.json({ message: 'Filière supprimée avec succès' });
    } catch (error) {
        res.json({ message: error.message });
    }
});

// Récupérer le nombre d'inscrits dans un filière spécifique
app.get('/filiers/:id/inscrits', async (req, res) => {
    try {
        const filiere = await Filiere.findById(req.params.id);
        if (filiere) {
            res.json({ inscrits: filiere.inscrits });
        } else {
            res.status(404).json({ message: 'Filière non trouvée' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour le nombre d'inscrits dans un filière spécifique
app.put('/filiers/:id/inscrits/:num', async (req, res) => {
    try {
        const filiere = await Filiere.findById(req.params.id);
        if (filiere) {
            filiere.inscrits += parseInt(req.params.num);
            await filiere.save();
            res.json({ message: 'Nombre d\'inscrits mis à jour avec succès' });
        } else {
            res.status(404).json({ message: 'Filière non trouvée' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log('Microservice service_filier démarré sur le port:',PORT);
});