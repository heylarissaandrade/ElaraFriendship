import React from 'react'

type AuthContextValue = {
	user: any | null
	signIn: () => void
	signOut: () => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = React.useState<any | null>(null)
	const signIn = () => setUser({ id: 'user' })
	const signOut = () => setUser(null)
	return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const c = React.useContext(AuthContext)
	if (!c) throw new Error('useAuth must be used within AuthProvider')
	return c
}

export { AuthContext }
