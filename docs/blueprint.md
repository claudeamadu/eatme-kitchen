# EatMe App Blueprint

## 1. Overview

**EatMe** is a modern, all-in-one web application for a restaurant, allowing customers to browse the menu, place food orders, and make table reservations. It features a seamless, mobile-first user experience and includes a comprehensive admin panel for restaurant staff to manage content and operations efficiently.

## 2. Core Features

### Customer-Facing App
- **Authentication:** Secure user signup and login with email and password using Firebase Auth.
- **Onboarding:** A simple, multi-step introductory flow for first-time users.
- **Home Page:** A dynamic dashboard featuring promotional carousels, popular dishes, and a quick link to table reservations.
- **Menu System:**
    - Browse food items by category.
    - Real-time search functionality.
    - Detailed item pages with image galleries, descriptions, and customization options (sizes, extras).
- **Shopping Cart:** Add/remove items, update quantities, and apply loyalty points for discounts.
- **Unified Checkout:** A single, intelligent checkout flow that handles both food orders and table reservations, identified by a URL parameter (`?type=food` or `?type=reservation`).
- **Order Management:** View a history of past orders and check the status of current ones.
- **Table Reservations:** A multi-step process to book a table, including selecting date, time, party size, and occasion.
- **User Settings:**
    - Profile management (update name, phone, etc.).
    - Manage saved payment methods (Mobile Money wallets).
    - View loyalty points and rewards.
    - Help center and feedback forms.
- **Notifications:** A dedicated page to view updates and promotions sent by the admin.

### Admin Panel
- **Dashboard:** An overview of recent orders, key statistics (total orders, users), and quick navigation.
- **Menu Management:** Full CRUD (Create, Read, Update, Delete) functionality for food items and categories, including image uploads via Firebase Storage.
- **Order Management:** View all customer orders and update their status (e.g., 'Ongoing', 'Completed').
- **Reservation Management:** View and manage all table reservations.
- **User Management:** View a list of all registered users.
- **Promo Management:** Create and manage promotional banners with text and images.
- **Finance:** A dashboard showing financial summaries, including total revenue and sales charts.
- **Messaging:** A tool to send global notifications to all users.

## 3. Technical Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with `shadcn/ui` for the component library.
- **Backend & Database:** Firebase (Firestore, Authentication, Storage)
- **State Management:** React Context and Hooks for cart, reservation, and user sessions.
- **Deployment:** Configured for Firebase App Hosting.
- **AI Integration (Future):** Genkit for potential generative AI features.
