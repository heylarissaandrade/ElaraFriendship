import React from 'react'

type MatchesContextValue = {
	matches: any[]
	addMatch: (m: any) => void
}

const MatchesContext = React.createContext<MatchesContextValue | undefined>(undefined)

export const MatchesProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
	const [matches, setMatches] = React.useState<any[]>([])
	const addMatch = (m: any) => setMatches((s) => [...s, m])
	return <MatchesContext.Provider value={{ matches, addMatch }}>{children}</MatchesContext.Provider>
}

export function useMatches() {
	const c = React.useContext(MatchesContext)
	if (!c) throw new Error('useMatches must be used within MatchesProvider')
	return c
}

export { MatchesContext }
