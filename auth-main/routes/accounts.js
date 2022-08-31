const express = require('express');
const router = express.Router();
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
let mysql = require('../database/connect.js');
const moment = require('moment');
const fs = require('fs');

/* Get all users (for dashboard) - COMMERCIAL */

router.get('/users', async function(req, res, next) {
    // #swagger.description = "Permet de récupérer la liste de l'ensemble des utilisateurs"
    // #swagger.tags = ['Authentication']
    res.json(
        await getAllUsers()
    );
});

router.get('/logs', async function(req, res, next) { 
    // #swagger.description = "Permet de récupérer les logs au format UTF-8"
    // #swagger.tags = ['Authentication']   
    try {
		const readData = fs.readFileSync("logs.txt", 'utf8');
		if (readData) {
			res.send(readData)
		}
	} catch (error) {
		res.status(500).send("")
	}
});

/* GET specific user */
router.get('/:userId', async function(req, res, next) {
    // #swagger.description = "Permet de récupérer un utilisateur spécifique"
    // #swagger.tags = ['Authentication']
    res.json(
        await getUser(req.params.userId)
    );
});

/* GET specific user */
router.get('/current/user', async function(req, res, next) {
        // #swagger.description = "Permet de récupérer l'utilisateur actuel à partir de son JWT"
    // #swagger.tags = ['Authentication']
    let token = req.cookies.jwt;
    if (token !== undefined && token !== null && token.length > 0){
        let data = await getUserEditableData(token);
        res.json(
            data
        );
    }else{
        res.status(403).send('');
    }
});

/* DELETE specific user */
router.delete('/:userId', async function(req, res, next) {
        // #swagger.description = "Permet de bannir un utilisateur"
    // #swagger.tags = ['Authentication']
    let decodedToken = {};

    jwt.verify(req.cookies.jwt, process.env.JWT_SALT, function(err, decoded) {
        if (err !== null) return res.status(403).send("");
        decodedToken = decoded;
    }); 

    if (req.params.userId == "0"){
        res.json(
            await deleteUser(decodedToken.uid)
        );
    }else if (decodedToken.role === 'commercial'){
        res.json(
            await deleteUser(req.params.userId)
        );
    }

});

router.delete('/perm/:userId', async function(req, res, next) {
        // #swagger.description = "Permet de supprimer un utilisateur"
    // #swagger.tags = ['Authentication']
    let decodedToken = {};

    jwt.verify(req.cookies.jwt, process.env.JWT_SALT, function(err, decoded) {
        if (err !== null) return res.status(403).send("");
        decodedToken = decoded;
    }); 
    if (decodedToken.role === 'commercial'){
        res.json(
            await permDeleteUser(req.params.userId)
        );
    }

});

/* Create new user */
router.post('/', async function(req, res, next) {
        // #swagger.description = "Permet de créer un utilisateur"
    // #swagger.tags = ['Authentication']
    let data = await createUser(req.body);
    console.log("Data : 87 : ",data);
    if (typeof(data) === "string"){
        res.status(201).send(data.toString());
    }else{
        res.status(data).send("");
    }
});

router.put('/', async function(req, res, next) {
        // #swagger.description = "Permet d'éditer un utilisateur"
    // #swagger.tags = ['Authentication']
    res.json(
        await updateUser(req)
    );
});

router.post('/login', async function(req, res, next) {
        // #swagger.description = "Permet de se connecter"
    // #swagger.tags = ['Authentication']
    let jwt = await loginUser(req.body);

    let logStream = fs.createWriteStream('logs.txt', {flags: 'a'});

    if (jwt.length === 0 || jwt === ""){
        logStream.write((new Date()).toLocaleString('fr-FR', { timeZone: 'UTC' })+" | ECHEC - Tentative de connexion : "+req.body.mail+"\r\n");
        logStream.end('');

        return res.status(403).send("Il y a un problème dans l'identifiant ou dans le mot de passe");
    }else{
        // If jwt is valid we can connect the user else we can just generate another one
        logStream.write((new Date()).toLocaleString('fr-FR', { timeZone: 'UTC' })+" | SUCCES - Connexion : "+req.body.mail+"\r\n");
        logStream.end('');

        res.cookie('jwt', jwt);
        res.status(200).send('');
    }
});

