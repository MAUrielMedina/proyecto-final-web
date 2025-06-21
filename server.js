const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Configuración de la base de datos
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite');
        db.run(`CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )`);
    }
});

// Rutas del API
app.post('/registro', (req, res) => {
    const { nombre, email, password } = req.body;
    
    db.run(
        'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
        [nombre, email, password],
        function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID });
        }
    );
});

app.get('/datos', (req, res) => {
    db.all('SELECT id, nombre, email FROM usuarios', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.delete('/eliminar/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM usuarios WHERE id = ?', id, function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado correctamente' });
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});