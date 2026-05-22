/**
 * user-system.js - Complete with working phone number
 */

// ===== SAMPLE ORDER DATA =====
var ordersData = [
    { reference: '#123654', date: 'March 20, 2026', pickup: 'March 20, 2026', status: 'completed', statusText: 'Completed', statusIcon: '☑️' },
    { reference: '#123638', date: 'April 9, 2026', pickup: 'April 9, 2026', status: 'pickup', statusText: 'Ready for Pickup', statusIcon: '✅' }
];

// ===== BEST SELLER DATA =====
var bestSellerData = [
    { id: 7, name: "Buldak Ramen", price: 120.00, image: "images/noodles.jpg", category: "noodles" },
    { id: 1, name: "Milk Drink", price: 95.00, image: "images/drinks.jpg", category: "drinks" },
    { id: 3, name: "Pepero", price: 50.00, image: "images/snacks.jpg", category: "snacks" },
    { id: 4, name: "Ice Cream", price: 45.00, image: "images/ice-cream.jpg", category: "dessert" }
];

// ===== USER SYSTEM INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('User system initializing');
    
    initCustomerMobileMenu();
    
    var isLoggedIn = isUserLoggedIn();
    var path = window.location.pathname;
    
    if (path.includes('products.html')) {
        initProductsPage();
    }
    if (path.includes('user-login.html')) {
        initLoginForm();
    }
    if (path.includes('user-signup.html')) {
        initSignupForm();
    }
    if (path.includes('user-profile.html')) {
        if (!isLoggedIn) {
            redirectToLogin('Please log in to view your profile');
            return;
        }
        loadUserProfileData();
        initProfileTabs();
        loadOrdersTable();
        initSearchAndFilter();
        initProfileLogout();
        initEditProfileModal();
    }
    if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        renderBestSellers();
    }
    
    initProfileDropdown(isLoggedIn);
    updateProfileIcon();
    initProtectedActions();
});

// ===== MOBILE HAMBURGER MENU =====
function initCustomerMobileMenu() {
    if (document.querySelector('.mobile-menu-toggle')) return;
    
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'mobile-menu-toggle';
    toggleBtn.innerHTML = '☰';
    document.body.appendChild(toggleBtn);
    
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    document.body.appendChild(overlay);
    
    const isLoggedIn = isUserLoggedIn();
    
    let loginLogoutLink = '';
    
    if (isLoggedIn) {
        loginLogoutLink = `<a href="#" class="mobile-nav-item" id="mobile-logout-btn"><span class="mobile-nav-text">Logout</span></a>`;
    } else {
        loginLogoutLink = `<a href="user-login.html" class="mobile-nav-item"><span class="mobile-nav-text">Login / Sign Up</span></a>`;
    }
    
    const mobileSidebar = document.createElement('div');
    mobileSidebar.className = 'mobile-sidebar';
    mobileSidebar.innerHTML = `
        <div class="mobile-sidebar-header">
            <h3>Jangsu Korean Store</h3>
            <button class="close-mobile-menu">✕</button>
        </div>
        <nav class="mobile-nav">
            <a href="index.html" class="mobile-nav-item"><span class="mobile-nav-text">Home</span></a>
            <a href="products.html" class="mobile-nav-item"><span class="mobile-nav-text">Products</span></a>
            <a href="about-us.html" class="mobile-nav-item"><span class="mobile-nav-text">About Us</span></a>
            ${loginLogoutLink}
        </nav>
    `;
    document.body.appendChild(mobileSidebar);
    
    function openMenu() {
        mobileSidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeMenu() {
        mobileSidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    toggleBtn.addEventListener('click', openMenu);
    overlay.addEventListener('click', closeMenu);
    document.querySelector('.close-mobile-menu')?.addEventListener('click', closeMenu);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileSidebar.classList.contains('open')) closeMenu();
    });
    
    const currentPath = window.location.pathname;
    document.querySelectorAll('.mobile-nav-item').forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href)) link.classList.add('active');
        if (href === 'index.html' && (currentPath === '/' || currentPath === '/index.html')) link.classList.add('active');
    });
    
    document.getElementById('mobile-logout-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to log out?')) {
            clearUserData();
            alert('You have been successfully logged out!');
            window.location.href = 'index.html';
        }
    });
}