router.get('/token/verification', async function(req, res, next) {
    // #swagger.description = "Permet de vérifier la validité d'un JWT"
    // #swagger.tags = ['Authentication']

    // Token has already been checked in dev-proxy
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if (!!token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }
    if (token.length === 0){
        settings = [];
        return res.status(403).send("Invalid");
    }else{
        // If token is valid
        jwt.verify(token, process.env.JWT_SALT, function(err, decoded) {
            if (err !== null) return res.status(403).send("Invalid");
            return res.json(
                decoded
            );
        });
    }
});

router.get('/logout/:id', async function(req, res, next) {
        // #swagger.description = "Permet de déconnecter un utilisateur"
    // #swagger.tags = ['Authentication']
    jwtToken = req.cookies.jwt
    let token = await findActivatedUserByToken(jwtToken);
    if (token.length === 0){
        return res.send("Ce token est invalide");
    }else{
        // If token is valid
        let logStream = fs.createWriteStream('logs.txt', {flags: 'a'});


        jwt.verify(token, process.env.JWT_SALT, function(err, decoded) {
            if (err !== null) token = 0;
            else logoutUser(req.params.id)
            logStream.write((new Date()).toLocaleString('fr-FR', { timeZone: 'UTC' })+" | Déconnexion : "+req.params.id+"\r\n");
        });
        logStream.end('');

    }
    res.send(200)
});

router.get('/referral/code', async function(req, res, next) {
        // #swagger.description = "Permet de récupérer un code de parrainage"
    // #swagger.tags = ['Authentication']
    let jwtToken = req.headers['x-access-token'] || req.headers['authorization'];
    if (!!jwtToken && jwtToken.startsWith('Bearer ')) {
        jwtToken = jwtToken.slice(7, jwtToken.length);
    }

    let user = (await findUserReferral(jwtToken));
    if (user.length === 0){
        res.status(500).json(
            []
        );
    }else{
        res.status(200).json(
            user[0].referrerCode
        );
    }

});

const findActivatedUserByToken = async (jwtToken) => {
    const db = await mysql.connect()
    const user = await db.query("SELECT * FROM users WHERE isActivated=1 and jwtToken = ?",[
        jwtToken
    ]);
    await db.end()
    if (user.length > 0) return jwtToken
    else return [];
}

const getLogData = async () => {
    return await fs.readFile('logs.txt');
}

const findUserReferral = async (jwtToken) => {
    const db = await mysql.connect()
    const user = await db.query("SELECT referrerCode FROM users WHERE isActivated=1 and jwtToken = ?",[
        jwtToken
    ]);
    await db.end()

    const result = Object.values(JSON.parse(JSON.stringify(user)));

    if (user.length > 0) return result
    else return [];
}


const tokenIsInDatabase = async (token) => {
    const db = await mysql.connect()
    const user = await db.query("SELECT referrerCode FROM users WHERE jwtToken = ?",[
        token
    ]);
    await db.end()
    if (user.length > 0) return user.length;
    else return !![..."0"].toString();
}

const getAllUsers = async () => {
    const db = await mysql.connect()
    const users = await db.query("SELECT * FROM users")
    await db.end()
    return users
}
  
const getUser = async (id) => {
    const db = await mysql.connect()
    const users = await db.query("SELECT * FROM users WHERE id=?",[
        id
    ]);
    await db.end()
    return users
}

const getUserEditableData = async (jwt) => {
    const db = await mysql.connect()
    const users = await db.query("SELECT name,lastname,pseudo, mail, phone, address, role, referralCode, referrerCode FROM users WHERE jwtToken=?",[
        jwt
    ]);
    await db.end()
    return users
}

const deleteUser = async (id) => {
    const db = await mysql.connect()
    const users = await db.query("UPDATE users SET isActivated=0 WHERE id=?",[
        id
    ]);
    await db.end()
    return users
}

const permDeleteUser = async (id) => {
    const db = await mysql.connect()
    const users = await db.query("DELETE FROM users WHERE id=?",[
        id
    ]);
    await db.end()
    return users
}

