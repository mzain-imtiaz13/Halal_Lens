# Halal_Lens

# Halal_Lens (Admin Dashboard)
A React-based admin dashboard for Halal Lens that lets you:
Manage manual products submitted by admins
Review AI products created from barcode scans or user submissions
Monitor users, scan histories, community votes, and revenue
See KPI cards and charts for verdict breakdown, medium-wise scans, recent activity, and top products
Built with React + Vite, Firebase (Auth, Firestore, Storage), and a small chart + table UI.


# Setup

# 1. Clone & install
git clone https://github.com/mzain-imtiaz13/Halal_Lens.git
cd frontend
npm install

# 2. Firebase project
Create a Firebase project.
Enable:
Authentication → at least Google or Email/Password.
Cloud Firestore (in Native mode).
Storage (optional for product images).
Create a Web App and copy your Firebase config.

# 3. Grant admin access
Create a document in collection admins with Document ID = <auth uid> for your admin account.
The doc can be  { email: "you@example.com", createdAt: <server ts> }.


# 4. Run
npm run dev     