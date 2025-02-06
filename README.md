# 🍽️ Grabit - Online Food Ordering System

Grabit is a modern **online food ordering system** built using **Next.js**, **Firebase**, and **Framer Motion**. It includes **admin and user dashboards**, **real-time order updates**, and **OTP authentication**.

---

## 🚀 Features

### 🔹 **User Features**
✅ Sign up & log in using **Google** or **Phone OTP**  
✅ Browse and add food items to the **cart**  
✅ Checkout and place orders with **real-time updates**  
✅ Track order status: **Preparing → Ready for Pickup → Completed**  
✅ Secure **profile management & logout**  

### 🔹 **Admin Features**
✅ **Admin dashboard** to manage all orders  
✅ Update order statuses **(Preparing → Ready → Completed)**  
✅ **Cancel orders** with confirmation popup  
✅ View **customer details** (Name, Email, Phone)  
✅ **Role-based authentication** (Only Admins can access the dashboard)  

---

## 📦 **Installation & Setup**

### 1️⃣ Clone the Repository  
```sh
git clone https://github.com/NandakishoreN09/Grabit.git
cd grabit

Install Dependencies

npm install

Create a .env.local file in the project root and add your Firebase credentials:
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id


Start the Development Server

npm run dev


📂 grabit
 ┣ 📂 components
 ┃ ┣ 📜 Navbar.tsx
 ┃ ┣ 📜 Cart.tsx
 ┃ ┣ 📜 Orders.tsx
 ┃ ┣ 📜 Admin.tsx
 ┃ ┣ 📜 Profile.tsx
 ┃ ┗ 📜 Signup.tsx
 ┣ 📂 lib
 ┃ ┗ 📜 firebase.ts   # Firebase configuration & functions
 ┣ 📂 pages
 ┃ ┣ 📜 index.tsx
 ┃ ┣ 📜 menu.tsx
 ┃ ┣ 📜 cart.tsx
 ┃ ┣ 📜 orders.tsx
 ┃ ┣ 📜 admin.tsx
 ┃ ┣ 📜 signup.tsx
 ┃ ┗ 📜 login.tsx
 ┣ 📜 .env.local       # Firebase credentials
 ┣ 📜 package.json
 ┗ 📜 README.md

🔑 Admin Access
To make a user an admin, run this in Firebase Firestore:

Go to Firebase Console → Firestore Database
Manually create a document inside the admins collection:

Collection: admins
Document ID: userUID
Data: { "role": "admin" }


🤝 Contributing
👨‍💻 Pull requests are welcome!
For major changes, open an issue first to discuss what you would like to change.


