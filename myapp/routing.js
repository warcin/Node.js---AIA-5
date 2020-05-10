const express = require('express')
const router = express.Router()
var mysql = require('mysql');
var bought = [];
var not_available = [];
var order_made = false;
var game_added = false;

router.get('/', (req, res) => {
	var con = mysql.createConnection({
	  host: "localhost",
	  user: "root",
	  password: "test",
	  database: "mydb"
	});

	con.connect(function(err) {
	  if (err) throw err;
	  con.query("SELECT * FROM games", function (err, result, fields) {
		if (err) throw err;
		var information = ""
            if (game_added){
                game_added = false;
                information = "Selected game has been added to your cart!"
            }

            if (order_made){
                if(not_available.length != 0){
                    for(var i =0;i<not_available.length; i++){
                        var game = not_available[i].name + ' is no longer available - ';
                        information += game
                        // console.log(not_available[i]);
                    }
                    if(bought.length != 0){
                        information += 'The rest of games are yours'
                    }
                    
                    order_made = false;
                    not_available = [];
                }
                else{
                    information = "All games from cart were bought"
                    order_made = false;
                    bought = [];
                }
            }
			res.render('main', { 'games': result, 'info': information })
			con.end()

	  });
	});
	
});

router.post('/add_to_cart', (req, res) => {
    var game = {
        id: req.body.gameID,
        name: req.body.gameName,
        type: req.body.gameType,
    }

    if (!req.session.cart) {
        req.session.cart = []
    }

    var present = false;

    for (var i = 0; i < req.session.cart.length; i++) {
        if (game.id == req.session.cart[i].id) {
            present = true;
            break;
        }
    }
    if (!present) {
        req.session.cart.push(game);
        game_added = true;
        res.redirect('/')
    }
    else {
        res.redirect('/')
    }
});

router.get('/cart', (req, res) => {
    res.render('cart', { 'games': req.session.cart })
});

router.get('/cancel_all', (req, res) => {
    req.session.cart = []
    res.redirect('/')
});

router.post('/remove_from_cart', (req, res) => {
    var game = {
        id: req.body.gameID,
        name: req.body.gameName,
        type: req.body.gameType,
    }

    for (var i = 0; i < req.session.cart.length; i++) {
        if (game.id == req.session.cart[i].id) {
            req.session.cart.splice(i, 1)
            break;
        }
    }

    res.redirect('cart')
});

router.get('/purchase_all', (req, res) => {

    if (!req.session.cart) {
        req.session.cart = []
    }

    var cart_length = req.session.cart.length;
    if (cart_length === 0){
        res.redirect('/cart');
    }
	
    var con = mysql.createConnection({
	  host: "localhost",
	  user: "root",
	  password: "test",
	  database: "mydb"
	});

	con.connect(function(err) {
	  if (err) throw err;


        req.session.cart.forEach(element => { 

			let sqlquery = "DELETE FROM games WHERE id = ?"
			con.query(sqlquery, [element.id], function (err, result, fields) {
                if (err) throw err;

                if (result.n === 1){
                    bought.push(element)
                }
                else if (result.n === 0){
                    not_available.push(element)
                }

            });
            
        });
        
        order_made = true;
        con.end()
        req.session.cart = []
        
    })
	res.redirect('/')

});

router.get('/restart', (req, res) => {
    var con = mysql.createConnection({
	  host: "localhost",
	  user: "root",
	  password: "test",
	  database: "mydb"
	});

	con.connect(function(err) {
	  if (err) throw err;

        var records = [
			['Terraria', 'ARPG', 0],
			['Minecraft', 'Sandbox', 1],
			['Escape from Tarkov', 'FPS', 2]
		];
		con.query("INSERT IGNORE INTO games (name,type,id) VALUES ?", [records], function (err, result, fields) {
			if (err) throw err;
			console.log(result);
			console.log("Number of rows affected : " + result.affectedRows);
		});
        con.end()
		})
    res.redirect('/')
})


module.exports = router;
