// Importaciones de librerias
import express from 'express';
import sql from 'mssql';
import bcrypt from 'bcrypt';    
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Crea una instancia del servidor.
const app = express();

//Funciona como middlware que es un facilitador para escuchar peticiones 
app.use(express.json());
// Permite peticiones desde diferentes puertos
app.use(cors());

// Configurar las variables de entorno
dotenv.config()

// Configuraciones de credenciales SQL Server
const dbConfig = {
    user: 'sa',
    password: '<Admin2026>',
    server: 'localhost',
    database: 'PM',
    options: { encrypt: false, trustServerCertificate: false}
}

//Endpoint Register
app.post('/register', async(req, res) => {
    const { nombre, email, password } = req.body;
    try {
        // Conectar a la DB
        let pool = await sql.connect(dbConfig);

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, hashedPassword)
            .query('INSERT INTO Usuarios Values(@nombre, @email, @password)');

        res.status(201).json({message: "Usuario registrado correctamente"})
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Error al intentar registrarse"});
    } 
});

//Endpoint Login
app.post('/login', async(req, res) => {
    const { email, password } = req.body;
    
    // Buscar usuario
    const user = await buscarUsuarioDB(email);

    // mandar error si no se encontro
    if (!user) {
        return res.status(401).json({ message: "No se encontro al usuario"});
    }

    // Comparar la contraseña 
    const passworMatch = await bcrypt.compare(password, user.password);    

    if (passworMatch) {

        const JWT_SECRET = process.env.JWT_SECRET;
        
        if(!JWT_SECRET) {
            return res.status(500).json({ message: "Error de configuracion del servidor"});
        }

        const token = jwt.sign(
        {
            email: user.email
        },
        JWT_SECRET,
        { expiresIn: '1hr' }
    );
        res.status(200).json(
            { 
                message: "Login Correcto", 
                token: token
            }
        );
    } else {
        res.status(401).json({ message: "Contraseña incorrecta"});
    }
});

async function buscarUsuarioDB(email: String) {
    try {

        // Conectar a la DB
        let pool = await sql.connect(dbConfig);

        // consulta a DB
        const resultado  = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Usuarios where email = @email');
        return resultado.recordset[0];
    } catch(error) { 
        console.error(error);
        throw error;
    }
}

app.listen(3000, () => console.log("Servidor corriendo en http://localhost:3000"))