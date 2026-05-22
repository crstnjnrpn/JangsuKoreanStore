/**
 * cart-system.js - Complete shopping cart system with Firebase orders
 */

console.log('✅ cart-system.js loaded successfully');

let cart = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart system initializing');
    loadCart();
    
    if (window.location.pathname.includes('checkout.html')) {
        loadCheckoutData();
    }
    if (window.location.pathname.includes('order-confirm.html')) {
        loadOrderConfirmation();
    }
    
    setupCartListeners();
    updateAllDisplays();
});

function loadCart() {
    const saved = localStorage.getItem('shoppingCart');
    if (saved) {
        try {
            cart = JSON.parse(saved);
        } catch (e) {
            cart = [];
        }
    }
}

function saveCart() {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    updateAllDisplays();
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getItemCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function updateAllDisplays() {
    updateCartBadge();
    updateCartSidebar();
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        const count = getItemCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

function updateCartSidebar() {
    const cartItemsList = document.getElementById('cart-items-list');
    const emptyCart = document.getElementById('empty-cart');
    const cartFooter = document.getElementById('cart-footer');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');
    
    if (!cartItemsList) return;
    
    const count = getItemCount();
    if (cartCount) cartCount.textContent = count;
    
    if (cart.length === 0) {
        if (emptyCart) emptyCart.style.display = 'block';
        cartItemsList.innerHTML = '';
        if (cartFooter) cartFooter.style.display = 'none';
    } else {
        if (emptyCart) emptyCart.style.display = 'none';
        if (cartFooter) cartFooter.style.display = 'block';
        
        cartItemsList.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='images/default.jpg'">
                <div class="cart-item-details">
                    <div class="cart-item-title">${escapeHtml(item.name)}</div>
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
    
    if (cartTotal) cartTotal.textContent = `₱${getCartTotal().toFixed(2)}`;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function openCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar && overlay) {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateCartSidebar();
    }
}

function closeCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar && overlay) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function setupCartListeners() {
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) cartIcon.addEventListener('click', openCart);
    
    const closeBtn = document.getElementById('close-cart');
    if (closeBtn) closeBtn.addEventListener('click', closeCart);
    
    const overlay = document.getElementById('cart-overlay');
    if (overlay) overlay.addEventListener('click', closeCart);
    
    const viewBtn = document.getElementById('view-order-btn');
    if (viewBtn) {
        viewBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your cart is empty');
                return;
            }
            const checkoutData = {
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                })),
                total: getCartTotal()
            };
            sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
            window.location.href = 'checkout.html';
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeCart();
    });
}

window.updateQuantity = function(itemId, change) {
    const item = cart.find(item => item.id == itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id != itemId);
        }
        saveCart();
        updateCartSidebar();
    }
};

window.removeFromCart = function(itemId) {
    cart = cart.filter(item => item.id != itemId);
    saveCart();
    alert('Item removed from cart');
    updateCartSidebar();
};

