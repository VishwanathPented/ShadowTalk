import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "211140167059-iqs5gakg1i2chfh0c0phib5cl9j13eql.apps.googleusercontent.com"}>
            <Toaster position="top-center" reverseOrder={false} />
            <App />
        </GoogleOAuthProvider>
    </React.StrictMode>,
)
