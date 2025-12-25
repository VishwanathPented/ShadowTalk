# ShadowTalk

A Twitter-like anonymous social platform where users are assigned random anonymous identities. Built with Spring Boot and React.

## 🚀 Features
- **Anonymous Identity**: Users get names like "Ghost-123", "Shadow-999".
- **Global Feed**: Post secrets, like, and comment anonymously.
- **Groups**: Create public or private groups.
- **Real-time Chat**: Group chat using WebSockets.
- **Word Filtering**: Automatic blocking of offensive content.

## 🛠 Tech Stack
- **Backend**: Java 17, Spring Boot 3.2, Spring Security (JWT), WebSocket, MySQL.
- **Frontend**: React 18, Vite, Tailwind CSS, Axios.

## 🏃‍♂️ Local Development Guide

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL Server

### 1. Database Setup
Create a MySQL database named `anonymous_db`.
```sql
CREATE DATABASE anonymous_db;
```
Update `backend/src/main/resources/application.properties` with your MySQL username and password.

### 2. Backend Setup
Navigate to the backend folder:
```bash
cd backend
```
Run the application:
```bash
./mvnw spring-boot:run
```
The server will start on `http://localhost:8080`.

### 3. Frontend Setup
Navigate to the frontend folder:
```bash
cd frontend
```
Install dependencies:
```bash
npm install
```
Run the development server:
```bash
npm run dev
```
The app will open at `http://localhost:5173`.

## 🧪 Testing the App
1. Go to `http://localhost:5173`.
2. Click **Signup** and create an account. You will receive an anonymous name.
3. Post something in the global feed.
4. Create a group and test the real-time chat (open two browser windows/incognito to test chat between users).

## 🔒 Security
- Passwords are Bcrypt hashed.
- JWT used for session management.
- CORS configured for local development.

## 📝 License
MIT
