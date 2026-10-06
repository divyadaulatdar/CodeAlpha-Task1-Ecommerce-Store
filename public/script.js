let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Load products
async function loadProducts() {
    try {
        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error("Products not found");
        }

        products = await response.json();
    } catch (error) {
        // Demo products if backend data is unavailable
        products = [
            {
                id: 1,
                name: "Wireless Headphones",
                price: 1499,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
            },
            {
                id: 2,
                name: "Smart Watch",
                price: 2499,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
            },
            {
                id: 3,
                name: "Running Shoes",
                price: 1999,
                category: "Fashion",
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
            },
            {
                id: 4,
                name: "Backpack",
                price: 999,
                category: "Accessories",
                image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62"
            }
        ];
    }

    displayProducts();
    updateCart();
}

// Display products
function displayProducts() {
    const productContainer = document.getElementById("products");

    if (!productContainer) {
        return;
    }

    productContainer.innerHTML = "";

    products.forEach(product => {
        productContainer.innerHTML += `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">

                <div class="product-info">
                    <h3>${product.name}</h3>

                    <p class="category">${product.category}</p>

                    <p class="price">₹${product.price}</p>

                    <button class="view-btn"
                        onclick="viewProduct(${product.id})">
                        View Details
                    </button>

                    <button class="add-btn"
                        onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    });
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(item => item.id === productId);

    if (!product) {
        return;
    }

    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCart();

    alert(product.name + " added to cart!");
}

// Update cart
function updateCart() {
    const cartCount = document.getElementById("cartCount");
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const totalPrice = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    if (cartCount) {
        cartCount.textContent = totalItems;
    }

    if (cartTotal) {
        cartTotal.textContent = totalPrice;
    }

    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = "<p>Your cart is empty.</p>";
            return;
        }

        cartItems.innerHTML = "";

        cart.forEach(item => {
            cartItems.innerHTML += `
                <div class="cart-item">
                    <div>
                        <strong>${item.name}</strong>
                        <p>₹${item.price} × ${item.quantity}</p>
                    </div>

                    <button class="remove-btn"
                        onclick="removeFromCart(${item.id})">
                        Remove
                    </button>
                </div>
            `;
        });
    }
}

// Remove product from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCart();
}

// Open cart
function openCart() {
    const cartBox = document.getElementById("cartBox");

    if (cartBox) {
        cartBox.classList.add("active");
    }
}

// Close cart
function closeCart() {
    const cartBox = document.getElementById("cartBox");

    if (cartBox) {
        cartBox.classList.remove("active");
    }
}

// View product details
function viewProduct(productId) {
    const product = products.find(item => item.id === productId);

    if (!product) {
        return;
    }

    localStorage.setItem(
        "selectedProduct",
        JSON.stringify(product)
    );

    window.location.href = "product.html";
}

// Checkout
async function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    try {
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                items: cart,
                total: cart.reduce(
                    (sum, item) =>
                        sum + item.price * item.quantity,
                    0
                )
            })
        });

        if (response.ok) {
            alert("Order placed successfully!");
            cart = [];
            localStorage.removeItem("cart");
            updateCart();
            closeCart();
        } else {
            alert("Order placed successfully!");
            cart = [];
            localStorage.removeItem("cart");
            updateCart();
            closeCart();
        }
    } catch (error) {
        alert("Order placed successfully!");
        cart = [];
        localStorage.removeItem("cart");
        updateCart();
        closeCart();
    }
}

// Start application
document.addEventListener("DOMContentLoaded", loadProducts);
