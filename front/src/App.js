import React, { useState, useEffect } from 'react';
import './styles.css';

const API_URL = "http://localhost:4000/graphql";

function App() {
    const [users, setUsers] = useState([]);
    const [foods, setFoods] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedFood, setSelectedFood] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState("");
    const [newUser, setNewUser] = useState({ nom: "", prenom: "", adresse: "", telephone: "", email: "" });

    useEffect(() => {
        fetchUsers();
        fetchFoods();
    }, []);

    const fetchUsers = async () => {
        const query = `query { users { nom email argent inventaire { nom quantite } } }`;
        const response = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
        const data = await response.json();
        setUsers(data.data.users);
    };

    const fetchFoods = async () => {
        const query = `query { foods { nom description prix quantite } }`;
        const response = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
        const data = await response.json();
        setFoods(data.data.foods);
    };

    const acheterPlat = async () => {
        setError("");
        if (!selectedUser || !selectedFood) {
            setError("Sélectionnez un utilisateur et un plat !");
            return;
        }

        const query = `
            mutation Acheter($email: String!, $foodName: String!, $quantite: Int!) {
                acheterPlat(email: $email, foodName: $foodName, quantite: $quantite) {
                    nom
                    argent
                    inventaire { nom quantite }
                }
            }
        `;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, variables: { email: selectedUser, foodName: selectedFood, quantite: parseInt(quantity) } })
        });

        const data = await response.json();
        if (data.errors) {
            setError(data.errors[0].message);
            return;
        }

        alert(`✅ Achat réussi pour ${selectedUser}`);
        fetchUsers();
        fetchFoods();
    };

    const ajouterUser = async () => {
        if (!newUser.nom || !newUser.email) {
            setError("Remplissez tous les champs !");
            return;
        }

        const query = `
            mutation AjouterUser($nom: String!, $prenom: String!, $adresse: String!, $telephone: String!, $email: String!) {
                ajouterUser(nom: $nom, prenom: $prenom, adresse: $adresse, telephone: $telephone, email: $email) {
                    nom email
                }
            }
        `;

        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, variables: newUser })
        });

        alert("👤 Utilisateur ajouté !");
        fetchUsers();
        setNewUser({ nom: "", prenom: "", adresse: "", telephone: "", email: "" });
    };

    const supprimerUser = async (email) => {
        const query = `mutation { supprimerUser(email: "${email}") }`;
        await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
        alert(`❌ Utilisateur ${email} supprimé`);
        fetchUsers();
    };

    return (
        <div className="container mt-4">
            <h1>🍽️ Gestion des Utilisateurs et Achats</h1>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Ajout d'un utilisateur */}
            <h2 className="mt-4">👤 Ajouter un Utilisateur</h2>
            <input className="form-control mb-2" placeholder="Nom" value={newUser.nom} onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })} />
            <input className="form-control mb-2" placeholder="Prénom" value={newUser.prenom} onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })} />
            <input className="form-control mb-2" placeholder="Adresse" value={newUser.adresse} onChange={(e) => setNewUser({ ...newUser, adresse: e.target.value })} />
            <input className="form-control mb-2" placeholder="Téléphone" value={newUser.telephone} onChange={(e) => setNewUser({ ...newUser, telephone: e.target.value })} />
            <input className="form-control mb-2" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
            <button className="btn btn-success mb-3" onClick={ajouterUser}>➕ Ajouter</button>

            {/* Liste des utilisateurs avec inventaire et suppression */}
            <h2>👤 Utilisateurs</h2>
            <ul className="list-group">
                {users.map(user => (
                    <li key={user.email} className="list-group-item">
                        <strong>{user.nom}</strong> ({user.email}) - 💰 {user.argent}€
                        <ul>
                            {user.inventaire.length > 0 ? (
                                user.inventaire.map(item => (
                                    <li key={item.nom}>🍕 {item.nom} x{item.quantite}</li>
                                ))
                            ) : (
                                <li>Aucun produit en inventaire</li>
                            )}
                        </ul>
                        <button className="btn btn-danger btn-sm mt-2" onClick={() => supprimerUser(user.email)}>❌ Supprimer</button>
                    </li>
                ))}
            </ul>

            {/* Liste des plats */}
            <h2 className="mt-4">🍕 Plats Disponibles</h2>
            <ul className="list-group">
                {foods.map(food => (
                    <li key={food.nom} className="list-group-item">
                        <strong>{food.nom}</strong> - {food.description} - 💰 {food.prix}€ - 🏷️ {food.quantite} en stock
                    </li>
                ))}
            </ul>

            {/* Achat de plats */}
            <h2 className="mt-4">🛒 Acheter un Plat</h2>
            <select className="form-control mb-2" onChange={(e) => setSelectedUser(e.target.value)}>
                <option value="">Sélectionner un utilisateur</option>
                {users.map(user => <option key={user.email} value={user.email}>{user.nom}</option>)}
            </select>
            <select className="form-control mb-2" onChange={(e) => setSelectedFood(e.target.value)}>
                <option value="">Sélectionner un plat</option>
                {foods.map(food => (
                    <option key={food.nom} value={food.nom} disabled={food.quantite === 0}>
                        {food.nom} - {food.prix}€ {food.quantite === 0 ? "(Rupture de stock)" : ""}
                    </option>
                ))}
            </select>
            <input type="number" className="form-control mb-2" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            <button className="btn btn-primary" onClick={acheterPlat}>🛍️ Acheter</button>
        </div>
    );
}

export default App;
