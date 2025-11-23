/*

// cart.js - Enhanced Cart Functionality for Nexus Gaming
document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const CART_KEY = 'nexusCart';
    const SHIPPING_COST = 99.00;
    const CURRENCY = 'R';
    
    // DOM Elements
    const cartCounters = document.querySelectorAll('.cart-counter');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('subtotal');
    const cartShipping = document.getElementById('shipping');
    const cartTotal = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Initialize cart
    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

    // ======================
    // CORE CART FUNCTIONS
    // ======================
    
    function saveCart() {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartCounter();
        if (cartItemsContainer) updateCartDisplay();
    }

    function updateCartCounter() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCounters.forEach(counter => {
            counter.textContent = totalItems;
            counter.style.display = totalItems > 0 ? 'inline-block' : 'none';
        });
    }

    // ======================
    // PUBLIC CART METHODS
    // ======================
    
    window.addToCart = function(name, price, image = 'assets/images/placeholder.jpg', id = null) {
        // Generate ID if not provided
        const productId = id || 'prod-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        // Parse price safely
        const parsedPrice = parseFloat(typeof price === 'string' ? 
            price.replace(/[^\d.]/g, '') : price);
        
        if (isNaN(parsedPrice)) {
            console.error('Invalid price:', price);
            return false;
        }

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: name,
                price: parsedPrice,
                image: image,
                quantity: 1
            });
        }

        saveCart();
        showNotification(`${name} added to cart!`);
        return true;
    };

    // ======================
    // CART DISPLAY FUNCTIONS
    // ======================
    
    function updateCartDisplay() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <p>Your cart is empty</p>
                    <div class="empty-cart-actions">
                        <a href="products.html" class="cta-button">Browse PCs</a>
                        <a href="games.html" class="cta-button">Explore Games</a>
                    </div>
                </div>
            `;
            updateCartTotals(0);
            if (checkoutBtn) checkoutBtn.style.display = 'none';
            return;
        }

        let itemsHTML = '';
        let subtotal = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            itemsHTML += `
                <div class="cart-item">
                    <div class="item-image">
                        <img src="${item.image}" alt="${item.name}" loading="lazy">
                    </div>
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        <div class="item-price">${CURRENCY}${item.price.toFixed(2)}</div>
                    </div>
                    <div class="item-quantity">
                        <button class="quantity-btn minus" data-index="${index}">−</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn plus" data-index="${index}">+</button>
                    </div>
                    <div class="item-total">${CURRENCY}${itemTotal.toFixed(2)}</div>
                    <div class="item-remove">
                        <button class="remove-btn" data-index="${index}">×</button>
                    </div>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = itemsHTML;
        updateCartTotals(subtotal);
        addCartEventListeners();
    }

    function updateCartTotals(subtotal) {
        const shipping = subtotal > 0 ? SHIPPING_COST : 0;
        const total = subtotal + shipping;

        if (cartSubtotal) cartSubtotal.textContent = `${CURRENCY}${subtotal.toFixed(2)}`;
        if (cartShipping) cartShipping.textContent = `${CURRENCY}${shipping.toFixed(2)}`;
        if (cartTotal) cartTotal.textContent = `${CURRENCY}${total.toFixed(2)}`;
        if (checkoutBtn) checkoutBtn.style.display = 'block';
    }

    // ======================
    // EVENT HANDLERS
    // ======================
    
    function addCartEventListeners() {
        // Quantity buttons
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                const change = this.classList.contains('minus') ? -1 : 1;
                updateQuantity(index, change);
            });
        });

        // Remove buttons
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', function() {
                removeFromCart(parseInt(this.dataset.index));
            });
        });
    }

    function updateQuantity(index, change) {
        if (cart[index]) {
            cart[index].quantity += change;
            
            if (cart[index].quantity <= 0) {
                removeFromCart(index);
            } else {
                saveCart();
            }
        }
    }

    function removeFromCart(index) {
        if (index >= 0 && index < cart.length) {
            const removedItem = cart.splice(index, 1)[0];
            saveCart();
            showNotification(`${removedItem.name} removed from cart`);
        }
    }

    // ======================
    // UTILITY FUNCTIONS
    // ======================
    
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 2000);
    }

    // ======================
    // INITIALIZATION
    // ======================
    
    // Initialize cart counter
    updateCartCounter();

    // Initialize cart display if on cart page
    if (cartItemsContainer) {
        updateCartDisplay();
    }

    // Setup event listeners for PC cards
    document.querySelectorAll('.pc-card .add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.pc-card');
            const name = card.querySelector('h3').textContent;
            const price = card.querySelector('.price').textContent;
            const image = card.querySelector('img').src;
            const id = card.dataset.productId || null;
            
            addToCart(name, price, image, id);
        });
    });

    // Setup checkout button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            if (cart.length === 0) {
                e.preventDefault();
                showNotification('Your cart is empty!');
            }
            // Actual checkout would happen here
        });
    }

    // Make cart functions available globally
    window.NexusCart = {
        addItem: window.addToCart,
        getCart: () => [...cart],
        clearCart: () => {
            cart = [];
            saveCart();
        }
    };
});

*/