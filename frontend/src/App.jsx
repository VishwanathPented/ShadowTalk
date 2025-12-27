import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import Feed from './pages/Feed'
import Notifications from './pages/Notifications'
import Groups from './pages/Groups'
import GroupDetail from './pages/GroupDetail'
import PostDetail from './pages/PostDetail'
import ProfilePage from './pages/ProfilePage'
import AdminDashboard from './pages/AdminDashboard'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'

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
        <ErrorBoundary>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/login" element={<Login />} />

                        <Route path="/" element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }>
                            <Route path="feed" element={<Feed />} />
                            <Route path="groups" element={<Groups />} />
                            <Route path="groups/:groupId" element={<GroupDetail />} />
                            <Route path="posts/:postId" element={<PostDetail />} />
                            <Route path="profile/:username" element={<ProfilePage />} />
                            <Route path="notifications" element={<Notifications />} />
                        </Route>

                        <Route path="/shadow" element={
                            <ProtectedRoute>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </ErrorBoundary>
    )
}

export default App
