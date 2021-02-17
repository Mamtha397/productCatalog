const port = process.env.PORT || 3000;

var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var fileUpload = require("express-fileupload")
var crypto = require('crypto');

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())
app.use(fileUpload());
app.use(express.static(__dirname + '/uploadImages'));

var sql = mysql.createConnection({
    host: "sql12.freesqldatabase.com",
    user: "sql12393481",
    password: "zfl1FvP5LA",
    database: 'sql12393481'
});

sql.connect(function(err) {
    if (err) throw err;
});

// Get
app.get('/getAllProduct/:page', function(req, res) {
    const limit = 3;
    const page = req.params.page * limit;
    sql.query(`SELECT * FROM Product ORDER BY id LIMIT ${limit} OFFSET ${page};`, function(err, result) {
        if (err) throw err;
        res.send(result)
    });
});

// Get one
app.get('/getOneProduct/:id', function(req, res) {

    const query = `SELECT * FROM Product WHERE id=${req.params.id}`
    sql.query(query, function(err, result) {
        if (err) throw err;
        res.send(result)
    });
});

// Show HTML show_product_v2
app.get('/', function(req, res) {
    res.sendFile(__dirname + "/view/" + "show_product_v2.html");
})

// Show HTML appProduct
app.get('/addProduct', function(req, res) {
    res.sendFile(__dirname + "/view/" + "add_product.html");
})

// Show HTML Edit
app.get('/editProduct', function(req, res) {
    res.sendFile(__dirname + "/view/" + "edit_product.html");
})

// Show HTML upload_image // Added this
app.get('/uploadImage', function(req, res) {
    res.sendFile(__dirname + "/view/" + "upload_image.html");
})

// Show Product
app.get('/showProduct', function(req, res) { // added this
    res.sendFile(__dirname + "/view/" + "show_product.html");
})

// Show WishList
app.get('/wishList', function(req, res) { // added this
    res.sendFile(__dirname + "/view/" + "wishList.html");
})

// create
app.post('/addProduct', function(req, res) {
    const productName = req.body.productName;
    const description = req.body.description;
    const price = req.body.price;
    const stock = req.body.stock;
    const code = req.body.code;
    const colour = req.body.colour;
    const category = req.body.category;

    const insertQuery = `INSERT INTO Product (name, description, price, stock, code, colour, category) VALUES ('${productName}', '${description}', '${price}', '${stock}', '${code}', '${colour}', '${category}');`;

    sql.query(insertQuery, function(err, result) {
        if (err) throw err;
        console.log(result);
        res.send({
            status: "success",
            msg: "Product added"
        })
    });
})

app.post('/upload', function(req, res) {
    const numberOfImages = req.body.numberOfImages;
    const id = req.body.id;
    let listOfImageName = [];
    let file1;
    for (let i = 0; i < numberOfImages; i++) {
        file1 = req.files[`images${i}`]
        listOfImageName.push(file1.name);
        file1.mv(
            "./uploadImages/" + file1.name
        );
    }
    uploadImage(listOfImageName, id, "add");
    res.send("Uploaded successfully");
})

function uploadImage(fileName, id, type) {
    if (type === "add") {
        const selectQuery = `SELECT * FROM Product WHERE id='${id}';`;

        sql.query(selectQuery, function(err, result) {
            if (err) throw err;
            if (result[0].images === null) {
                result[0].images = "";
            }
            const updateQuery = `UPDATE Product SET images= '${result[0].images},${fileName.toString()}' WHERE id='${id}';`;
            sql.query(updateQuery, function(err, result) {
                if (err) throw err;
                // console.log("images updated successfully")
            });
        });

    } else {
        const updateQuery = `UPDATE Product SET images='${fileName.toString()}' WHERE id='${id}';`;

        sql.query(updateQuery, function(err, result) {
            if (err) throw err;
            // console.log("images updated successfully")
        });
    }
}

app.post('/makePrimary', function(req, res) {
    const id = req.body.id;
    const fileName = req.body.fileName;
    const updateQuery = `UPDATE Product SET primaryImage='${fileName}' WHERE id='${id}';`;

    sql.query(updateQuery, function(err, result) {
        if (err) throw err;
        res.send("Product primary image updated");
    });
})

app.post('/deleteImage', function(req, res) {
    const numberOfImages = req.body.numberOfImages;
    const id = req.body.id;
    let listOfImageName = [];
    let fileName;
    for (let i = 0; i < numberOfImages; i++) {
        fileName = req.body[`images${i}`]
        if (fileName) {
            listOfImageName.push(fileName);
        }
    }
    uploadImage(listOfImageName, id, "delete");
    res.send("image delete successfully");
});

