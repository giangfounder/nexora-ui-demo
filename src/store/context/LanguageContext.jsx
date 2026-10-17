import PropTypes from 'prop-types'
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { DEFAULT_LANGUAGE, getLocale, isKnownLanguage, setCurrentLanguage, translate } from '@/i18n'

export const LANGUAGE_STORAGE_KEY = 'nexoraLanguage'

const LanguageContext = createContext({ language: DEFAULT_LANGUAGE, locale: 'vi-VN', setLanguage: () => {}, t: (s) => s })

const getInitialLanguage = () => {
    try {
        const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
        if (isKnownLanguage(stored)) return stored
    } catch (e) {
        // ignore (e.g. localStorage unavailable)
    }
    return DEFAULT_LANGUAGE
}

export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState(() => {
        const lang = getInitialLanguage()
        setCurrentLanguage(lang)
        return lang
    })

    const setLanguage = useCallback((lang) => {
        if (!isKnownLanguage(lang)) return
        setCurrentLanguage(lang)
        setLanguageState(lang)
        try {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
        } catch (e) {
            // ignore
        }
    }, [])

    useEffect(() => {
        document.documentElement.lang = language
    }, [language])

    // t('Khách hàng') / t('Customers') → the active language, whichever language the source was written in.
    // t('Còn {n} ngày', { n }) fills placeholders.
    const t = useCallback((text, vars) => translate(text, vars, language), [language])

    const value = useMemo(() => ({ language, locale: getLocale(language), setLanguage, t }), [language, setLanguage, t])

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

LanguageProvider.propTypes = {
    children: PropTypes.any
}

export const useLanguage = () => useContext(LanguageContext)

export default LanguageContext