// ===== RENDER BEST SELLERS =====
function renderBestSellers() {
    var container = document.getElementById('best-seller-grid');
    if (!container) return;
    
    var html = '';
    for (var i = 0; i < bestSellerData.length; i++) {
        var product = bestSellerData[i];
        html += `
            <div class="best-seller-card" onclick="location.href='order.html?product=${product.id}';">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='images/default.jpg'">
                <h3>${product.name}</h3>
                <p class="price">₱${product.price.toFixed(2)}</p>
                <button class="btn-small" onclick="event.stopPropagation(); addToCartFromProducts(${product.id}, '${product.name}', ${product.price}, '${product.image}')">Add to Cart</button>
            </div>
        `;
    }
    container.innerHTML = html;
}

// ===== USER DATA MANAGEMENT =====
function getCurrentUser() {
    var userData = localStorage.getItem('userData');
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (e) {
            return null;
        }
    }
    return null;
}

function isUserLoggedIn() {
    return localStorage.getItem('userLoggedIn') === 'true' && getCurrentUser() !== null;
}

function saveUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userLoggedIn', 'true');
    updateProfileIcon();
}

function clearUserData() {
    localStorage.removeItem('userData');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('redirectAfterLogin');
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('loginMessage');
    updateProfileIcon();
    updateCartBadge();
}

window.logoutUser = function() {
    if (confirm('Are you sure you want to log out?')) {
        clearUserData();
        alert('You have been successfully logged out!');
        window.location.href = 'index.html';
    }
};

function redirectToLogin(message) {
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    if (message) localStorage.setItem('loginMessage', message);
    window.location.href = 'user-login.html';
}

function handlePostLoginRedirect() {
    var redirectUrl = localStorage.getItem('redirectAfterLogin');
    var message = localStorage.getItem('loginMessage');
    localStorage.removeItem('redirectAfterLogin');
    localStorage.removeItem('loginMessage');
    if (message) alert(message);
    if (redirectUrl && redirectUrl !== '/user-login.html' && redirectUrl !== '/user-signup.html') {
        window.location.href = redirectUrl;
    } else {
        window.location.href = 'index.html';
    }
}

// ===== LOGIN FUNCTION =====
function initLoginForm() {
    var loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    
    var loginMessage = localStorage.getItem('loginMessage');
    if (loginMessage) {
        alert(loginMessage);
        localStorage.removeItem('loginMessage');
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        
        if (!username || !password) {
            showLoginMessage('Please enter both username and password', 'error');
            return;
        }
        
        // Admin login
        if (password.toLowerCase().includes('adminjangsu')) {
            var adminData = {
                username: username,
                name: username,
                initials: username.substring(0, 2).toUpperCase(),
                email: 'admin@jangsu.com',
                phone: '+63 XXX XXX XXXX',
                role: 'admin'
            };
            localStorage.setItem('userData', JSON.stringify(adminData));
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userRole', 'admin');
            localStorage.setItem('adminLoggedIn', 'true');
            showLoginMessage('✓ Admin login successful!', 'success');
            setTimeout(function() { window.location.href = 'admin-dashboard.html'; }, 1500);
            return;
        }
        
        // Regular user login
        var existingUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
        var foundUser = null;
        for (var i = 0; i < existingUsers.length; i++) {
            if (existingUsers[i].username === username && existingUsers[i].password === password) {
                foundUser = existingUsers[i];
                break;
            }
        }
        
        if (foundUser) {
            saveUserData(foundUser.userData);
            localStorage.setItem('userRole', 'user');
            localStorage.removeItem('adminLoggedIn');
            showLoginMessage('✓ Welcome back, ' + username + '!', 'success');
            setTimeout(function() { handlePostLoginRedirect(); }, 1500);
        } else {
            var userExists = existingUsers.some(function(u) { return u.username === username; });
            if (userExists) {
                showLoginMessage('Incorrect password. Please try again.', 'error');
            } else {
                showLoginMessage('Account not found. Please sign up first.', 'error');
            }
        }
    });
}

