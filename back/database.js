const mongoose = require('mongoose');

// Connexion à MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/db')
    .then(() => console.log('MongoDB connecté'))
    .catch(err => console.error('Erreur de connexion à MongoDB :', err));

// Modèle User avec argent et inventaire
const userSchema = new mongoose.Schema({
    nom: String,
    prenom: String,
    adresse: String,
    telephone: String,
    email: { type: String, unique: true },
    argent: { type: Number, default: 100 }, // Argent par défaut
    inventaire: [{
        nom: String,
        quantite: Number
    }]
});

const User = mongoose.model('User', userSchema);

// Modèle Food (Plats)
const foodSchema = new mongoose.Schema({
    nom: { type: String, required: true, unique: true },
    description: String,
    prix: Number,
    quantite: { type: Number, default: 1 }
});

const Food = mongoose.model('Food', foodSchema);

module.exports = { User, Food };
