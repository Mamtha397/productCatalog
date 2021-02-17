var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var sql = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: 'myProduct_details'
});

sql.connect(function(err) {
    if (err) throw err;
});

// create Comment
app.post("/comment/:product_id/:comment", function(req,res){
    const user_id = req.headers.token;
    const {product_id, comment} = req.params;

    const insertQuery = `INSERT INTO comment (user_id, product_id, comment) VALUES ('${user_id}', '${product_id}', '${comment}');`;

    sql.query(insertQuery, function(err, result) {
        if (err) throw err;
        res.send({
            status: "success",
            msg: "Comment added"
        })
    });
});

// Edit Comment
app.put("/comment/:comment_id/:comment", function(req,res){
    const user_id = req.headers.token;
    const {comment_id, comment} = req.params;

    const updateQuery = `UPDATE comment SET comment='${comment}' WHERE id = '${comment_id}';`;

    sql.query(updateQuery, function(err, result) {
        if (err) throw err;
        res.send("Comment Updated");
    });
});

// Delete Comment
app.delete("/comment/:comment_id", function(req,res){
    const user_id = req.headers.token;
    const {comment_id} = req.params

    const deleteQuery = `DELETE FROM comment WHERE id = '${comment_id}'; `;

    sql.query(deleteQuery, function(err, result) {
        if (err) throw err;
        res.send("Comment Deleted");
    });
});

// Get Comment
app.get("/comments/:product_id", function(req,res){
    const user_id = req.headers.token;
    const {product_id} = req.params;

    const selectQuery = `SELECT * FROM comment WHERE product_id = '${product_id}' AND user_id = '${user_id}';`;

    sql.query(selectQuery, function(err, result){
        if (err) throw err;
        res.send(result)
    })
});

app.listen(8081, function() {
    console.log("APP is running on 8081")
})