// script.js - Consolidated Cart and Main Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const CART_KEY = 'nexusCart';
    const SHIPPING_COST = 99.00;
    const CURRENCY = 'R';
    const FLOATING_TEXT_DURATION = 1000;
    const NOTIFICATION_DURATION = 2000;
    
    // Initialize cart
    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

    // ======================
    // CORE CART FUNCTIONS
    // ======================
    
    function saveCart() {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartCounter();
        if (document.getElementById('cart-items')) updateCartDisplay();
    }

    function updateCartCounter() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelectorAll('.cart-counter').forEach(counter => {
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
        showFloatingText();
        showNotification(`${name} added to cart!`);
        return true;
    };

    // ======================
    // CART DISPLAY FUNCTIONS
    // ======================
    
    function updateCartDisplay() {
        const cartItemsContainer = document.getElementById('cart-items');
        if (!cartItemsContainer) return;
        
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
            if (document.getElementById('checkout-btn')) {
                document.getElementById('checkout-btn').style.display = 'none';
            }
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

        if (document.getElementById('subtotal')) {
            document.getElementById('subtotal').textContent = `${CURRENCY}${subtotal.toFixed(2)}`;
        }
        if (document.getElementById('shipping')) {
            document.getElementById('shipping').textContent = `${CURRENCY}${shipping.toFixed(2)}`;
        }
        if (document.getElementById('total')) {
            document.getElementById('total').textContent = `${CURRENCY}${total.toFixed(2)}`;
        }
        if (document.getElementById('checkout-btn')) {
            document.getElementById('checkout-btn').style.display = 'block';
        }
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
    
    function showFloatingText() {
        const floatingText = document.createElement('div');
        floatingText.className = 'floating-text';
        floatingText.textContent = '+1';
        document.body.appendChild(floatingText);
        setTimeout(() => floatingText.remove(), FLOATING_TEXT_DURATION);
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, NOTIFICATION_DURATION);
    }

    function generateProductId(card) {
        if (!card) return 'prod-' + Date.now();
        return 'prod-' + card.querySelector('h3').textContent
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    // ======================
    // MAIN PAGE FUNCTIONALITY
    // ======================
    
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Navigation effects
    const currentPage = location.pathname.split('/').pop();
    document.querySelectorAll('.navbar a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
        
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateY(-3px)';
        });
        
        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateY(0)';
        });
    });

    // ======================
    // INITIALIZATION
    // ======================
    
    // Initialize cart counter
    updateCartCounter();

    // Initialize cart display if on cart page
    if (document.getElementById('cart-items')) {
        updateCartDisplay();
    }

    // Setup event listeners for all add-to-cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.pc-card, .game-card');
            if (!card) return;

            const name = card.dataset.productName || card.querySelector('h3').textContent.trim();
            const price = card.querySelector('.price').textContent;
            const image = card.querySelector('img')?.src || 'assets/images/placeholder.jpg';
            const id = card.dataset.productId || null;
            
            addToCart(name, price, image, id);
        });
    });

    // Setup checkout button if exists
    if (document.getElementById('checkout-btn')) {
        document.getElementById('checkout-btn').addEventListener('click', (e) => {
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