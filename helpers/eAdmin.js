module.exports = {
    eAmin: function(req, res,next){
        if(req.isAuthenticated() &&  req.user.eAmin == 1){
            return next;
        }

        req.flash("error_msg","Você precisa ser um Admin!");
        res.redirect("/")
    }
}