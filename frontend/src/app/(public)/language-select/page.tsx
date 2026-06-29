'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Globe, Check } from 'lucide-react'

type Language = 'ENGLISH' | 'HINDI' | 'TELUGU'

const languages = [
  {
    code: 'ENGLISH' as Language,
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    description: 'Continue in English',
  },
  {
    code: 'HINDI' as Language,
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    description: 'हिन्दी में जारी रखें',
  },
  {
    code: 'TELUGU' as Language,
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🌾',
    description: 'తెలుగులో కొనసాగించు',
  },
]

export default function LanguageSelectPage() {
  const router = useRouter()
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('ENGLISH')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage')
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage as Language)
    }
  }, [])

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language)
  }

  const handleContinue = () => {
    setIsLoading(true)
    localStorage.setItem('preferredLanguage', selectedLanguage)
    setTimeout(() => {
      router.push('/')
    }, 500)
  }

  const getContinueLabel = () => {
    if (selectedLanguage === 'ENGLISH') return 'Continue'
    if (selectedLanguage === 'HINDI') return 'जारी रखें'
    return 'కొనసాగించు'
  }

  const getSkipLabel = () => {
    if (selectedLanguage === 'ENGLISH') return 'Skip for now'
    if (selectedLanguage === 'HINDI') return 'अभी छोड़ें'
    return 'ఇప్పుడు దాటవేయండి'
  }

  const getFooterLabel = () => {
    if (selectedLanguage === 'ENGLISH') return 'You can change this later in settings'
    if (selectedLanguage === 'HINDI') return 'आप इसे बाद में सेटिंग्स में बदल सकते हैं'
    return 'మీరు దీన్ని తర్వాత సెట్టింగ్‌లలో మార్చవచ్చు'
  }

  return (
    <div className="h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 25%, #047857 50%, #059669 75%, #10b981 100%)',
      }}
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #34d399, transparent)' }}
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6ee7b7, transparent)' }}
        />
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a7f3d0, transparent)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div
          className="rounded-3xl p-5 shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.8)',
          }}
        >
          {/* Logo and Title */}
          <div className="text-center mb-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-2"
              style={{
                background: 'linear-gradient(135deg, #059669, #10b981)',
                boxShadow: '0 6px 20px rgba(5,150,105,0.4)',
              }}
            >
              <Globe className="w-7 h-7 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold mb-0.5"
              style={{ color: '#064e3b' }}
            >
              FarmGearConnect
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-gray-500 text-xs">Select your preferred language</p>
              <p className="text-gray-400 text-xs">अपनी भाषा चुनें • మీ భాషను ఎంచుకోండి</p>
            </motion.div>
          </div>

          {/* Language Options */}
          <div className="space-y-2 mb-4">
            {languages.map((language, index) => (
              <motion.button
                key={language.code}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLanguageSelect(language.code)}
                className="w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left"
                style={{
                  borderColor: selectedLanguage === language.code ? '#059669' : '#e5e7eb',
                  background: selectedLanguage === language.code
                    ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
                    : 'white',
                  boxShadow: selectedLanguage === language.code
                    ? '0 4px 20px rgba(5,150,105,0.2)'
                    : '0 1px 4px rgba(0,0,0,0.05)',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{language.flag}</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{language.name}</p>
                    <p className="text-xs font-medium" style={{ color: '#059669' }}>
                      {language.nativeName}
                    </p>
                    <p className="text-xs text-gray-400">{language.description}</p>
                  </div>
                </div>
                <motion.div
                  initial={false}
                  animate={{ scale: selectedLanguage === language.code ? 1 : 0, opacity: selectedLanguage === language.code ? 1 : 0 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              </motion.button>
            ))}
          </div>

          {/* Continue Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #059669, #10b981)',
              boxShadow: '0 6px 20px rgba(5,150,105,0.4)',
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </span>
            ) : getContinueLabel()}
          </motion.button>

          {/* Skip Option */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={() => router.push('/')}
            className="w-full mt-2 text-gray-400 hover:text-gray-600 font-medium py-1.5 transition-colors text-sm"
          >
            {getSkipLabel()}
          </motion.button>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center text-white/60 text-xs mt-3"
        >
          {getFooterLabel()}
        </motion.p>
      </motion.div>
    </div>
  )
}
