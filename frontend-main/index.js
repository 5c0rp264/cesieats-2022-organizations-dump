const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 8050
const axios = require('axios');
const fs = require('fs');

const swaggerUi = require('swagger-ui-express')

const doc = {
  info: {
    version: "1.0.0",
    title: 'CESI EATS - Frontend API',
    description: 'Cette documentation explique les différents endpoints contenus dans le service dédié à la gestion du front-end de CESI EATS',
  },
  tags: [
    {
        "name": "Frontend",
        "description": "Endpoints"
    }
],
      securityDefinitions: {
        JWT: {
            type: "apiKey",
            name: "jwt",
            in: "cookies"
        },
    },
  host: 'localhost:8090',
  basePath: "/",
  schemes: ['http', 'https'],
};

const servicesDoc = require('./documentation/services.json');

const jsonParser = bodyParser.json()
app.use(express.static(__dirname));

app.use('/api/documentation', swaggerUi.serve, swaggerUi.setup(servicesDoc))

app.get('/', (req, res) => {
  // #swagger.summary = "Cet endpoint permet d'accéder à la page d'accueil de l'interface CESI EATS"
  // #swagger.description = "En fonction de l'état de la présence d'un JWT dans les cookies l'utilisateur de cet endpoint est susceptible d'être redirigé soit sur la page d'accueil du site soit sur son tableau de bord"
  // #swagger.tags = ['Frontend']
  res.sendFile(__dirname+'/index.html')
});


// Matches any path
app.get('/:path', async (req, res) => {
  // If the user is a restaurant and doesn't have configured his shop yet we need to redirect him on the good page

  // #swagger.summary = "Cet endpoint permet d'accéder à n'importe quelle page"
  // #swagger.description = "Si l'utilisateur est connecté et est un restaurateur et que ce dernier n'a pas encore effectué la configuration de son restaurant alors la seule page auquel il aura accès sera celle pour initialiser son restaurant"
  // #swagger.tags = ['Frontend']
  let redirectToShopManagement = false;
  let tokenExist = false;
  if(req.headers.cookie !== undefined) {
    let cookies = req.headers.cookie.split(';');
    cookies.forEach((cookie)=>{
      if (cookie.indexOf("jwt") > -1){
        tokenExist = true;
        let tokenData = JSON.parse(Buffer.from(cookie.split("=")[1].split(".")[1],"base64").toString());
        if (tokenData.role === "restaurant"){
          // If the restaurant is empty in mongo
          axios.get('http://localhost:8110/restaurants/owner',{
            headers: {
              user: JSON.stringify(tokenData)
            }
          }).then((restaurant)=>{
            let data = restaurant.data.restaurant;
            if (data === null){
              // Restaurant needs to be created for the user
              // we need to retrieve its name
              axios.get('http://localhost:8100/accounts/'+tokenData.uid.toString()).then((user)=>{
                let newRestaurantName = user.data[0].pseudo;
                axios.post('http://localhost:8110/restaurants/', {
                  name:newRestaurantName,
                  user:user.data[0].id
                },{
                  headers: {
                    user: JSON.stringify(tokenData)
                  }
                }).then((newRest)=>{
                  redirectToShopManagement = true;
                });
              });
            }else{
              if (data.category === undefined){
                redirectToShopManagement = true;
              }
            }
          });
        }
      }
    })
  }

  if (!tokenExist && !req.params.path.includes("vendor") && !req.params.path.includes("connexion") && !req.params.path.includes("index") && !req.params.path.includes("js") && !req.params.path.includes("css") && !req.params.path.includes("img")){
    return res.redirect("/connexion");
  }

  if (redirectToShopManagement){
    return res.sendFile(__dirname+'/mon-restaurant.html');
  }else{
    return res.sendFile(__dirname+'/'+req.params.path+".html");
  }
});

app.get('/compte/deconnexion', (req, res) => {
    // #swagger.summary = "Permet à un utilisateur connecté de se déconnecter et en supprimant tout ses cookies"
    // #swagger.tags = ['Frontend']
  res.redirect('/connexion.html');
})

function parseJwt(token){
  return JSON.parse(decodeURIComponent(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')).split('').map(function(c){
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);}).join('')));
}

function getJWTData(){
  return parseJwt($.cookie('jwt'));
}