// ===== SIGNUP FUNCTION =====
function initSignupForm() {
    var signupForm = document.getElementById('signup-form');
    if (!signupForm) return;
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        var email = document.getElementById('email').value;
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        var phone = document.getElementById('phone')?.value || '';
        
        if (!email || !username || !password) {
            showLoginMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (!phone || phone === '') {
            showLoginMessage('Please enter your phone number', 'error');
            return;
        }
        
        if (password.length < 6) {
            showLoginMessage('Password must be at least 6 characters long', 'error');
            return;
        }
        
        var existingUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
        var userExists = existingUsers.some(function(u) { 
            return u.username === username || u.email === email; 
        });
        
        if (userExists) {
            showLoginMessage('Username or email already exists.', 'error');
            return;
        }
        
        var newUser = {
            email: email,
            username: username,
            name: username,
            initials: username.substring(0, 2).toUpperCase(),
            phone: phone,
            role: 'user',
            createdAt: new Date().toISOString()
        };
        
        existingUsers.push({
            username: username,
            email: email,
            password: password,
            userData: newUser
        });
        localStorage.setItem('allUsers', JSON.stringify(existingUsers));
        
        saveUserData(newUser);
        localStorage.setItem('userRole', 'user');
        localStorage.removeItem('adminLoggedIn');
        
        showLoginMessage('✓ Sign up successful! Welcome ' + username + '!', 'success');
        
        document.getElementById('email').value = '';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        if (document.getElementById('phone')) document.getElementById('phone').value = '';
        
        setTimeout(function() { window.location.href = 'index.html'; }, 1500);
    });
}

// ===== PROFILE PAGE =====
let currentUser = null;
let allUsers = [];

function loadUserProfileData() {
    currentUser = getCurrentUser();
    if (!currentUser) {
        redirectToLogin('Please log in to view your profile');
        return;
    }
    
    allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    
    document.getElementById('profile-name').textContent = currentUser.name || currentUser.username;
    document.getElementById('profile-username').textContent = currentUser.username || 'User';
    document.getElementById('profile-email').textContent = currentUser.email || 'user@example.com';
    document.getElementById('profile-phone').textContent = currentUser.phone || 'Not provided';
    document.getElementById('profile-since').textContent = currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Just joined';
}

function initEditProfileModal() {
    document.getElementById('edit-details-btn')?.addEventListener('click', openEditModal);
    document.getElementById('save-profile-changes')?.addEventListener('click', saveProfileChanges);
    document.getElementById('close-modal')?.addEventListener('click', closeModal);
    
    document.getElementById('edit-modal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

function openEditModal() {
    document.getElementById('edit-email').value = currentUser.email || '';
    document.getElementById('edit-phone').value = currentUser.phone || '';
    document.getElementById('edit-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('edit-modal').classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
}

function saveProfileChanges() {
    const newEmail = document.getElementById('edit-email').value;
    const newPhone = document.getElementById('edit-phone').value;
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    const userIndex = allUsers.findIndex(u => u.username === currentUser.username);
    
    if (userIndex === -1) {
        alert('User not found');
        return;
    }
    
    if (newPassword || confirmPassword) {
        if (allUsers[userIndex].password !== currentPassword) {
            alert('Current password is incorrect');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        if (newPassword.length < 6 && newPassword.length > 0) {
            alert('New password must be at least 6 characters');
            return;
        }
    }
    
    if (newEmail) {
        allUsers[userIndex].userData.email = newEmail;
        currentUser.email = newEmail;
    }
    if (newPhone) {
        allUsers[userIndex].userData.phone = newPhone;
        currentUser.phone = newPhone;
    }
    if (newPassword) allUsers[userIndex].password = newPassword;
    
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
    localStorage.setItem('userData', JSON.stringify(currentUser));
    
    alert('Profile updated successfully!');
    closeModal();
    loadUserProfileData();
}

function initProfileLogout() {
    var logoutBtn = document.getElementById('profile-logout-btn');
    if (logoutBtn) {
        var newBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.logoutUser();
        });
    }
}

function initProfileTabs() {
    var tabs = document.querySelectorAll('.tab-btn');
    var contents = document.querySelectorAll('.tab-content');
    
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', function() {
            var tabId = this.getAttribute('data-tab');
            for (var j = 0; j < tabs.length; j++) tabs[j].classList.remove('active');
            for (var k = 0; k < contents.length; k++) contents[k].classList.remove('active');
            this.classList.add('active');
            document.getElementById(tabId + '-tab').classList.add('active');
            if (tabId === 'orders') loadOrdersTable();
        });
    }
}

