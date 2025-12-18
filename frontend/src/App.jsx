import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Groups from './pages/Groups'
import GroupDetail from './pages/GroupDetail'
import Layout from './components/Layout'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Feed />} />
                        <Route path="groups" element={<Groups />} />
                        <Route path="groups/:groupId" element={<GroupDetail />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App
