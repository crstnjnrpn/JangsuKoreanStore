/**
 * order.js - Order page functionality
 * Handles product display, quantity controls, add to cart, and buy now
 */

// ===== PRODUCT DATABASE =====
const products = {
    1: {
        id: 1,
        title: "Food",
        name: "Food",
        price: 95.00,
        category: "Drinks",
        image: "images/drinks.jpg",
        description: "Delicious and creamy milk drink, perfect for any time of the day. Made from fresh ingredients and available in various flavors.",
        fullDesc: "This premium milk drink is made from fresh dairy and comes in original, strawberry, and chocolate flavors. Rich in calcium and vitamins. 250ml bottle."
    },
    2: {
        id: 2,
        title: "LOTTE",
        name: "LOTTE",
        price: 120.00,
        category: "Snacks",
        image: "images/snacks.jpg",
        description: "Delicious and creamy milk drink, perfect for any time of the day. Made from fresh ingredients and available in various flavors.",
        fullDesc: "LOTTE branded snacks and confectioneries. Perfect for sharing with family and friends."
    },
    3: {
        id: 3,
        title: "MIKIS",
        name: "MIKIS",
        price: 85.00,
        category: "Snacks",
        image: "images/snacks.jpg",
        description: "Delicious and creamy milk drink, perfect for any time of the day. Made from fresh ingredients and available in various flavors.",
        fullDesc: "MIKIS snack products - crispy and delicious. Great for any occasion."
    },
    4: {
        id: 4,
        title: "HOT6",
        name: "HOT6",
        price: 105.00,
        category: "Drinks",
        image: "images/drinks.jpg",
        description: "Delicious and creamy milk drink, perfect for any time of the day. Made from fresh ingredients and available in various flavors.",
        fullDesc: "HOT6 energy drinks - stay refreshed and energized throughout the day."
    },
    5: {
        id: 5,
        title: "ORIGINAL",
        name: "ORIGINAL",
        price: 75.00,
        category: "Drinks",
        image: "images/drinks.jpg",
        description: "Delicious and creamy milk drink, perfect for any time of the day. Made from fresh ingredients and available in various flavors.",
        fullDesc: "Original classic flavor - the taste you love. Perfect for everyday enjoyment."
    }
};

// ===== CART FUNCTIONS =====

/**
 * Get cart from localStorage
 */
function getCart() {
    const cart = localStorage.getItem('shoppingCart');
    return cart ? JSON.parse(cart) : [];
}

/**
 * Save cart to localStorage
 */
function saveCart(cart) {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    
    // Update badge
    updateCartBadge();
    
    // Trigger cart update in sidebar if function exists
    if (typeof window.updateCartDisplay === 'function') {
        window.updateCartDisplay();
    }
    
    // Dispatch a custom event that cart-sidebar.js can listen for
    window.dispatchEvent(new Event('cartUpdated'));
}

/**
 * Update cart badge number
 */
function updateCartBadge() {
    const cart = getCart();
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Update badge
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

/**
 * Add item to cart
 */
function addToCart(product, quantity) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name || product.title,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
    
    saveCart(cart);
    return cart;
}

// ===== PAGE SPECIFIC FUNCTIONS =====

/**
 * Get product ID from URL parameters
 */
function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('product') || '1';
}

/**
 * Load product data based on URL parameter
 */
function loadProductData() {
    const productId = getProductIdFromUrl();
    const product = products[productId] || products[1];
    
    // Update page elements
    const titleElement = document.getElementById('order-product-title');
    const priceElement = document.getElementById('order-product-price');
    const categoryElement = document.getElementById('order-product-category');
    const descriptionElement = document.getElementById('order-product-description');
    const fullDescElement = document.getElementById('order-product-full-desc');
    const imageElement = document.getElementById('order-product-image');
    
    if (titleElement) titleElement.textContent = product.title;
    if (priceElement) priceElement.textContent = `₱${product.price.toFixed(2)}`;
    if (categoryElement) categoryElement.textContent = product.category;
    if (descriptionElement) descriptionElement.textContent = product.description;
    if (fullDescElement) fullDescElement.textContent = product.fullDesc;
    if (imageElement) {
        imageElement.src = product.image;
        imageElement.alt = product.title;
    }
    
    // Update page title
    document.title = `Jangsu Korean Store - ${product.title}`;
    
    return product;
}

/**
 * Get current quantity
 */
function getCurrentQuantity() {
    const quantityInput = document.getElementById('quantity');
    return quantityInput ? parseInt(quantityInput.value) : 1;
}

// ===== QUANTITY CONTROL FUNCTIONS =====

function decreaseQuantity() {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    }
}

function increaseQuantity() {
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue < 99) {
            quantityInput.value = currentValue + 1;
        }
    }
}

// ===== ACTION BUTTON FUNCTIONS =====

/**
 * Handle Add to Cart button click
 */
function handleAddToCart() {
    const productId = getProductIdFromUrl();
    const product = products[productId] || products[1];
    const quantity = getCurrentQuantity();
    
    // Add to cart
    addToCart(product, quantity);
    
    // Show feedback
    alert(`Added ${quantity} x ${product.title} to cart!`);
    
    // Open cart sidebar if function exists
    if (typeof window.openCart === 'function') {
        window.openCart();
    }
}

/**
 * Handle Buy Now button click
 */
function handleBuyNow() {
    const productId = getProductIdFromUrl();
    const product = products[productId] || products[1];
    const quantity = getCurrentQuantity();
    
    // Prepare checkout data
    const checkoutData = {
        items: [{
            id: product.id,
            name: product.title,
            price: product.price,
            quantity: quantity,
            image: product.image,
            category: product.category
        }],
        total: product.price * quantity,
        timestamp: new Date().toISOString()
    };
    
    // Save to session for checkout page
    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    
    // Redirect to checkout page
    window.location.href = `checkout.html?product=${productId}&quantity=${quantity}`;
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
    
    // Load product data
    loadProductData();
    
    // Set up quantity button listeners
    const decreaseBtn = document.getElementById('decrease-btn');
    const increaseBtn = document.getElementById('increase-btn');
    
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', decreaseQuantity);
    }
    
    if (increaseBtn) {
        increaseBtn.addEventListener('click', increaseQuantity);
    }
    
    // Set up action button listeners
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const buyNowBtn = document.getElementById('buy-now-btn');
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', handleAddToCart);
    }
    
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', handleBuyNow);
    }
    
    // Update cart badge on page load
    updateCartBadge();
});

// ===== EXPOSE FUNCTIONS GLOBALLY =====
window.decreaseQuantity = decreaseQuantity;
window.increaseQuantity = increaseQuantity;
window.handleAddToCart = handleAddToCart;
window.handleBuyNow = handleBuyNow;
window.addToCart = addToCart;
window.updateCartBadge = updateCartBadge;
window.getCart = getCart;