function loadOrdersTable(filter) {
    filter = filter || 'all';
    var tbody = document.getElementById('orders-table-body');
    if (!tbody) return;
    
    var filteredOrders = ordersData;
    if (filter !== 'all') {
        filteredOrders = ordersData.filter(function(o) { return o.status === filter; });
    }
    
    var html = '';
    for (var i = 0; i < filteredOrders.length; i++) {
        var order = filteredOrders[i];
        html += '<tr>';
        html += '<td>' + order.reference + '</td>';
        html += '<td>' + order.date + '</td>';
        html += '<td>' + order.pickup + '</td>';
        html += '<td><span class="status-badge status-' + order.status + '">' + order.statusIcon + ' ' + order.statusText + '</span></td>';
        html += '<td><a href="order-detail.html?ref=' + order.reference + '" class="view-details-link">View Details</a></td>';
        html += '</tr>';
    }
    
    if (filteredOrders.length === 0) {
        html = '<tr><td colspan="5" class="no-orders">No orders found</td></tr>';
    }
    tbody.innerHTML = html;
}

function initSearchAndFilter() {
    var searchInput = document.getElementById('order-search');
    var filterSelect = document.getElementById('order-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterAndSearchOrders(filterSelect?.value || 'all', searchInput.value.toLowerCase());
        });
    }
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            filterAndSearchOrders(filterSelect.value, searchInput?.value.toLowerCase() || '');
        });
    }
}

function filterAndSearchOrders(filter, searchTerm) {
    var filteredOrders = ordersData;
    if (filter !== 'all') {
        filteredOrders = ordersData.filter(function(o) { return o.status === filter; });
    }
    if (searchTerm) {
        filteredOrders = filteredOrders.filter(function(o) { 
            return o.reference.toLowerCase().includes(searchTerm); 
        });
    }
    
    var tbody = document.getElementById('orders-table-body');
    if (!tbody) return;
    
    var html = '';
    for (var i = 0; i < filteredOrders.length; i++) {
        var order = filteredOrders[i];
        html += '<tr>';
        html += '<td>' + order.reference + '</td>';
        html += '<td>' + order.date + '</td>';
        html += '<td>' + order.pickup + '</td>';
        html += '<td><span class="status-badge status-' + order.status + '">' + order.statusIcon + ' ' + order.statusText + '</span></td>';
        html += '<td><a href="order-detail.html?ref=' + order.reference + '" class="view-details-link">View Details</a></td>';
        html += '</tr>';
    }
    if (filteredOrders.length === 0) {
        html = '<tr><td colspan="5" class="no-orders">No orders found</td></tr>';
    }
    tbody.innerHTML = html;
}

// ===== PRODUCTS PAGE =====
function initProductsPage() {
    var categorySelect = document.getElementById('category');
    var urlParams = new URLSearchParams(window.location.search);
    var urlCategory = urlParams.get('category') || 'all';
    
    if (categorySelect && urlCategory !== 'all') categorySelect.value = urlCategory;
    renderProducts(urlCategory);
    
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            var selectedCategory = this.value;
            var newUrl = new URL(window.location);
            newUrl.searchParams.set('category', selectedCategory);
            window.history.pushState({}, '', newUrl);
            renderProducts(selectedCategory);
        });
    }
}

function renderProducts(category) {
    var container = document.getElementById('products-container');
    if (!container) return;
    
    if (typeof window.loadProductsFromFirebase === 'function') {
        window.loadProductsFromFirebase();
        return;
    }
    
    var products = JSON.parse(localStorage.getItem('products') || '[]');
    if (products.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 50px;">No products available.</div>';
        return;
    }
    
    var filteredProducts = products;
    if (category !== 'all') {
        filteredProducts = products.filter(function(p) { return p.category === category; });
    }
    
    if (filteredProducts.length === 0) {
        container.innerHTML = '<div class="no-products">No products found in this category.</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filteredProducts.length; i++) {
        var product = filteredProducts[i];
        html += '<div class="product-card" onclick="location.href=\'order.html?product=' + product.id + '\';">';
        html += '<img src="' + (product.image || 'images/default.jpg') + '" alt="' + product.name + '" onerror="this.src=\'images/default.jpg\'">';
        html += '<h3>' + product.name + '</h3>';
        html += '<p class="price">₱' + (product.price || 0).toFixed(2) + '</p>';
        html += '<button class="btn-small view-product" onclick="event.stopPropagation(); location.href=\'order.html?product=' + product.id + '\'">View Product</button>';
        html += '</div>';
    }
    container.innerHTML = html;
}

