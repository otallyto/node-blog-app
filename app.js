//Carregando módulos
const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();
const admin = require("./routes/admin");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
require("./models/Postagens");
require("./models/Categoria");
const usuarios = require("./routes/usuario");
const passport = require("passport");
require("./config/auth")(passport);

const Postagem = mongoose.model("postagens");
const Categoria = mongoose.model("categorias");

//Configurações
//Sessão
app.use(
  session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());
//Flash
app.use(flash());
//Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash('error')
  res.locals.user = req.user || null;
  next();
});
//Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//Handlebars
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
//Mongoose
mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost:27017/blogapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Conexão efetuada com sucesso!");
  })
  .catch(error => {
    console.log("Erro ao se conectar ao banco de dados: " + error);
  });
//Public
app.use(express.static(path.join(__dirname, "public")));

//Rotas
app.use("/admin", admin);

app.get("/", (req, res) => {
  Postagem.find()
    .populate("categoria")
    .sort({ data: "desc" })
    .then(postagens => {
      res.render("index", { postagens: postagens });
    })
    .catch(err => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/404");
    });
});

app.get("/postagem/:slug", (req, res) => {
  Postagem.findOne({ slug: req.params.slug })
    .then(postagem => {
      if (postagem) {
        res.render("postagem/index", { postagem: postagem });
      } else {
        req.flash("error_msg", "Esta postagem não existe");
        res.redirect("/");
      }
    })
    .catch(err => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/");
    });
});

app.get("/404", (req, res) => {
  res.send("Error 404!");
});

app.get("/categorias", (req, res) => {
  Categoria.find()
    .then(categorias => {
      res.render("categorias/index", { categorias: categorias });
    })
    .catch(err => {
      req.flash("error_msg", "Houve um erro interno ao listar as categorias");
      res.redirect("/");
    });
});

app.get("/categorias/:slug", (req, res) => {
  Categoria.findOne({ slug: req.params.slug })
    .then(categoria => {
      if (categoria) {
        Postagem.find({ categoria: categoria._id })
          .then(postagens => {
            res.render("categorias/postagens", {
              postagens: postagens,
              categoria: categoria
            });
          })
          .catch(() => {
            req.flash("error_msg", "Esta caregoria não existe");
            res.redirect("/");
          });
      } else {
        req.flash("error_msg", "Esta caregoria não existe");
        res.redirect("/");
      }
    })
    .catch(err => {
      req.flash(
        "error_msg",
        "Houve um erro interno ao carregar a pagina dessa categoria"
      );
      res.redirect("/");
    });
});

app.use("/usuarios", usuarios);
//Outros
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log("servidor rodando http://localhost:8081");
});
