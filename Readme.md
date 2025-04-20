Admin login credentials:-
username: admin
password: admin123

user login credentials (create your own):-
username: VADLA SIDDIK
password: test@123

🚀 Project Overview
A full-stack bulk ordering platform with support for:

Customer + Admin roles

Product browsing

Order placement and status tracking

Delivery address management

Email notifications

🛠️ Technologies Used
🔧 Backend
Node.js with Express.js – REST API framework

Drizzle ORM – Type-safe SQL query builder

PostgreSQL (Neon) – Main database

Neon Serverless Driver – For connecting to the database

Zod – Schema validation

dotenv – For managing environment variables

💾 Storage
PostgresStorage.ts – A class-based abstraction for interacting with DB using Drizzle

🔒 Security
Password hashing with crypto.scrypt

Role-based access: Admin vs. Customer

Email verification (optional)

🧪 Dev Utilities
Vite – Development server and frontend bundler

Automatic seeding – Populates database with initial admin user

Logging – Custom API logging for /api routes

📧 Emails
Transactional email support via Resend (or configurable provider)

Sends:

Order confirmation

Order status updates

🧑‍💻 Frontend
React (with likely integration with Vite)

React Query (TanStack) – For data fetching and caching

Tailwind CSS or similar utility-first CSS (assumed)

📦 Functions (Core Logic)
👤 User Management
createUser, getUserByUsername, getUserByEmail, updateUser, deleteUser

Role support (admin, customer)

Password hashing with salt

Unique constraint on username

📬 Address Management
Create new address

Fetch addresses by email

Mark address as default

Update / delete addresses

🛒 Product Management
Add new product

Fetch all products or by ID

Update/delete product (admin only)

📦 Order Management
Create new order with auto-generated order number (ORD-<timestamp>)

Fetch orders by email

Fetch by orderNumber

Update order status (admin only)

✨ Features
🧑‍⚖️ Admin Features
View all orders

Change order status

Add/edit/delete products

Manage users

👥 Customer Features
Register/Login

Browse products

Place orders

Save and reuse delivery addresses

Track order status

📤 Emails - trail version:- only "vadlasiddik@gmail.com" email registered will get notification, so register with "vadlasiddik@gmail.com" email
Order confirmation

Order status update

⚙️ Dev & Deployment
Auto-seeding of admin user on first run (scripts/seed.ts)

Error logging and debugging tools