// ===== PROFILE DROPDOWN =====
function initProfileDropdown(isLoggedIn) {
    var dropdownToggle = document.getElementById('dropdown-toggle');
    var dropdownMenu = document.getElementById('dropdown-menu');
    
    if (!isLoggedIn) {
        if (dropdownToggle) dropdownToggle.style.display = 'none';
        if (dropdownMenu) dropdownMenu.classList.remove('show');
        return;
    }
    
    if (dropdownToggle) {
        dropdownToggle.style.display = 'flex';
        var newToggle = dropdownToggle.cloneNode(true);
        dropdownToggle.parentNode.replaceChild(newToggle, dropdownToggle);
        newToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var menu = document.getElementById('dropdown-menu');
            if (menu) menu.classList.toggle('show');
        });
        document.addEventListener('click', function(e) {
            var toggle = document.getElementById('dropdown-toggle');
            var menu = document.getElementById('dropdown-menu');
            if (toggle && menu && !toggle.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('show');
            }
        });
    }
    
    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        var newBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.logoutUser();
        });
    }
}

// ===== PROTECTED ACTIONS =====
function initProtectedActions() {
    var viewOrderBtn = document.getElementById('view-order-btn');
    if (viewOrderBtn) {
        viewOrderBtn.addEventListener('click', function(e) {
            if (!isUserLoggedIn()) {
                e.preventDefault();
                redirectToLogin('Please log in or sign up to proceed to checkout');
                return false;
            }
            return true;
        });
    }
}

// ===== CART FUNCTIONS =====
function updateProfileIcon() {
    var profileAvatars = document.querySelectorAll('.profile-avatar');
    var user = getCurrentUser();
    if (profileAvatars.length > 0) {
        var initials = user ? (user.initials || user.username.substring(0, 2).toUpperCase()) : '';
        for (var i = 0; i < profileAvatars.length; i++) {
            profileAvatars[i].textContent = initials;
        }
    }
}

function updateCartBadge() {
    var cart = localStorage.getItem('shoppingCart');
    var cartItems = cart ? JSON.parse(cart) : [];
    var totalItems = 0;
    for (var i = 0; i < cartItems.length; i++) {
        totalItems += cartItems[i].quantity;
    }
    var badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function addToCartFromProducts(id, name, price, image) {
    var cart = localStorage.getItem('shoppingCart');
    var cartItems = cart ? JSON.parse(cart) : [];
    var existing = cartItems.find(function(item) { return item.id == id; });
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cartItems.push({ id: id, name: name, price: price, image: image, quantity: 1 });
    }
    localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
    alert('Added ' + name + ' to cart!');
    updateCartBadge();
}

function showLoginMessage(message, type) {
    var existingMessage = document.querySelector('.login-message');
    if (existingMessage) existingMessage.remove();
    
    var messageDiv = document.createElement('div');
    messageDiv.className = 'login-message';
    messageDiv.textContent = message;
    messageDiv.style.cssText = 'padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; font-weight: 500; text-align: center;';
    messageDiv.style.backgroundColor = type === 'error' ? '#f8d7da' : '#d4edda';
    messageDiv.style.color = type === 'error' ? '#721c24' : '#155724';
    
    var form = document.getElementById('login-form') || document.getElementById('signup-form');
    if (form) form.insertAdjacentElement('beforebegin', messageDiv);
    
    setTimeout(function() { if (messageDiv && messageDiv.remove) messageDiv.remove(); }, 3000);
}

