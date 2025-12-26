// Minimal i18n shim to avoid importing legacy localization during TS checks
export const SUPPORTED_LANGUAGES = ['en', 'pt'] as const;

export function changeLanguage(_: string) {
	// noop
}

export function getCurrentLanguage() {
	return 'en'
}

export function initI18n() {
	// noop
}

export default {
	SUPPORTED_LANGUAGES,
	changeLanguage,
	getCurrentLanguage,
	initI18n,
}
