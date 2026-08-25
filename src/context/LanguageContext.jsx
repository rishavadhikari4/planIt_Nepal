import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { STRINGS } from '../i18n/strings'

/*
 * English and Nepali.
 *
 * The whole site was English-only, for a marketplace that only operates in
 * Nepal. This is deliberately not a translation framework: no library, no
 * extraction step, no interpolation engine. It is one object of strings and a
 * lookup, because the alternative — pulling in i18next for a two-language site
 * with a few hundred strings — costs more than it returns.
 *
 * The rule for what belongs in here: navigation, actions, labels and anything
 * that tells someone what will happen. Inventory names, descriptions and
 * prices stay as the supplier wrote them; translating a venue's name would be
 * inventing one.
 *
 * A missing key falls back to English rather than rendering the key, so a
 * half-finished translation degrades into a bilingual page instead of a
 * broken one.
 */

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key, fallback) => fallback ?? key,
  isNepali: false,
})

export const useLanguage = () => useContext(LanguageContext)

const STORAGE_KEY = 'planit-lang'

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'en' || saved === 'np') return saved
      // A Nepali-preferring browser gets Nepali first, without being locked to it.
      if (typeof navigator !== 'undefined' && navigator.language?.startsWith('ne')) return 'np'
    } catch {
      // Private browsing and blocked storage both throw; English is the default.
    }
    return 'en'
  })

  const setLang = useCallback((next) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Not being able to remember the choice is not a reason to refuse it.
    }
  }, [])

  /* The document language drives hyphenation, speech synthesis and the font
     stack's script matching, so it has to move with the toggle. */
  useEffect(() => {
    document.documentElement.lang = lang === 'np' ? 'ne' : 'en'
  }, [lang])

  const t = useCallback(
    (key, fallback) => {
      const entry = STRINGS[key]
      if (!entry) return fallback ?? key
      return entry[lang] || entry.en || fallback || key
    },
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, t, isNepali: lang === 'np' }), [lang, setLang, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export default LanguageContext
