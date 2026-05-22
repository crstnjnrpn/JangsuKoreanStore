// ===== admin-system.js - COMPLETE WITH STOCK LIMIT (MAX 50) =====
console.log("1. admin-system.js starting to load...");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

console.log("2. Firebase modules imported");

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
const storage = getStorage(app);

console.log("3. Firebase initialized successfully");

// Admin stock quantity limit - MAX 50
const MAX_ADMIN_STOCK = 50;

// ===== MOBILE HAMBURGER MENU FOR ADMIN =====
function initAdminMobileMenu() {
    if (document.querySelector('.admin-mobile-menu-toggle')) return;
    
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'admin-mobile-menu-toggle';
    toggleBtn.innerHTML = '☰';
    document.body.appendChild(toggleBtn);
    
    const overlay = document.createElement('div');
    overlay.className = 'admin-mobile-overlay';
    document.body.appendChild(overlay);
    
    const sidebarNav = sidebar.querySelector('.sidebar-nav');
    
    const mobileSidebar = document.createElement('div');
    mobileSidebar.className = 'admin-mobile-sidebar';
    mobileSidebar.innerHTML = `
        <div class="admin-mobile-sidebar-header">
            <h3>Admin Dashboard</h3>
            <button class="admin-close-mobile-menu">✕</button>
        </div>
        <div class="admin-mobile-nav">
            ${sidebarNav ? sidebarNav.innerHTML : ''}
        </div>
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
    
    const closeBtn = document.querySelector('.admin-close-mobile-menu');
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileSidebar.classList.contains('open')) {
            closeMenu();
        }
    });
    
    const currentPath = window.location.pathname;
    document.querySelectorAll('.admin-mobile-nav .nav-item').forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href)) {
            link.classList.add('active');
        }
    });
    
    const mobileLogoutBtn = document.querySelector('.admin-mobile-nav #admin-sidebar-logout, .admin-mobile-nav a[href="#"]');
    if (mobileLogoutBtn && mobileLogoutBtn.getAttribute('href') === '#') {
        mobileLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('userData');
                localStorage.removeItem('userLoggedIn');
                localStorage.removeItem('userRole');
                localStorage.removeItem('adminLoggedIn');
                window.location.href = 'index.html';
            }
        });
    }
}

// ===== DISPLAY ADMIN NAME =====
function displayAdminName() {
    const userData = localStorage.getItem('userData');
    const adminUser = userData ? JSON.parse(userData) : null;
    const adminNameElements = document.querySelectorAll('.admin-name');
    const adminNameDisplay = document.getElementById('admin-name-display');
    
    const nameToShow = adminUser?.name || adminUser?.username || 'Admin';
    
    adminNameElements.forEach(el => {
        if (el) el.textContent = nameToShow;
    });
    if (adminNameDisplay) adminNameDisplay.textContent = nameToShow;
}

// ===== ADD PRODUCT PAGE WITH STOCK LIMIT =====
function initAddProductPage() {
    console.log("Initializing Add Product Page");
    
    const stockInput = document.getElementById('stock-quantity');
    if (stockInput) {
        stockInput.max = MAX_ADMIN_STOCK;
        stockInput.addEventListener('input', function() {
            let val = parseInt(this.value);
            if (val > MAX_ADMIN_STOCK) {
                this.value = MAX_ADMIN_STOCK;
                alert(`Maximum stock limit is ${MAX_ADMIN_STOCK}`);
            }
        });
    }
    
    const form = document.getElementById('add-product-form');
    if (form) {
        form.onsubmit = async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('product-name').value.trim();
            const price = document.getElementById('product-price').value;
            let stock = parseInt(document.getElementById('stock-quantity').value);
            const threshold = document.getElementById('low-stock-threshold').value;
            const category = document.getElementById('product-category').value;
            const imageUrl = document.getElementById('product-image-url')?.value.trim() || '';
            const description = document.getElementById('product-description')?.value.trim() || '';
            const fullDesc = document.getElementById('product-full-desc')?.value.trim() || '';
            
            if (!name) {
                alert("Please enter product name");
                return;
            }
            if (!price || parseFloat(price) <= 0) {
                alert("Please enter a valid price");
                return;
            }
            if (isNaN(stock) || stock < 0) {
                alert("Please enter valid stock quantity");
                return;
            }
            
            // Enforce max stock limit
            if (stock > MAX_ADMIN_STOCK) {
                stock = MAX_ADMIN_STOCK;
                alert(`Stock capped at maximum of ${MAX_ADMIN_STOCK}`);
            }
            
            if (!category) {
                alert("Please select category");
                return;
            }
            
            let finalImageUrl = imageUrl;
            if (!finalImageUrl) {
                switch(category.toLowerCase()) {
                    case 'drinks':
                        finalImageUrl = 'images/drinks.jpg';
                        break;
                    case 'ramen':
                        finalImageUrl = 'images/noodles.jpg';
                        break;
                    case 'snacks':
                        finalImageUrl = 'images/snacks.jpg';
                        break;
                    default:
                        finalImageUrl = 'images/default.jpg';
                }
            }
            
            alert("Saving product...");
            
            try {
                const productData = {
                    name: name,
                    price: parseFloat(price),
                    category: category,
                    currentStock: stock,
                    reservedStock: 0,
                    status: stock > 0 ? 'Active' : 'Inactive',
                    lowStockThreshold: parseInt(threshold) || 5,
                    image: finalImageUrl,
                    description: description,
                    fullDesc: fullDesc,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                await addDoc(collection(db, "products"), productData);
                console.log("Product saved");
                
                alert("✅ Product added successfully!");
                form.reset();
                window.location.href = 'admin-product.html';
                
            } catch (error) {
                console.error("Error:", error);
                alert("Error: " + error.message);
            }
        };
    }
}

// ===== PRODUCT LIST PAGE =====
async function initProductListPage() {
    console.log("Initializing Product List Page");
    
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;
    
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const products = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        
        console.log("Products loaded:", products.length);
        
        if (products.length === 0) {
            tableBody.innerHTML = `<div class="empty-table-message">No products found. Click "Add Product" to create one.</div>`;
            return;
        }
        
        let html = '';
        for (const product of products) {
            const availableStock = (product.currentStock || 0) - (product.reservedStock || 0);
            html += `
                <div class="table-row data-row">
                    <div class="table-cell product-image-col" data-label="Product Image">
                        <img src="${product.image || 'images/default.jpg'}" style="width:50px; height:50px; object-fit:cover; border-radius:8px;" onerror="this.src='images/default.jpg'">
                    </div>
                    <div class="table-cell product-name-col" data-label="Product Name">${escapeHtml(product.name || '')}</div>
                    <div class="table-cell category-col" data-label="Category">${escapeHtml(product.category || '')}</div>
                    <div class="table-cell price-col" data-label="Price">₱ ${(product.price || 0).toFixed(2)}</div>
                    <div class="table-cell stock-col" data-label="Stock">${product.currentStock || 0}</div>
                    <div class="table-cell reserved-col" data-label="Reserved">${product.reservedStock || 0}</div>
                    <div class="table-cell stock-col" data-label="Available">${availableStock}</div>
                    <div class="table-cell status-col" data-label="Status">
                        <span class="status-badge ${product.status === 'Active' ? 'active' : 'inactive'}">${product.status || 'Inactive'}</span>
                    </div>
                    <div class="table-cell actions-col" data-label="Actions">
                        <button class="edit-btn" onclick="window.editProduct('${product.id}')">✏️ Edit</button>
                        <button class="delete-btn" onclick="window.deleteProduct('${product.id}')">🗑️ Delete</button>
                    </div>
                </div>
            `;
        }
        tableBody.innerHTML = html;
        
    } catch (error) {
        console.error("Error loading products:", error);
        tableBody.innerHTML = `<div class="empty-table-message">Error: ${error.message}</div>`;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== DELETE PRODUCT =====
window.deleteProduct = async function(productId) {
    if (!confirm('Delete this product?')) return;
    
    try {
        await deleteDoc(doc(db, "products", productId));
        alert('✅ Product deleted');
        initProductListPage();
    } catch (error) {
        alert('Error: ' + error.message);
    }
};

// ===== EDIT PRODUCT =====
window.editProduct = function(productId) {
    window.location.href = `edit-product.html?id=${productId}`;
};

// ===== EDIT PRODUCT PAGE WITH STOCK LIMIT =====
async function initEditProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        alert('No product specified');
        window.location.href = 'admin-product.html';
        return;
    }
    
    try {
        const productSnap = await getDoc(doc(db, "products", productId));
        if (!productSnap.exists()) {
            alert('Product not found');
            window.location.href = 'admin-product.html';
            return;
        }
        
        const product = productSnap.data();
        
        const productIdField = document.getElementById('product-id');
        const nameField = document.getElementById('product-name');
        const priceField = document.getElementById('product-price');
        const stockField = document.getElementById('stock-quantity');
        const reservedField = document.getElementById('reserved-stock');
        const thresholdField = document.getElementById('low-stock-threshold');
        const categoryField = document.getElementById('product-category');
        const imageUrlField = document.getElementById('product-image-url');
        const descField = document.getElementById('product-description');
        const fullDescField = document.getElementById('product-full-desc');
        
        if (productIdField) productIdField.value = productId;
        if (nameField) nameField.value = product.name || '';
        if (priceField) priceField.value = product.price || 0;
        if (stockField) stockField.value = product.currentStock || 0;
        if (reservedField) reservedField.value = product.reservedStock || 0;
        if (thresholdField) thresholdField.value = product.lowStockThreshold || 5;
        if (categoryField) categoryField.value = product.category || 'Other';
        if (imageUrlField) imageUrlField.value = product.image || '';
        if (descField) descField.value = product.description || '';
        if (fullDescField) fullDescField.value = product.fullDesc || '';
        
        // Set max attribute for stock input
        if (stockField) {
            stockField.max = MAX_ADMIN_STOCK;
            stockField.addEventListener('input', function() {
                let val = parseInt(this.value);
                if (val > MAX_ADMIN_STOCK) {
                    this.value = MAX_ADMIN_STOCK;
                    alert(`Maximum stock limit is ${MAX_ADMIN_STOCK}`);
                }
            });
        }
        
        const statusValue = product.status === 'Active' ? 'Active' : 'Inactive';
        document.querySelectorAll('input[name="status"]').forEach(radio => {
            if (radio.value === statusValue) radio.checked = true;
        });
        
        if (product.image) {
            const preview = document.getElementById('image-preview');
            if (preview) {
                preview.innerHTML = `<img src="${product.image}" style="max-width:150px; border-radius:8px;" onerror="this.src='images/default.jpg'">`;
            }
        }
        
        const form = document.getElementById('edit-product-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                
                const name = nameField.value.trim();
                const price = parseFloat(priceField.value);
                let stock = parseInt(stockField.value);
                const reserved = parseInt(reservedField.value) || 0;
                const threshold = parseInt(thresholdField.value);
                const category = categoryField.value;
                const imageUrl = imageUrlField?.value.trim() || '';
                const description = descField?.value.trim() || '';
                const fullDesc = fullDescField?.value.trim() || '';
                
                if (!name || isNaN(price) || isNaN(stock) || !category) {
                    alert("Please fill all required fields");
                    return;
                }
                
                // Enforce max stock limit
                if (stock > MAX_ADMIN_STOCK) {
                    stock = MAX_ADMIN_STOCK;
                    alert(`Stock capped at maximum of ${MAX_ADMIN_STOCK}`);
                }
                
                let finalImageUrl = imageUrl;
                if (!finalImageUrl) {
                    switch(category.toLowerCase()) {
                        case 'drinks':
                            finalImageUrl = 'images/drinks.jpg';
                            break;
                        case 'ramen':
                            finalImageUrl = 'images/noodles.jpg';
                            break;
                        case 'snacks':
                            finalImageUrl = 'images/snacks.jpg';
                            break;
                        default:
                            finalImageUrl = 'images/default.jpg';
                    }
                }
                
                const availableStock = stock - reserved;
                let finalStatus = statusValue;
                if (availableStock <= 0) {
                    finalStatus = 'Inactive';
                } else if (stock > 0) {
                    finalStatus = 'Active';
                }
                
                try {
                    await updateDoc(doc(db, "products", productId), {
                        name: name,
                        price: price,
                        currentStock: stock,
                        reservedStock: reserved,
                        category: category,
                        image: finalImageUrl,
                        description: description,
                        fullDesc: fullDesc,
                        lowStockThreshold: threshold,
                        status: finalStatus,
                        updatedAt: new Date().toISOString()
                    });
                    alert('✅ Product updated successfully!');
                    window.location.href = 'admin-product.html';
                } catch (error) {
                    alert('Error: ' + error.message);
                }
            };
        }
        
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// ===== ADMIN ORDERS PAGE =====
async function loadAdminOrders() {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;
    
    try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        const orders = [];
        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        
        if (orders.length === 0) {
            tbody.innerHTML = '<div style="text-align: center; padding: 50px;">No orders yet.</div>';
            return;
        }
        
        let html = '';
        for (const order of orders) {
            html += `
                <div class="table-row data-row">
                    <div class="table-cell" data-label="Order #">${order.orderNumber || order.id.substring(0, 8)}</div>
                    <div class="table-cell" data-label="Customer">${order.customerName || 'Customer'}</div>
                    <div class="table-cell" data-label="Date">${new Date(order.orderDate).toLocaleDateString()}</div>
                    <div class="table-cell" data-label="Total">₱${(order.total || 0).toFixed(2)}</div>
                    <div class="table-cell" data-label="Status">
                        <select onchange="window.updateOrderStatus('${order.id}', this.value)" style="padding: 5px 10px; border-radius: 5px;">
                            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="Ready for Pickup" ${order.status === 'Ready for Pickup' ? 'selected' : ''}>Ready for Pickup</option>
                            <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
                            <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                    <div class="table-cell" data-label="Actions">
                        <button onclick="window.viewOrderDetail('${order.id}')" class="details-link">View</button>
                    </div>
                </div>
            `;
        }
        tbody.innerHTML = html;
    } catch (error) {
        console.error("Error loading orders:", error);
        tbody.innerHTML = '<div style="text-align: center; padding: 50px; color: red;">Error loading orders</div>';
    }
}

window.updateOrderStatus = async function(orderId, newStatus) {
    try {
        await updateDoc(doc(db, "orders", orderId), {
            status: newStatus,
            updatedAt: new Date().toISOString()
        });
        alert(`Order status updated to ${newStatus}`);
        loadAdminOrders();
    } catch (error) {
        alert("Error updating status: " + error.message);
    }
};

window.viewOrderDetail = function(orderId) {
    window.location.href = `admin-order-detail.html?id=${orderId}`;
};

// ===== ADMIN DASHBOARD FUNCTIONS =====
async function loadDashboardData() {
    console.log("Loading dashboard data...");
    
    try {
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        const orders = [];
        ordersSnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        console.log("Orders loaded:", orders.length);
        
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'Pending').length;
        const readyOrders = orders.filter(o => o.status === 'Ready for Pickup').length;
        const completedOrders = orders.filter(o => o.status === 'Completed').length;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayOrders = orders.filter(o => {
            if (!o.orderDate) return false;
            const orderDate = new Date(o.orderDate);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === today.getTime();
        });
        
        const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        
        const totalOrdersEl = document.getElementById('total-orders');
        const pendingOrdersEl = document.getElementById('pending-orders');
        const readyOrdersEl = document.getElementById('ready-orders');
        const completedOrdersEl = document.getElementById('completed-orders');
        const todayRevenueEl = document.getElementById('today-revenue');
        const lowStockCountEl = document.getElementById('low-stock-count');
        
        if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
        if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders;
        if (readyOrdersEl) readyOrdersEl.textContent = readyOrders;
        if (completedOrdersEl) completedOrdersEl.textContent = completedOrders;
        if (todayRevenueEl) todayRevenueEl.innerHTML = `₱${todayRevenue.toFixed(2)}`;
        
        const productsSnapshot = await getDocs(collection(db, "products"));
        const products = [];
        productsSnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        console.log("Products loaded:", products.length);
        
        const lowStockThreshold = 10;
        const lowStockProducts = products.filter(p => {
            const availableStock = (p.currentStock || 0) - (p.reservedStock || 0);
            return availableStock < lowStockThreshold && availableStock > 0 && p.status === 'Active';
        });
        
        if (lowStockCountEl) lowStockCountEl.textContent = lowStockProducts.length;
        
        const lowStockContainer = document.getElementById('low-stock-list');
        if (lowStockContainer) {
            if (lowStockProducts.length === 0) {
                lowStockContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #27ae60;">✅ No low stock products</div>';
            } else {
                let lowStockHtml = '';
                for (const product of lowStockProducts) {
                    const stock = (product.currentStock || 0) - (product.reservedStock || 0);
                    lowStockHtml += `
                        <div class="low-stock-item">
                            <span class="low-stock-name">${escapeHtml(product.name)}</span>
                            <span class="low-stock-stock">Stock: ${stock}</span>
                        </div>
                    `;
                }
                lowStockContainer.innerHTML = lowStockHtml;
            }
        }
        
        const todayOrdersContainer = document.getElementById('today-orders-list');
        if (todayOrdersContainer) {
            if (todayOrders.length === 0) {
                todayOrdersContainer.innerHTML = '<div style="text-align: center; padding: 20px;">No orders today</div>';
            } else {
                let todayHtml = '';
                for (const order of todayOrders) {
                    let statusClass = '';
                    switch(order.status) {
                        case 'Pending': statusClass = 'status-Pending'; break;
                        case 'Completed': statusClass = 'status-Completed'; break;
                        case 'Confirmed': statusClass = 'status-Confirmed'; break;
                        case 'Ready for Pickup': statusClass = 'status-Ready'; break;
                        case 'Cancelled': statusClass = 'status-Cancelled'; break;
                        default: statusClass = 'status-Pending';
                    }
                    todayHtml += `
                        <div class="today-order-item">
                            <div class="today-order-info">
                                <div class="today-order-number">${order.orderNumber || order.id.substring(0, 8)}</div>
                                <div class="today-order-customer">${escapeHtml(order.customerName || 'Guest')}</div>
                            </div>
                            <div class="today-order-right">
                                <div class="today-order-amount">₱${(order.total || 0).toFixed(2)}</div>
                                <div class="today-order-status ${statusClass}">${order.status || 'Pending'}</div>
                            </div>
                        </div>
                    `;
                }
                todayOrdersContainer.innerHTML = todayHtml;
            }
        }
        
    } catch (error) {
        console.error("Error loading dashboard:", error);
    }
}

// ===== ADMIN INVENTORY PAGE =====
async function loadInventory() {
    const container = document.getElementById('inventory-list');
    if (!container) return;
    
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const products = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        
        const totalProducts = products.length;
        const totalValue = products.reduce((sum, p) => sum + ((p.currentStock || 0) * (p.price || 0)), 0);
        const lowStockItems = products.filter(p => {
            const availableStock = (p.currentStock || 0) - (p.reservedStock || 0);
            return availableStock < (p.lowStockThreshold || 10);
        }).length;
        
        const totalProductsEl = document.getElementById('total-products');
        const totalValueEl = document.getElementById('total-value');
        const lowStockTotalEl = document.getElementById('low-stock-total');
        
        if (totalProductsEl) totalProductsEl.textContent = totalProducts;
        if (totalValueEl) totalValueEl.innerHTML = `₱${totalValue.toFixed(2)}`;
        if (lowStockTotalEl) lowStockTotalEl.textContent = lowStockItems;
        
        if (products.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 50px;">No products found.</div>';
            return;
        }
        
        let html = '<h1 class="inventory-main-title">Product Inventory</h1>';
        
        for (const product of products) {
            const currentStock = product.currentStock || 0;
            const reservedStock = product.reservedStock || 0;
            const availableStock = currentStock - reservedStock;
            const threshold = product.lowStockThreshold || 10;
            
            let stockStatus = '';
            let statusClass = '';
            
            if (availableStock <= 0) {
                stockStatus = 'OUT OF STOCK';
                statusClass = 'out-stock-warning';
            } else if (availableStock < threshold) {
                stockStatus = 'LOW STOCK';
                statusClass = 'low-stock-warning';
            } else {
                stockStatus = 'IN STOCK';
                statusClass = 'in-stock';
            }
            
            html += `
                <div class="inventory-card ${statusClass}">
                    <div class="inventory-field">
                        <label class="inventory-label">Product Name</label>
                        <div class="inventory-value"><strong>${escapeHtml(product.name)}</strong></div>
                    </div>
                    <div class="inventory-field">
                        <label class="inventory-label">Category</label>
                        <div class="inventory-value">${escapeHtml(product.category || 'Uncategorized')}</div>
                    </div>
                    <div class="inventory-field">
                        <label class="inventory-label">Price</label>
                        <div class="inventory-value">₱${(product.price || 0).toFixed(2)}</div>
                    </div>
                    <div class="inventory-field">
                        <label class="inventory-label">Total Stock</label>
                        <div class="inventory-value">${currentStock} / ${MAX_ADMIN_STOCK}</div>
                    </div>
                    <div class="inventory-field">
                        <label class="inventory-label">Reserved Stock</label>
                        <div class="inventory-value reserved-stock">${reservedStock} units</div>
                    </div>
                    <div class="inventory-field">
                        <label class="inventory-label">Available Stock</label>
                        <div class="inventory-value available-stock">${availableStock} units</div>
                    </div>
                    <div class="inventory-field">
                        <label class="inventory-label">Stock Status</label>
                        <div class="inventory-value">
                            <span class="status-badge ${availableStock <= 0 ? 'inactive' : (availableStock < threshold ? 'pending' : 'active')}">
                                ${stockStatus}
                            </span>
                        </div>
                    </div>
                    <div class="inventory-field">
                        <label class="inventory-label">Max Capacity</label>
                        <div class="inventory-value">${MAX_ADMIN_STOCK} units</div>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error("Error loading inventory:", error);
        container.innerHTML = '<div style="text-align: center; padding: 50px; color: red;">Error loading inventory</div>';
    }
}

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded");
    
    displayAdminName();
    initAdminMobileMenu();
    
    if (document.getElementById('add-product-form')) {
        initAddProductPage();
    }
    else if (document.getElementById('productsTableBody')) {
        initProductListPage();
    }
    else if (document.getElementById('edit-product-form')) {
        initEditProductPage();
    }
    else if (document.getElementById('orders-table-body')) {
        loadAdminOrders();
    }
    else if (document.getElementById('stats-grid') || document.getElementById('total-orders')) {
        loadDashboardData();
        setInterval(loadDashboardData, 30000);
    }
    else if (document.getElementById('inventory-list')) {
        loadInventory();
        setInterval(loadInventory, 30000);
    }
    
    const sidebarLogoutBtn = document.getElementById('admin-sidebar-logout');
    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('userData');
                localStorage.removeItem('userLoggedIn');
                localStorage.removeItem('userRole');
                localStorage.removeItem('adminLoggedIn');
                window.location.href = 'index.html';
            }
        });
    }
    
    console.log("=== INITIALIZATION COMPLETE ===");
});
