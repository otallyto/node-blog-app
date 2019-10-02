//Carregando módulos
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const admin = require('./routes/admin');
const path = require('path');
const mongoose = require('mongoose');

//Configurações
    //Body Parser
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    //Handlebars
    app.engine('handlebars',handlebars({defaultLayout: 'main'}));
    app.set('view engine', 'handlebars');
    //Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost:27017/blogapp', {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
        console.log("Conexão efetuada com sucesso!");
    }).catch((error)=>{console.log("Erro ao se conectar ao banco de dados: "+ error)});
    //Public
    app.use(express.static(path.join(__dirname,'public')));

    //Middleware
    app.use((req,res,next)=>{
        console.log('Oi seu sou um midware');
        next();
    })

//Rotas
app.use('/admin',admin);


//Outros
const PORT = 8081;
app.listen(PORT,()=>{
    console.log('servidor rodando http://localhost:8081');
})