// Secure paths for restaurant
app.get('/restaurant/:path', (req, res) => {
  // #swagger.summary = "Cet endpoint est une version sécurisée des chemins classiques"
  // #swagger.description = "Cette version spécifique permet d'accéder de manière sécurisée aux différents PATH propre aux services de restauration, ces URLs sont ensuite filtrées par le proxy pour bien s'assurer du rôle de la personne tentant d'y accéder.
  // #swagger.tags = ['Frontend']
  res.sendFile(__dirname+'/restaurant/'+req.params.path+".html")
});

app.get('/components/list', (req, res) => {
    // #swagger.summary = "Permet d'obtenir la liste des composants"
    // #swagger.description = "Réserver à l'équipe technique la liste des composants permet de visualiser l'ensemble du contenu des briques réutilisables de CESI EATS"
    // #swagger.tags = ['Frontend']

  // Get the name of each component
  let fileArray = [];
  fs.readdirSync("components").forEach(file => {
    fileArray.push(file.split('.')[0]);
  });
  // Send it in json
  res.json(fileArray);
});

app.get('/components/download/:comp', (req, res) => {
      // #swagger.summary = "Permet de télécharger lun composant spécifique"
    // #swagger.description = "Afin d'obtenir une version locale d'un composant pour l'éditer et possiblement l'upload cet endpoint permet de télécharger n'importe lequel d'entre eux en s'assurant bien du rôle de l'utilisateur"
    // #swagger.tags = ['Frontend']


  let currentRole = JSON.parse(req.headers.user).role;
  let currentUser = JSON.parse(req.headers.user).mail;

  let logStream = fs.createWriteStream('log-composant.txt', {flags: 'a'});

  if (currentRole === "tech" || currentRole === "dev"){
    logStream.write((new Date()).toLocaleString('fr-FR', { timeZone: 'UTC' })+" | Téléchargement du composant : "+req.params.comp+" | "+currentUser+"\r\n");
    logStream.end('');
    res.status(200).download("components/"+req.params.comp+".html");
  }else{
    logStream.write((new Date()).toLocaleString('fr-FR', { timeZone: 'UTC' })+" | Tentative de téléchargement non autorisé du composant : "+req.params.comp+" | "+currentUser+"\r\n");
    logStream.end('');
    res.status(500).send('Unauthorized');
  }
});

app.get('/components/logs', (req, res) => {
        // #swagger.summary = "Permet d'afficher les logs de téléchargement et d'ajout de composants"
      // #swagger.description = "Les composants sont sujets à être téléchargés ou bien ajoutés, cet endpoint permet d'obtenir la liste de toutes les actions effectués sur ces derniers et des utilisateurs associés ainsi que la date et l'heure (timestamp) de l'action"
    // #swagger.tags = ['Frontend']
  try {
		const readData = fs.readFileSync("log-composant.txt", 'utf8');
		if (readData) {
			res.send(readData)
		}
	} catch (error) {
		res.status(500).send("")
	}
});

app.post('/components/upload', jsonParser, (req, res) => {
    // #swagger.summary = "Permet d'ajouter un composant spécifique"
    // #swagger.description = "Le service technique doit pouvoir ajouter des briques réutilisables à souhait dans la plateforme CESI EATS cet endpoint permet d'ajouter ou de réecrire un composant existant ou non en chargeant son propre fichier"
    // #swagger.tags = ['Frontend']
  let name = req.body.name;
  let content = decodeURI(req.body.content);

  let currentRole = JSON.parse(req.headers.user).role;
  let currentUser = JSON.parse(req.headers.user).mail;

  if (currentRole === "tech" || currentRole === "dev"){
    fs.writeFileSync('components/'+name, content);

    let logStream = fs.createWriteStream('log-composant.txt', {flags: 'a'});
  
    logStream.write((new Date()).toLocaleString('fr-FR', { timeZone: 'UTC' })+" | Upload du composant : "+name+" | "+currentUser+"\r\n");
    logStream.end('');
    res.status(200).send("")
  }else{
    let logStream = fs.createWriteStream('log-composant.txt', {flags: 'a'});
  
    logStream.write((new Date()).toLocaleString('fr-FR', { timeZone: 'UTC' })+" | Tentative d'upload du composant : "+name+" | "+currentUser+"\r\n");
    logStream.end('');
    res.status(500).send("")
  }
});


app.listen(port, () => {
  console.log(`CESI EATS is now running in http://localhost:8090`)
});