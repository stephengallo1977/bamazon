var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "password",
    database: "bamazon_db"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    console.log("connect as id" + connection.threadId);
    // run the start function after the connection is made to prompt the user
    start();
});

function start() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        const restab = res.reduce((acc, {
            item_id,
            ...x
        }) => {
            acc[item_id] = x;
            return acc
        }, {})
        console.table(restab);

        purchaseItem();
    });
}

function purchaseItem() {
    inquirer.prompt([{
                type: "input",
                message: "What is the ID of the item that you would like to purchase: ",
                name: "itemID"
            },
            {
                type: "number",
                message: "How many of the item that you would like to purchase: ",
                name: "howMany"
            },
        ])
        .then(function (answers) {
            let IdReq = answers.itemID;
            let quantityReq = answers.howMany;
            console.log(IdReq)
            makePurchase(IdReq, quantityReq);
        });
};

function makePurchase(wantedId, wantedQuan) {
    connection.query(
        "SELECT * FROM products WHERE ?", [{
            item_id: wantedId
        }],
        function (error, res) {
            console.log(res);
            if (error) throw error;
            if (wantedQuan <= res[0].stock_quantity) {
                let total = res[0].price * wantedId;
                let leftStock = res[0].stock_quantity - wantedQuan;
                console.log("\nGood news sufficient quantity in stock\n");
                console.log("\nYour total cost is: " + total + "\n");
                connection.query("UPDATE products SET ? WHERE ? ", [{
                    stock_quantity: leftStock
                }, {
                    item_id: wantedId
                }], function (error, res) {
                    if (error) throw error;

                });

            } else {
                console.log("\nInsufficient stock\n");
            };
            anotherPurchase()
        }
    );

};

function anotherPurchase() {
    inquirer.prompt([{
            type: "confirm",
            message: "Do you want to make another purchase?",
            name: "confirm"

        }])

        .then(function (answers) {
            if (answers.confirm === true) {
                start();
            } else {
                console.log("\nCome again\n");
                connection.end();
            }
        });
}