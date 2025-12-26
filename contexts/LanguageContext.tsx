import React from 'react'

type LanguageContextValue = {
	language: string
	setLanguage: (l: string) => void
}

const Context = React.createContext<LanguageContextValue | undefined>(undefined)

export const LanguageProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
	const [language, setLanguage] = React.useState('en')
	return <Context.Provider value={{ language, setLanguage }}>{children}</Context.Provider>
}

export function useLanguage() {
	const c = React.useContext(Context)
	if (!c) throw new Error('useLanguage must be used within LanguageProvider')
	return c
}

export { Context as LanguageContext }