function loadCheckoutData() {
    const checkoutData = sessionStorage.getItem('checkoutData');
    const checkoutContent = document.getElementById('checkout-content');
    const checkoutActions = document.getElementById('checkout-actions');
    
    if (!checkoutContent) return;
    
    if (!checkoutData) {
        checkoutContent.innerHTML = `<div class="empty-checkout"><p>No items to checkout!</p><a href="products.html">Browse Products</a></div>`;
        if (checkoutActions) checkoutActions.style.display = 'none';
        return;
    }
    
    const data = JSON.parse(checkoutData);
    const items = data.items || [];
    
    if (items.length === 0) {
        checkoutContent.innerHTML = `<div class="empty-checkout"><p>No items to checkout!</p><a href="products.html">Browse Products</a></div>`;
        if (checkoutActions) checkoutActions.style.display = 'none';
        return;
    }
    
    let subtotal = 0;
    items.forEach(item => { subtotal += item.price * item.quantity; });
    
    const forNumber = 'FOR:' + Math.floor(100000 + Math.random() * 900000);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split('T')[0];
    
    const leftColumnHtml = `
        <div class="checkout-left">
            <div class="checkout-section">
                <h2 class="section-title">Order Summary</h2>
                <div class="checkout-items-container">
                    ${items.map(item => `
                        <div class="checkout-item">
                            <div class="item-info">
                                <img src="${item.image}" class="item-image" onerror="this.src='images/default.jpg'">
                                <div class="item-details">
                                    <span class="item-name">${escapeHtml(item.name)}</span>
                                    <div class="item-meta">
                                        <span class="item-price">₱${item.price.toFixed(2)}</span>
                                        <span class="item-quantity">${item.quantity}x</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    <span class="total-label">Total:</span>
                    <span class="total-value">₱${subtotal.toFixed(2)}</span>
                </div>
            </div>
            <div class="checkout-section">
                <h2 class="section-title">Pickup Schedule</h2>
                <div class="schedule-form">
                    <div class="form-field">
                        <label for="pickup-date">Date:</label>
                        <input type="date" id="pickup-date" value="${defaultDate}">
                    </div>
                    <div class="form-field">
                        <label for="pickup-time">Time:</label>
                        <input type="time" id="pickup-time" value="12:00">
                    </div>
                </div>
            </div>
            <div class="checkout-section">
                <h2 class="section-title">Payment Method</h2>
                <div class="payment-options">
                    <label class="payment-option">
                        <input type="radio" name="payment" value="Cash On Pickup" checked> 
                        <span>Cash On Pickup</span>
                    </label>
                </div>
            </div>
            <div class="for-number"><span>${forNumber}</span></div>
        </div>
    `;
    
    const rightColumnHtml = `
        <div class="checkout-right">
            <div class="checkout-section">
                <h2 class="section-title">Order Summary</h2>
                ${items.map(item => `
                    <div class="checkout-item">
                        <div class="item-info">
                            <span class="item-name">${escapeHtml(item.name)}</span>
                            <div class="item-meta">
                                <span class="item-price">₱${item.price.toFixed(2)}</span>
                                <span class="item-quantity">${item.quantity}x</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="checkout-section pickup-payment-section">
                <h2 class="section-title">Pickup & Payment Method</h2>
                <div class="info-rows">
                    <div class="info-row">
                        <span class="info-label">Pickup Date:</span>
                        <span class="info-value" id="summary-pickup">${defaultDate} 12:00</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Payment Method:</span>
                        <span class="info-value" id="summary-payment">Cash On Pickup</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Status:</span>
                        <span class="info-value status-pending">Pending</span>
                    </div>
                </div>
                <div class="order-total right-total">
                    <span class="total-label">Total:</span>
                    <span class="total-value">₱${subtotal.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;
    
    checkoutContent.innerHTML = leftColumnHtml + rightColumnHtml;
    if (checkoutActions) checkoutActions.style.display = 'flex';
    
    setupCheckoutEventListeners(defaultDate);
    
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        const newBtn = placeOrderBtn.cloneNode(true);
        placeOrderBtn.parentNode.replaceChild(newBtn, placeOrderBtn);
        newBtn.addEventListener('click', () => placeOrder(items, subtotal));
    }
}

function setupCheckoutEventListeners(defaultDate) {
    const pickupDate = document.getElementById('pickup-date');
    const pickupTime = document.getElementById('pickup-time');
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const summaryPickup = document.getElementById('summary-pickup');
    const summaryPayment = document.getElementById('summary-payment');
    
    if (pickupDate && pickupTime) {
        const updatePickupSummary = () => {
            const date = pickupDate.value || defaultDate;
            const time = pickupTime.value || '12:00';
            if (summaryPickup) summaryPickup.textContent = `${date} ${time}`;
        };
        pickupDate.addEventListener('change', updatePickupSummary);
        pickupTime.addEventListener('change', updatePickupSummary);
    }
    
    if (paymentRadios.length && summaryPayment) {
        paymentRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked) summaryPayment.textContent = this.value;
            });
        });
    }
}

async function placeOrder(items, subtotal) {
    const selectedPayment = document.querySelector('input[name="payment"]:checked')?.value || 'Cash On Pickup';
    const date = document.getElementById('pickup-date')?.value || '';
    const time = document.getElementById('pickup-time')?.value || '12:00';
    
    const userData = localStorage.getItem('userData');
    const user = userData ? JSON.parse(userData) : null;
    
    const orderData = {
        items: items,
        total: subtotal,
        orderDate: new Date().toISOString(),
        orderNumber: 'OR-' + Math.floor(1000 + Math.random() * 9000),
        paymentMethod: selectedPayment,
        pickupDateTime: `${date} ${time}`,
        status: 'Pending',
        customerName: user?.name || user?.username || 'Guest',
        customerEmail: user?.email || 'guest@example.com',
        customerUsername: user?.username || 'guest',
        customerPhone: user?.phone || 'Not provided'
    };
    
    try {
        const { getFirestore, collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
        
        const firebaseConfig = {
            apiKey: "AIzaSyDmgqAxUzxgJqvYLPNoATqA3hBLYla2PR0",
            authDomain: "jangsukoreanstore-12ba2.firebaseapp.com",
            projectId: "jangsukoreanstore-12ba2",
            storageBucket: "jangsukoreanstore-12ba2.firebasestorage.app",
            messagingSenderId: "935502137643",
            appId: "1:935502137643:web:454fc81b20e3c1b5ae9d6e"
        };
        
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        await addDoc(collection(db, "orders"), orderData);
        console.log("Order saved to Firebase");
        alert(`✅ Order placed successfully! Your order number is ${orderData.orderNumber}\n\nAdmin will contact you at ${orderData.customerPhone} for confirmation.`);
        
    } catch (error) {
        console.error("Error saving order:", error);
        alert("Error placing order. Please try again.");
        return;
    }
    
    sessionStorage.setItem('orderData', JSON.stringify(orderData));
    
    // Clear cart
    cart = [];
    localStorage.removeItem('shoppingCart');
    updateCartBadge();
    updateCartSidebar();
    
    window.location.href = 'order-confirm.html';
}

function loadOrderConfirmation() {
    const orderData = sessionStorage.getItem('orderData');
    const orderContainer = document.getElementById('order-items-container');
    const totalElement = document.getElementById('total-amount');
    const orderRefElement = document.getElementById('order-reference');
    const pickupDateElement = document.getElementById('pickup-date');
    const paymentMethodElement = document.getElementById('payment-method');
    
    if (!orderContainer) return;
    
    if (!orderData) {
        orderContainer.innerHTML = `<div class="empty-order"><p>No order found!</p><a href="products.html">Browse Products</a></div>`;
        return;
    }
    
    const data = JSON.parse(orderData);
    const items = data.items || [];
    const total = data.total || 0;
    const orderNumber = data.orderNumber;
    const orderDate = data.orderDate ? new Date(data.orderDate) : new Date();
    const paymentMethod = data.paymentMethod || 'Cash On Pickup';
    const pickupDateTime = data.pickupDateTime || '';
    
    const formattedDate = orderDate.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    if (orderRefElement) {
        orderRefElement.innerHTML = `<p><strong>Order #: ${orderNumber}</strong></p><p class="order-date">${formattedDate}</p>`;
    }
    if (paymentMethodElement) paymentMethodElement.textContent = paymentMethod;
    if (pickupDateElement) pickupDateElement.textContent = pickupDateTime || 'To be confirmed';
    
    if (items.length === 0) {
        orderContainer.innerHTML = `<div class="empty-order"><p>No items in this order!</p></div>`;
        if (totalElement) totalElement.innerHTML = '<strong>₱0.00</strong>';
        return;
    }
    
    let itemsHtml = '';
    items.forEach(item => {
        itemsHtml += `
            <div class="order-item-row">
                <div class="order-item-info">
                    <img src="${item.image}" class="order-item-image" onerror="this.src='images/default.jpg'">
                    <span class="order-item-name">${escapeHtml(item.name)}</span>
                </div>
                <div class="order-item-details">
                    <span class="order-item-price">₱${item.price.toFixed(2)}</span>
                    <span class="order-item-quantity">${item.quantity}x</span>
                </div>
            </div>
        `;
    });
    
    orderContainer.innerHTML = itemsHtml;
    if (totalElement) totalElement.innerHTML = `<strong>₱${total.toFixed(2)}</strong>`;
}

window.addToCart = function(product, quantity = 1) {
    const existing = cart.find(item => item.id == product.id);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image || 'images/default.jpg',
            quantity: quantity
        });
    }
    saveCart();
    alert(`Added ${quantity} x ${product.name} to cart!`);
    openCart();
};

window.getCart = () => cart;