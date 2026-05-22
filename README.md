Jangsu Korean Store - Online Korean Grocery System

This is v1.0 of the Jangsu Korean Store website (an online Korean grocery and food ordering system) using HTML, CSS, and JavaScript components with localStorage for data persistence.

How to Run

Local Setup (Demo Mode - No Backend)
1. Download the `.zip` file and extract the content to an accessible location
2. Open the extracted folder
3. Double-click `index.html` to open in your browser
4. Or use Live Server extension in VS Code for better experience

Requirements
- Modern web browser (Chrome, Firefox, Edge, Safari)
- No server or database yet
- Internet connection only for external fonts/CDNs (optional)

## 💾 Data Storage

This website uses localStorage for data persistence:
- User accounts are stored in browser's localStorage
- Shopping cart data is saved locally
- Order history is stored in localStorage
- All data remains even after browser restart
- Data is specific to each browser/device

Note: Data will not sync across different devices or browsers.

Role Based Access

Guest (Not Logged In)
- Browse products
- View product details
- Add items to cart
- View cart
- Access About Us page
- CANNOT checkout or place orders
- CANNOT view profile or order history

Customer (Demo Account: john / john123)
- Register and Login
- Browse and filter products by category
- View product details
- Add/remove items from cart
- Update cart quantities
- Checkout and place orders
- Select pickup schedule
- Choose payment method (Cash On Pickup / GCash)
- View order history in profile
- Track order status
- Edit profile information

Demo Customer Account:
| Username | Password |
|----------|----------|
| user | user1234 |
| example | example1234 |

Admin (Demo Account: admin123 / adminjangsu)
- Dashboard
  - View total orders
  - View pending orders
  - View ready for pickup orders
  - View low stock products
- Product Management
  - Add new products
  - Edit product details
  - Delete products
  - Update stock quantities
  - Set low stock threshold
- Order Management
  - View all customer orders
  - Update order status:
    - Pending → Confirmed → Ready for Pickup → Completed
    - Or Cancel order
- Inventory Management
  - Track available stock
  - Monitor reserved stock
  - Low stock alerts (red indicator when stock < 10)

**Demo Admin Account:**
| Username | Password |
|----------|----------|
| admin | admin123 |

Shopping Cart Features

- Persistent cart using localStorage
- Add/remove items
- Update quantities with +/− buttons
- Real-time total calculation
- Cart badge counter updates
- Slide-out cart sidebar
- View order button redirects to checkout

Order Status Flow

Pending → Confirmed → Ready for Pickup → Completed
↓
Cancelled


---

**Developed for Jangsu Korean Store**  
*Last Updated: April 2026*
