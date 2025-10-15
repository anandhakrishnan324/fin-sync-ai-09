
Fin-Sync AI: Your Intelligent Expense Tracker
Fin-Sync AI is a modern, full-stack web application designed to help users take control of their finances. It provides a secure and intuitive platform for tracking daily expenses, visualizing spending habits, and receiving intelligent, AI-driven advice to improve money management skills.

[➡️ Live Demo Link Here] (Add your deployed app link here)

✨ Key Features
Secure Authentication: JWT-based authentication ensures user data is private and secure.

Intuitive Dashboard: Visualize your spending with interactive charts and graphs for clear insights.

Expense Logging: Easily add, edit, and delete your daily expenses with categories and descriptions.

AI-Powered Insights: Get personalized tips and advice based on your spending patterns.

Indian Tax Estimator: Calculate your estimated income tax liability based on the latest Indian tax slabs.

Admin Panel: A role-protected dashboard for administrators to manage users.

Personalization: Customize your experience with light/dark themes and language preferences.

📸 Screenshots
(Add a few screenshots of your application here. For example: the login page, the main dashboard, and the settings page.)

Login Page

Dashboard View





🛠️ Technology Stack
Category

Technology

Frontend

React, React Router, Axios, Tailwind CSS

Backend

Node.js, Express.js

Database

MySQL

Security

JSON Web Tokens (JWT), bcrypt

🚀 Getting Started
Follow these instructions to set up and run the project on your local machine.

Prerequisites
Node.js (v16 or newer)

npm (v8 or newer)

MySQL Server

Installation & Setup
Clone the repository:

git clone [https://github.com/anandhakrishnan324/fin-sync-ai-09.git](https://github.com/anandhakrishnan324/fin-sync-ai-09.git)
cd fin-sync-ai-09

Set up the Backend Server:

# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create the environment file from the example
cp .env.example .env

Open the newly created .env file and fill in your MySQL database credentials and a strong JWT_SECRET.

Set up the Database:

Start your MySQL server.

Create a new database with the name you specified in your .env file (e.g., finsync_db).

Run the table creation scripts located in your project to set up the users, expenses, and user_settings tables. (You can add a link to your SQL schema file here if you have one).

Set up the Frontend Client:

# Navigate to the client directory from the root folder
cd ../client

# Install dependencies
npm install

Running the Application
You will need to run the backend and frontend servers in separate terminals.

Start the Backend Server:

# In the /server directory
npm start

The server will start, typically on http://localhost:3001.

Start the Frontend Client:

# In the /client directory
npm start

The React development server will launch, and the application will open in your browser, usually at http://localhost:3000.

👤 Author
Anandhakrishnan

GitHub: @anandhakrishnan324

📄 License
This project is licensed under the MIT License - see the LICENSE.md file for details.
