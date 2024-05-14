const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios')
const PORT = 2002;

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

const EtudiantSchema = new mongoose.Schema({
    nom: String,
    filiere: { type: String }
});

const Etudiant = mongoose.model('Etudiant', EtudiantSchema);

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/etudiantdb');

// Ajouter un étudiant
app.post('/etudiants', async (req, res) => {
    try {
            const { nom, filiere } = req.body;

        // Récupérer le nombre d'inscrits dans le filière
        const response1 = await axios.get(`http://localhost:2001/filiers/${filiere}/inscrits`);
        const nombreInscrits = response1.data.inscrits; //parsint
        //incrimenter 
        await axios.put(`http://localhost:2001/filiers/${filiere}/inscrits/${1}`);

        // Vérifier si le nombre d'inscrits est inférieur à 100
        if (nombreInscrits >= 100) {
            return res.status(400).json({ message: 'Le nombre maximal d\'inscrits dans ce filière a été atteint' });
        }

        // Ajouter l'étudiant si la vérification est réussie
        const etudiant = new Etudiant({ nom, filiere });
        await etudiant.save();
        res.json({ message: 'Étudiant ajouté avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer un étudiant
// Supprimer un étudiant
app.delete('/etudiants/:id', async (req, res) => {
    try {
        const deletedEtudiant = await Etudiant.findById(req.params.id);
        if (!deletedEtudiant) {
            return res.json({ message: 'Étudiant non trouvé' });
        }
        await Etudiant.findByIdAndDelete(req.params.id);
        
        const filiere = deletedEtudiant.filiere;
        await axios.put(`http://localhost:2001/filiers/${filiere}/inscrits/${-1}`);

        res.json({ message: 'Étudiant supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.listen(PORT, () => {
    console.log('Microservice service_etudiant démarré sur le port',PORT);
});