const logoutUser = async (id) => {
    const db = await mysql.connect()
    await db.query("UPDATE users SET jwtToken='' WHERE id=?",[
        id
    ]);
    await db.end();
    return id
}

let createUser = async (user) => {

    if ((await getUserByMail(user.mail)) > 0) return 451; // Check if the user already exist

    let referral = null;
    if (user.referral !== undefined && user.referral !== null && user.referral.length > 0){
        if ((await getReferralCodeCount(user.referral)) === 0) return 417; 
    }

    const db = await mysql.connect();

    // This way a user can't be set admin even if he changes the user.role, an admin should be set manually
    let userRole = "user";
    if (user.role === "deliverer") userRole = "deliverer"
    else if (user.role === "restaurant") userRole = "restaurant"
    await db.query("INSERT INTO `users` (`name`, `lastname`, `pseudo`, `role`, `mail`, `phone`, `address`, `password`, `picture`, `gdprApproved`, `jwtToken`, `referrerCode`, `referralCode`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?);",[
        user.name,
        user.lastname,
        user.pseudo,
        userRole,
        user.mail,
        user.phone,
        user.address,
        getHash(user.password),
        null,
        user.gdprApproved,
        (performance.now().toString(36)+Math.random().toString(36)).replace(/\./g,"").toUpperCase(), // Referrer code
        referral
    ]);

    let userId = await getUserIdByMail(user.mail);

    await db.end()

    const result = Object.values(JSON.parse(JSON.stringify(userId)));
    result.forEach((v) => userId = v.id);
    console.log("uid:",userId);
    return userId.toString();
}

let updateUser = async (req) => {
    const user = req.body;
    const db = await mysql.connect();

    if (user.password.length > 0){
        const users = await db.query("UPDATE `users` SET name=?, lastname=?, pseudo=?, mail=?, phone=?, address=?, password=? WHERE `users`.`jwtToken` = ?;",[
            user.name,
            user.lastname,
            user.pseudo,
            user.mail,
            user.phone,
            user.address,
            getHash(user.password),
            req.cookies.jwt
        ]);
    }else{
        const users = await db.query("UPDATE `users` SET name=?, lastname=?, pseudo=?, mail=?, phone=?, address=? WHERE `users`.`jwtToken` = ?;",[
            user.name,
            user.lastname,
            user.pseudo,
            user.mail,
            user.phone,
            user.address,
            req.cookies.jwt
        ]);
    }

    await db.end()
    return user
}

const loginUser = async (user) => {
    const db = await mysql.connect()
    const userData = await db.query("SELECT id,mail,role FROM users WHERE mail=? and password=? and isActivated=1",[
        user.mail,
        getHash(user.password)
    ]);
    await db.end()

    const result = Object.values(JSON.parse(JSON.stringify(userData)));
    if (result.length > 0){
        return generateToken(result[0]);
    }else{
        return "";
    }
}

const generateToken = async (user) => {
    let uid = user.id, email=user.mail, role=user.role;
    let newToken = jwt.sign({ uid: uid, mail: email, role: role }, process.env.JWT_SALT);
    await updateToken(newToken, uid)
    return newToken;
}

const updateToken = async (jwt,id) => {
    const db = await mysql.connect();
    await db.query("UPDATE users SET jwtToken=? WHERE id=?",[
        jwt,
        id
    ]);
    await db.end()
}

// Utilities

const getUserByMail = async (mail) => {
    const db = await mysql.connect()
    const users = await db.query("SELECT id FROM users WHERE mail=?",[
        mail
    ]);
    await db.end()
    return users.length;
}

const getUserIdByMail = async (mail) => {
    const db = await mysql.connect()
    const users = await db.query("SELECT id FROM users WHERE mail=?",[
        mail
    ]);
    await db.end()
    return users;
}

const getReferralCodeCount = async (code) => {
    const db = await mysql.connect()
    const codes = await db.query("SELECT id FROM users WHERE referrerCode=?",[
        code
    ]);
    await db.end()
    return codes.length;
}

const getHash = (pwd) => {
    return crypto.createHash('sha256').update(pwd+process.env.PASS_SALT).digest('base64');
}

module.exports = router;