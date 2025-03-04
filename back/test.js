const { User, Food } = require('./database');

// Fonction pour ajouter un utilisateur
const ajouterUtilisateur = async () => {
    try {
        const existUser = await User.findOne({ email: "jean.dupont@example.com" });
        if (!existUser) {
            const user = new User({
                nom: "Dupont",
                prenom: "Jean",
                adresse: "123 Rue Principale",
                telephone: "0123456789",
                email: "jean.dupont@example.com",
                argent: 50, // Ajout d'un solde initial
                inventaire: []
            });
            await user.save();
            console.log("✅ Utilisateur ajouté !");
        } else {
            console.log("ℹ️ L'utilisateur existe déjà.");
        }
    } catch (error) {
        console.error("❌ Erreur lors de l'ajout de l'utilisateur :", error);
    }
};

// Fonction pour ajouter un plat ou incrémenter sa quantité
const ajouterPlat = async (nom, description, prix) => {
    try {
        const plat = await Food.findOne({ nom });

        if (plat) {
            // Si le plat existe déjà, on met à jour la quantité
            plat.quantite += 1;
            await plat.save();
            console.log(`✅ Quantité augmentée pour ${nom} (${plat.quantite} en stock)`);
        } else {
            // Sinon, on ajoute un nouveau plat
            const nouveauPlat = new Food({ nom, description, prix, quantite: 5 }); // Stock initial = 5
            await nouveauPlat.save();
            console.log(`🍽️ Nouveau plat ajouté: ${nom}`);
        }
    } catch (error) {
        console.error('❌ Erreur lors de l’ajout du plat:', error);
    }
};

// Fonction pour acheter un plat
const acheterPlat = async (userEmail, foodName, quantiteAchetee) => {
    try {
        // Trouver l'utilisateur et le plat
        const utilisateur = await User.findOne({ email: userEmail });
        const plat = await Food.findOne({ nom: foodName });

        if (!utilisateur) {
            console.log("❌ Utilisateur non trouvé.");
            return;
        }
        if (!plat) {
            console.log("❌ Plat non trouvé.");
            return;
        }
        if (plat.quantite < quantiteAchetee) {
            console.log("⚠️ Stock insuffisant pour ce plat.");
            return;
        }

        const prixTotal = plat.prix * quantiteAchetee;

        if (utilisateur.argent < prixTotal) {
            console.log("❌ Pas assez d'argent pour acheter ce plat.");
            return;
        }

        // Mise à jour de l'argent de l'utilisateur
        utilisateur.argent -= prixTotal;

        // Mise à jour du stock du plat
        plat.quantite -= quantiteAchetee;

        // Ajouter le plat dans l'inventaire de l'utilisateur (ou augmenter la quantité)
        const itemIndex = utilisateur.inventaire.findIndex(item => item.nom === foodName);
        if (itemIndex !== -1) {
            utilisateur.inventaire[itemIndex].quantite += quantiteAchetee;
        } else {
            utilisateur.inventaire.push({ nom: foodName, quantite: quantiteAchetee });
        }

        // Sauvegarder les changements
        await utilisateur.save();
        await plat.save();

        console.log(`✅ Achat réussi ! ${quantiteAchetee} ${foodName} ajouté à l'inventaire de ${utilisateur.nom}.`);
        console.log(`💰 Argent restant : ${utilisateur.argent}€`);
    } catch (error) {
        console.error("❌ Erreur lors de l'achat :", error);
    }
};

// Fonction pour afficher l'inventaire d'un utilisateur
const afficherInventaire = async (userEmail) => {
    try {
        const utilisateur = await User.findOne({ email: userEmail });

        if (!utilisateur) {
            console.log("❌ Utilisateur non trouvé.");
            return;
        }

        // Transformer l'inventaire en tableau propre
        const inventaireNettoye = utilisateur.inventaire.map(item => ({
            Nom: item.nom,
            Quantité: item.quantite
        }));

        console.log(`📦 Inventaire de ${utilisateur.nom}:`);
        console.table(inventaireNettoye); // Affichage propre
        console.log(`💰 Argent restant: ${utilisateur.argent}€`);
    } catch (error) {
        console.error("❌ Erreur lors de l'affichage de l'inventaire :", error);
    }
};

// Exécution du test
const test = async () => {
    await ajouterUtilisateur();
    await ajouterPlat("Pizza", "Tomate, fromage", 10);
    await ajouterPlat("Burger", "Bœuf, salade, fromage", 8);

    // Achat de plats
    await acheterPlat("jean.dupont@example.com", "Pizza", 2);
    await acheterPlat("jean.dupont@example.com", "Burger", 1);

    // Affichage de l'inventaire après achat
    await afficherInventaire("jean.dupont@example.com");
};

test();
