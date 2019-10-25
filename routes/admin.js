const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model('categorias');
require('../models/Postagens');
const Postagem = mongoose.model('postagens');
const {eAmin} = require('../helpers/eAdmin')

router.get('/',eAmin, (req, res) => {
    res.render("admin/index")
});

router.get('/posts',eAmin, (req, res) => {
    res.send("Pagina de posts")
});

router.get('/categorias',eAmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("admin/categorias", { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias");
        res.redirect('/admin');
    })

});

router.get('/categorias/add',eAmin, (req, res) => {

    res.render("admin/addcategorias")
});

//Editar uma categoria
router.get('/categorias/edit/:id',eAmin, (req, res) => {
    Categoria.findOne({ id_: req.params._id }).then((categoria) => {
        res.render("admin/editcategoria", { categoria: categoria })
    }).catch((err) => {
        req.flash("error_msg", "Essa categoria não existe!");
        res.redirect('/admin/categorias')
    })

});

router.post("/categorias/edit", eAmin,(req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {
        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;


        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso!");
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao  categoria!");
            res.redirect('/admin/categorias')

        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria!");
        res.redirect('/admin/categorias')
    })
});

router.post("/categorias/nova", eAmin,(req, res) => {

    var erros = [];
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido" });
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug inválido" });
    }

    if (erros.length > 0) {
        res.render("admin/addcategorias", { erros: erros })
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!")
            res.redirect('/admin')
        })
    }


});

//Deletar categoria
router.post("/categorias/deletar",eAmin, (req, res) => {
    Categoria.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!");
        res.redirect('/admin/categorias');
    }).catch((err) => {
        req.flash("error_msg", "Categoria deletada com sucesso!");
        res.redirect('/admin/categorias')
    })
})

//Acessar postagens
/*
router.get("/postagens", (req, res) => {
    res.render("admin/postagens");
})*/

router.get('/postagens',eAmin, (req, res) => {
    Postagem.find().populate("categoria").sort({ data: 'desc' }).then((postagens) => {
        res.render("admin/postagens", { postagens: postagens })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })
})


//Cadastrar postagens
router.get("/postagens/add", eAmin,(req, res) => {
    Categoria.find().then((categorias) => {
        res.render("admin/addpostagens", { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        res.redirect("/admin")
    })

})

router.post("/postagens/nova",eAmin, (req, res) => {
    var erros = []

    if (req.body.categoria == "0") {
        erros.push({ texto: "Categoria invalida, registre uma categoria" })
    }

    if (erros.length > 0) {
        res.render("admin/addpostagens", { erros })
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug

        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!");
            res.redirect("/admin/postagens");
        }).catch(() => {
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem");
            res.redirect("/admin/postagens")
        })
    }
})

router.get("/postagens/edit/:id", eAmin,(req, res) => {
    Postagem.findOne({ _id: req.params.id }).then((postagem) => {
        Categoria.find().then((categorias) => {
            res.render("admin/editpostagens", { categorias: categorias, postagem: postagem })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias");
            res.redirect("/admin/postagens")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição");
        res.redirect("/admin/postagens")
    })

})

//Atualiza dados da postagem
router.post("/postagem/edit",eAmin, (req, res) => {
    Postagem.findOne({ _id: req.body.id }).then((postagem) => {
        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            console.log(err)
            req.flash("error_msg", "Erro ao editar a categoria");
            res.redirect("/admin/postagens")
        })
    }).catch((err) => {

        req.flash("error_msg", "Houve um erro ao salvar uma edição")
        res.redirect("/admin/postagens")
    })
})

//Deletar postagem
//Forma não recomendada
router.get("/postagens/deletar/:id", eAmin,(req, res) => {
    Postagem.deleteMany({ _id: req.params.id }).then((
    ) => {
        req.flash("success_msg", "Post apagado com sucesso")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno!")
        res.redirect("/admin/postagens")
        console.log(err)
    })
})

module.exports = router;