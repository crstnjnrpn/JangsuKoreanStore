/**
 * cart-sidebar.js - Shopping Cart Sidebar Functionality
 */

// ===== CART STATE =====
let cartItems = [];

// ===== DOM ELEMENTS =====
const cartIcon = document.getElementById('cart-icon');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const closeCartBtn = document.getElementById('close-cart');
const cartBadge = document.getElementById('cart-badge');
const emptyCart = document.getElementById('empty-cart');
const cartItemsList = document.getElementById('cart-items-list');
const cartFooter = document.getElementById('cart-footer');
const cartTotal = document.getElementById('cart-total');

// ===== LOAD CART FROM STORAGE =====
function loadCart() {
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
        try {
            cartItems = JSON.parse(savedCart);
            console.log('Cart loaded:', cartItems); // Debug log
        } catch (e) {
            console.error('Error loading cart:', e);
            cartItems = [];
        }
    } else {
        cartItems = [];
    }
    updateCartDisplay();
}

// ===== SAVE CART TO STORAGE =====
function saveCart() {
    localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
    console.log('Cart saved:', cartItems); // Debug log
    updateCartDisplay();
    
    // Update badge if function exists in order.js
    if (typeof window.updateCartBadge === 'function') {
        window.updateCartBadge();
    }
}

// ===== UPDATE CART DISPLAY =====
function updateCartDisplay() {
    console.log('Updating cart display. Items:', cartItems); // Debug log
    
    // Update badge
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    if (cartBadge) {
        cartBadge.textContent = itemCount;
        cartBadge.style.display = itemCount > 0 ? 'flex' : 'none';
    }
    
    // Show/hide empty cart message and items
    if (cartItems.length === 0) {
        if (emptyCart) {
            emptyCart.style.display = 'block';
            console.log('Showing empty cart'); // Debug log
        }
        if (cartItemsList) {
            cartItemsList.style.display = 'none';
            cartItemsList.innerHTML = ''; // Clear any existing items
        }
        if (cartFooter) cartFooter.style.display = 'none';
    } else {
        if (emptyCart) emptyCart.style.display = 'none';
        if (cartItemsList) {
            cartItemsList.style.display = 'block';
            renderCartItems();
            console.log('Rendered cart items'); // Debug log
        }
        if (cartFooter) cartFooter.style.display = 'block';
        updateTotal();
    }
}

// ===== RENDER CART ITEMS =====
function renderCartItems() {
    if (!cartItemsList) return;
    
    if (cartItems.length === 0) {
        cartItemsList.innerHTML = '';
        return;
    }
    
    cartItemsList.innerHTML = cartItems.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='images/default.jpg'">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">₱${item.price.toFixed(2)}</div>
                <div class="item-quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                    <span class="item-quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">×</button>
        </div>
    `).join('');
}

// ===== UPDATE TOTAL =====
function updateTotal() {
    if (!cartTotal) return;
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `₱${total.toFixed(2)}`;
}

// ===== UPDATE QUANTITY =====
function updateQuantity(itemId, change) {
    const item = cartItems.find(item => item.id === itemId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            saveCart();
            renderCartItems(); // Re-render to show updated quantity
            updateTotal();
        }
    }
}

// ===== REMOVE FROM CART =====
function removeFromCart(itemId) {
    cartItems = cartItems.filter(item => item.id !== itemId);
    saveCart();
    renderCartItems(); // Re-render after removal
    updateTotal();
}

// ===== OPEN CART SIDEBAR =====
function openCart() {
    console.log('Opening cart sidebar'); // Debug log
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Refresh display when opening
        loadCart();
    }
}

// ===== CLOSE CART SIDEBAR =====
function closeCart() {
    console.log('Closing cart sidebar'); // Debug log
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart sidebar initializing...'); // Debug log
    loadCart();
    
    // Cart icon click
    if (cartIcon) {
        cartIcon.addEventListener('click', openCart);
        console.log('Cart icon listener added'); // Debug log
    } else {
        console.error('Cart icon not found!'); // Debug log
    }
    
    // Close button click
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCart);
    }
    
    // Overlay click
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }
    
    // Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && cartSidebar && cartSidebar.classList.contains('open')) {
            closeCart();
        }
    });
    
    // View Order button
    const viewOrderBtn = document.getElementById('view-order-btn');
    if (viewOrderBtn) {
        viewOrderBtn.addEventListener('click', function() {
            if (cartItems.length > 0) {
                window.location.href = 'checkout.html';
            }
        });
    }
    
    // Listen for cart updates from order.js
    window.addEventListener('cartUpdated', function() {
        console.log('Cart updated event received'); // Debug log
        loadCart();
    });
});

// ===== EXPOSE FUNCTIONS GLOBALLY =====
window.updateCartDisplay = updateCartDisplay;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.loadCart = loadCart;