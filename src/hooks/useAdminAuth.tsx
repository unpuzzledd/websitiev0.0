import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { supabase } from '../lib/supabase'

interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'super_admin'
}

interface AdminAuthContextType {
  adminUser: AdminUser | null
  isAuthenticated: boolean
  loading: boolean
  adminSignInWithGoogle: () => Promise<void>
  adminSignOut: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if admin is already logged in
    const checkAdminSession = () => {
      const adminSession = localStorage.getItem('admin_session')
      if (adminSession) {
        try {
          const user = JSON.parse(adminSession)
          setAdminUser(user)
        } catch (error) {
          localStorage.removeItem('admin_session')
        }
      }
      setLoading(false)
    }

    checkAdminSession()
  }, [])

  // Check if user is admin by email
  const isAdminEmail = (email: string): boolean => {
    const adminEmails = [
      'admin@unpuzzled.com',
      'superadmin@unpuzzled.com',
      'neeraj.7always@gmail.com', // Your existing email set as admin
      // Add more admin emails here as needed
    ]
    return adminEmails.includes(email.toLowerCase())
  }

  const adminSignInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin`
        }
      })
      
      if (error) throw error
    } catch (error) {
      console.error('Admin Google sign in error:', error)
      alert('Error signing in with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Google OAuth callback and check if user is admin
  const handleGoogleCallback = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const email = session.user.email || ''
        
        if (isAdminEmail(email)) {
          const adminUser: AdminUser = {
            id: session.user.id,
            email: email,
            name: session.user.user_metadata?.full_name || 'Admin User',
            role: email === 'superadmin@unpuzzled.com' ? 'super_admin' : 'admin'
          }

          // Store admin session
          localStorage.setItem('admin_session', JSON.stringify(adminUser))
          setAdminUser(adminUser)
        } else {
          // Not an admin email, sign out
          await supabase.auth.signOut()
          alert('Access denied. This email is not authorized for admin access.')
        }
      }
    } catch (error) {
      console.error('Error handling Google callback:', error)
    }
  }

  // Listen for auth state changes only for admin-specific flows
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Only handle admin callback if we're on admin signin page
          if (window.location.pathname === '/admin/signin') {
            await handleGoogleCallback()
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('admin_session')
          setAdminUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const adminSignOut = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('admin_session')
    setAdminUser(null)
    // Redirect to homepage after logout
    window.location.href = '/'
  }

  const value: AdminAuthContextType = {
    adminUser,
    isAuthenticated: !!adminUser,
    loading,
    adminSignInWithGoogle,
    adminSignOut
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}