app.post('/editImage', function(req, res) {
    const numberOfImages = req.body.numberOfImages;
    const id = req.body.id;
    const file = req.files.image;
    file.mv(
        "./uploadImages/" + file.name
    );
    let listOfImage = [];
    let file1;
    for (let i = 0; i < numberOfImages; i++) {
        file1 = req.body[`images${i}`]
        if (file1) {
            listOfImage.push(file1);
        } else {
            listOfImage.push(file.name);
        }
    }
    uploadImage(listOfImage, id);
    res.send("Updated successfully");
})

// delete
app.delete('/deleteProduct/:id', function(req, res) {
    const id = req.params.id;

    const deleteQuery = `DELETE FROM Product WHERE id='${id}' `;

    sql.query(deleteQuery, function(err, result) {
        if (err) throw err;
        res.send("Product Deleted");
    });
});

// put
app.put('/editProduct', function(req, res) {
    const productName = req.body.productName;
    const description = req.body.description;
    const price = req.body.price;
    const stock = req.body.stock;
    const colour = req.body.colour;
    const category = req.body.category;
    const code = req.body.code;
    const id = req.body.id;

    const updateQuery = `UPDATE Product SET  productName='${productName}', description='${description}', price='${price}', stock='${stock}', colour='${colour}', code='${code}', category='${category}' WHERE id='${id}';`;

    sql.query(updateQuery, function(err, result) {
        if (err) throw err;
        res.send("Product Updated");
    });

});

function UpdatePassword(password,id){
    const updateQuery = `UPDATE User SET password='${password}' WHERE id='${id}';`;

    sql.query(updateQuery, function(err, result) {
        if (err) throw err;
        console.log("password updated")
    });
}

//login
app.post('/login', function(req, res) {
    let mykey = crypto.createCipher('aes-128-cbc', 'mamatha123');
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    let passCrypto = mykey.update(`${password}`, 'utf8', 'hex')
    passCrypto += mykey.final('hex');

    const selectQuery = `SELECT * FROM User WHERE email='${email}'`;

    sql.query(selectQuery, function(err, result) {
        if (err) throw err;
        if (result.length > 0) {
            if(result[0].password!==passCrypto){
                UpdatePassword(passCrypto,result[0].id)
            }
            res.send({
                status: true,
                msg: "User exist",
                email: email,
                result: result,
                id:result[0].id,
                name:name
            })
        } else {
            const insertQuery = `INSERT INTO User (name, email, password) VALUES ('${name}', '${email}', '${passCrypto}');`;

            sql.query(insertQuery, function(err, resultInserted) {
                if (err) throw err;
                res.send({
                    status: true,
                    msg: "User Added",
                    email: email,
                    result: resultInserted, 
                    id:resultInserted.insertId,
                    name:name
                })
            });
        }
    });
})

// update user wishList
app.put('/updateWishList', function(req, res) {
    const id = req.body.id;
    const wishList = req.body.wishList;
    let toSend;

    const selectQuery = `SELECT * FROM wishList WHERE user_id='${id}';`;

    sql.query(selectQuery, function(err, result) {
        console.log('result: ', result[0]);
        if (err) throw err;
        let updateQuery;
        try {
            if (result[0].favourite_product_id.includes(wishList)) {
                result[0].favourite_product_id = result[0].favourite_product_id.replace(`${wishList}`, "");
                updateQuery = `UPDATE wishList SET favourite_product_id= '${result[0].favourite_product_id}' WHERE user_id='${id}';`;
                toSend = `${result[0].favourite_product_id}`;
            } else {
                updateQuery = `UPDATE wishList SET favourite_product_id= '${result[0].favourite_product_id},${wishList}' WHERE user_id='${id}';`;
                toSend = `${result[0].favourite_product_id},${wishList}`
            }
        } catch (error) {
            console.log(error);
            updateQuery = `INSERT INTO wishList (user_id, favourite_product_id) VALUES ('${id}', '${wishList}');`;
            toSend = `${wishList}`;
        }
        console.log('updateQuery: ', updateQuery);
        sql.query(updateQuery, function(err, result) {
            console.log('result: ', result);
            if (err) throw err;
            console.log("User updated successfully")
            res.send(toSend)
        });
    });
});

// create Comment
app.post("/comment/:product_id/:comment", function(req,res){
    const user_id = req.headers.token;
    const {product_id, comment} = req.params;
    const time = Date.now();

    const insertQuery = `INSERT INTO comment (user_id, product_id, comment, time) VALUES ('${user_id}', '${product_id}', '${comment}', '${time}');`;

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
app.get("/comments", function(req,res){

    const selectQuery = `SELECT c.id, c.user_id, c.product_id, c.comment, c.time, u.name
    FROM comment AS c  
    LEFT JOIN User AS u  
    ON c.user_id=u.id;`;

    sql.query(selectQuery, function(err, result){
        if (err) throw err;
        for(let i=0;i<result.length;i++){

        }
        res.send(result)
    })
});

app.listen(port, function() {
    console.log("APP is running on 8081")
})
