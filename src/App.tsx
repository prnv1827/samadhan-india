import React, { useEffect, useRef } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate } from
'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChallengeProvider } from './contexts/ChallengeContext';
import { PortalShell } from './components/PortalShell';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { PublicChallengeDetail, PublicChallenges } from './pages/PublicChallenges';
import { SubmitChallenge } from './pages/citizen/SubmitChallenge';
import { MySubmissions } from './pages/citizen/MySubmissions';
import { SubmissionDetail } from './pages/citizen/SubmissionDetail';
import { BrowseChallenges } from './pages/citizen/BrowseChallenges';
import { UniversityDashboard } from './pages/portals/UniversityDashboard';
import { IndustryDashboard } from './pages/portals/IndustryDashboard';
import { AdminDashboard } from './pages/portals/AdminDashboard';
import { roleMeta } from './data/taxonomy';
import type { Role } from './types';

type StartAs = 'signed-out' | 'citizen' | 'university' | 'industry' | 'admin';

function Portal({
  role,
  showBrowseFeed,
  children




}: {role: Role;showBrowseFeed: boolean;children: React.ReactNode;}) {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-canvas p-10 text-center text-sm text-ink-muted">Checking your Samadhan session…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={roleMeta[user.role].home} replace />;

  return <PortalShell showBrowseFeed={showBrowseFeed}>{children}</PortalShell>;
}

function LandOnPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !user) return;
    done.current = true;
    navigate(roleMeta[user.role].home, { replace: true });
  }, [user, navigate]);

  return null;
}

export function App({
  startAs = 'signed-out',
  showBrowseFeed = true



}: {startAs?: StartAs;showBrowseFeed?: boolean;}) {
  const initialRole = startAs === 'signed-out' ? null : startAs as Role;

  return (
    <AuthProvider initialRole={initialRole}>
      <ChallengeProvider>
        <BrowserRouter>
          <LandOnPortal />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/challenges" element={<PublicChallenges />} />
            <Route path="/challenges/:id" element={<PublicChallengeDetail />} />

            <Route
              path="/citizen/submit"
              element={
              <Portal role="citizen" showBrowseFeed={showBrowseFeed}>
                  <SubmitChallenge />
                </Portal>
              } />
            
            <Route
              path="/citizen/submissions"
              element={
              <Portal role="citizen" showBrowseFeed={showBrowseFeed}>
                  <MySubmissions />
                </Portal>
              } />
            
            <Route
              path="/citizen/submissions/:id"
              element={
              <Portal role="citizen" showBrowseFeed={showBrowseFeed}>
                  <SubmissionDetail />
                </Portal>
              } />
            
            <Route
              path="/citizen/browse"
              element={
              <Portal role="citizen" showBrowseFeed={showBrowseFeed}>
                  {showBrowseFeed ?
                <BrowseChallenges /> :

                <Navigate to="/citizen/submissions" replace />
                }
                </Portal>
              } />
            
            <Route
              path="/citizen/browse/:id"
              element={
              <Portal role="citizen" showBrowseFeed={showBrowseFeed}>
                  <SubmissionDetail from="browse" />
                </Portal>
              } />
            

            <Route
              path="/university"
              element={
              <Portal role="university" showBrowseFeed={showBrowseFeed}>
                  <UniversityDashboard />
                </Portal>
              } />
            
            <Route
              path="/industry"
              element={
              <Portal role="industry" showBrowseFeed={showBrowseFeed}>
                  <IndustryDashboard />
                </Portal>
              } />
            
            <Route
              path="/admin"
              element={
              <Portal role="admin" showBrowseFeed={showBrowseFeed}>
                  <AdminDashboard />
                </Portal>
              } />
            

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ChallengeProvider>
    </AuthProvider>);

}