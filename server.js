const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

const DB_FILE = path.join(__dirname, "data", "db.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readDB() {
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    } catch (error) {
        return {
            products: [],
            users: [],
            orders: []
        };
    }
}

function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function hashPassword(password) {
    return crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
}

app.get("/api/products", (req, res) => {
    const db = readDB();
    res.json(db.products);
});

app.get("/api/products/:id", (req, res) => {
    const db = readDB();

    const product = db.products.find(
        p => p.id === Number(req.params.id)
    );

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    res.json(product);
});

app.post("/api/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    if (username.length < 3) {
        return res.status(400).json({
            message: "Username must contain at least 3 characters"
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "Password must contain at least 6 characters"
        });
    }

    const db = readDB();

    const existingUser = db.users.find(
        user => user.username.toLowerCase() === username.toLowerCase()
    );

    if (existingUser) {
        return res.status(409).json({
            message: "Username already exists"
        });
    }

    const newUser = {
        id: Date.now(),
        username: username,
        password: hashPassword(password)
    };

    db.users.push(newUser);
    writeDB(db);

    res.status(201).json({
        message: "Registration successful"
    });
});

app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    const db = readDB();

    const user = db.users.find(
        user => user.username.toLowerCase() === username.toLowerCase()
    );

    if (!user || user.password !== hashPassword(password)) {
        return res.status(401).json({
            message: "Invalid username or password"
        });
    }

    res.json({
        message: "Login successful",
        username: user.username
    });
});

app.post("/api/orders", (req, res) => {
    const { username, items, total } = req.body;

    if (!username || !items || items.length === 0) {
        return res.status(400).json({
            message: "Invalid order"
        });
    }

    const db = readDB();

    const order = {
        id: Date.now(),
        username: username,
        items: items,
        total: total,
        status: "Confirmed",
        date: new Date().toISOString()
    };

    db.orders.push(order);
    writeDB(db);

    res.status(201).json({
        message: "Order placed successfully",
        orderId: order.id
    });
});

app.get("/api/orders", (req, res) => {
    const db = readDB();
    res.json(db.orders);
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`E-commerce Store running at http://localhost:${PORT}`);
});