// ===== FIREBASE PRODUCT LOADER =====
window.loadProductsFromFirebase = async function() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align: center; padding: 50px;">Loading products...</div>';
    
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
        const { getFirestore, collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        
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
        
        const querySnapshot = await getDocs(collection(db, "products"));
        const products = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        
        const categorySelect = document.getElementById('category');
        const selectedCategory = categorySelect ? categorySelect.value : 'all';
        
        let filteredProducts = products;
        if (selectedCategory !== 'all') {
            filteredProducts = products.filter(p => p.category === selectedCategory);
        }
        
        if (filteredProducts.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 50px;">No products found.</div>';
            return;
        }
        
        let html = '';
        for (const product of filteredProducts) {
            if (product.status !== 'Active') continue;
            const imageUrl = product.image || 'images/default.jpg';
            html += `
                <div class="product-card" onclick="location.href='order.html?product=${product.id}'">
                    <img src="${imageUrl}" alt="${product.name}" onerror="this.src='images/default.jpg'">
                    <h3>${escapeHtml(product.name)}</h3>
                    <p class="price">₱${(product.price || 0).toFixed(2)}</p>
                    <button class="btn-small view-product" onclick="event.stopPropagation(); location.href='order.html?product=${product.id}'">View Product</button>
                </div>
            `;
        }
        container.innerHTML = html;
    } catch (error) {
        console.error("Error loading products:", error);
        container.innerHTML = '<div style="text-align: center; padding: 50px; color: red;">Error loading products</div>';
    }
};

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Auto-initialize based on page
if (document.getElementById('products-container')) {
    window.loadProductsFromFirebase();
    document.getElementById('category')?.addEventListener('change', window.loadProductsFromFirebase);
}

if (document.getElementById('order-product-title')) {
    (async function() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('product');
        if (!productId) return;
        
        try {
            const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
            const { getFirestore, doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
            
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
            const productRef = doc(db, "products", productId);
            const productSnap = await getDoc(productRef);
            
            if (productSnap.exists()) {
                const product = productSnap.data();
                document.getElementById('order-product-title').textContent = product.name || 'Product';
                document.getElementById('order-product-price').textContent = `₱${(product.price || 0).toFixed(2)}`;
                document.getElementById('order-product-category').textContent = product.category || 'General';
                document.getElementById('order-product-description').textContent = product.description || `${product.name} - Premium Korean product`;
                document.getElementById('order-product-full-desc').textContent = product.fullDesc || `Experience the authentic taste of ${product.name}.`;
                const imageEl = document.getElementById('order-product-image');
                if (imageEl) {
                    imageEl.src = product.image || 'images/default.jpg';
                    imageEl.alt = product.name;
                }
                window.currentProduct = {
                    id: productId,
                    name: product.name,
                    price: product.price,
                    image: product.image || 'images/default.jpg'
                };
            }
        } catch (error) {
            console.error("Error loading product:", error);
        }
    })();
}

// ===== EXPOSE FUNCTIONS =====
window.isUserLoggedIn = isUserLoggedIn;
window.showLoginMessage = showLoginMessage;
window.addToCartFromProducts = addToCartFromProducts;
window.updateCartBadge = updateCartBadge;
window.logoutUser = logoutUser;
window.clearUserData = clearUserData;

// ===== FIREBASE AUTH HELPER FUNCTIONS =====

// Check if current user's email is verified
window.isEmailVerified = async function() {
    const { auth } = await import('./firebase-config.js');
    const user = auth.currentUser;
    if (user) {
        await user.reload();
        return user.emailVerified;
    }
    return false;
};

// Get current Firebase user
window.getCurrentFirebaseUser = async function() {
    const { auth } = await import('./firebase-config.js');
    return auth.currentUser;
};

// Sign out from Firebase
window.firebaseLogout = async function() {
    const { auth, signOut } = await import('./firebase-config.js');
    try {
        await signOut(auth);
        console.log("Firebase sign out successful");
    } catch (error) {
        console.error("Firebase sign out error:", error);
    }
};

// Update the logout function to also sign out from Firebase
const originalLogoutUser = window.logoutUser;
window.logoutUser = function() {
    if (confirm('Are you sure you want to log out?')) {
        // Sign out from Firebase
        import('./firebase-config.js').then(({ signOut, auth }) => {
            signOut(auth).catch(console.error);
        });
        // Clear local data
        clearUserData();
        alert('You have been successfully logged out!');
        window.location.href = 'index.html';
    }
};
