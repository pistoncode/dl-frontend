import React, { useEffect, useRef } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@core/auth';
import { LoadingSpinner } from '@shared/components/ui';
import { View, StyleSheet } from 'react-native';

interface RouteGuardProps {
  children: React.ReactNode;
}

/**
 * RouteGuard component handles navigation based on authentication and onboarding status
 * 
 * Navigation Flow:
 * 1. Not authenticated → Login/Register screens
 * 2. Authenticated but email not verified → Email verification screen
 * 3. Authenticated, verified, but onboarding incomplete → Onboarding flow
 * 4. Authenticated, verified, onboarding complete → Main app
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { 
    isLoading, 
    isAuthenticated, 
    needsEmailVerification, 
    needsOnboarding,
    user 
  } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (isLoading) return; // Wait for auth state to load

    const currentPath = '/' + segments.join('/');
    
    // Define route groups
    const publicRoutes = ['/', '/login', '/register', '/profile', '/settings', '/edit-profile', '/match-history']; // Temporarily added /profile, /settings, /edit-profile and /match-history for testing
    const authRoutes = ['/email-verification'];
    const onboardingRoutes = ['/onboarding'];
    const protectedRoutes = ['/home', '/dashboard'];

    const isPublicRoute = publicRoutes.includes(currentPath) || currentPath.startsWith('/auth');
    const isAuthRoute = authRoutes.some(route => currentPath.startsWith(route));
    const isOnboardingRoute = onboardingRoutes.some(route => currentPath.startsWith(route));
    const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));

    console.log('RouteGuard:', {
      currentPath,
      isAuthenticated,
      needsEmailVerification,
      needsOnboarding,
      user: user?.email,
      hasInitialized: hasInitialized.current,
    });

    // Not authenticated - redirect to public routes
    if (!isAuthenticated) {
      hasInitialized.current = true;
      if (!isPublicRoute) {
        router.replace('/');
      }
      return;
    }

    // Authenticated but needs email verification
    if (needsEmailVerification) {
      hasInitialized.current = true;
      if (!isAuthRoute && !isPublicRoute) {
        router.replace('/email-verification');
      }
      return;
    }

    // Authenticated and verified - redirect to onboarding only if not on landing page initially
    if (isAuthenticated && !needsEmailVerification) {
      // If this is the first load and we're on the landing page, don't redirect
      if (!hasInitialized.current && currentPath === '/') {
        hasInitialized.current = true;
        return;
      }
      
      hasInitialized.current = true;
      
      // Redirect to onboarding if not already there and not on landing page
      if (!isOnboardingRoute && currentPath !== '/') {
        console.log('Redirecting to onboarding from:', currentPath);
        router.replace('/onboarding/personal-info');
      }
      return;
    }
  }, [isLoading, isAuthenticated, needsEmailVerification, needsOnboarding, segments, router]);

  // Show loading screen while determining auth state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner message="Loading..." />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});