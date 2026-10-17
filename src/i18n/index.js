// NEXORA i18n — two languages, one lookup table in each direction.
//
// Source strings may be written in EITHER language: legacy screens use English keys, NEXORA screens use
// Vietnamese literals. t(text) returns `text` in the active language, whichever language it was written in.
//
//   core    → translations.js  { 'English': 'Tiếng Việt' }   (legacy dictionary)
//   areas   → areas/<area>.js  { 'Tiếng Việt': 'English' }   (one file per screen group, auto-registered)
//
// Placeholders: t('Còn {n} ngày', { n: 3 }). Put the same {name} tokens in both languages.
// Strings with no entry are returned unchanged, so wrapping text in t() is always safe.
import translations from './translations'

export const LANGUAGES = [
    { code: 'vi', label: 'Tiếng Việt', short: 'VI', locale: 'vi-VN' },
    { code: 'en', label: 'English', short: 'EN', locale: 'en-US' }
]
export const DEFAULT_LANGUAGE = 'vi'

const toVi = new Map()
const toEn = new Map()

const add = (vi, en) => {
    if (typeof vi !== 'string' || typeof en !== 'string') return
    if (!toVi.has(en)) toVi.set(en, vi)
    if (!toEn.has(vi)) toEn.set(vi, en)
}

Object.entries(translations.vi || {}).forEach(([en, vi]) => add(vi, en))

const areaModules = import.meta.glob('./areas/*.js', { eager: true })
Object.values(areaModules).forEach((mod) => {
    Object.entries(mod.default || {}).forEach(([vi, en]) => add(vi, en))
})

const interpolate = (text, vars) =>
    vars ? text.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m)) : text

let current = DEFAULT_LANGUAGE
export const setCurrentLanguage = (lang) => {
    current = lang
}
export const getLanguage = () => current
export const getLocale = (lang = current) => LANGUAGES.find((l) => l.code === lang)?.locale || 'vi-VN'

export const translate = (text, vars, lang = current) => {
    if (!text || typeof text !== 'string') return text
    const table = lang === 'en' ? toEn : toVi
    let out = table.get(text)
    if (out === undefined) {
        // tolerate surrounding whitespace / a trailing colon in JSX text
        const m = text.match(/^(\s*)(.*?)(\s*:?\s*)$/s)
        const hit = m && m[2] !== text ? table.get(m[2]) : undefined
        out = hit !== undefined ? m[1] + hit + m[3] : text
    }
    return interpolate(out, vars)
}

export const isKnownLanguage = (lang) => LANGUAGES.some((l) => l.code === lang)
