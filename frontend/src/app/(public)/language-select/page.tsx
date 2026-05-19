'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Globe, Check } from 'lucide-react'

type Language = 'ENGLISH' | 'TELUGU'

const languages = [
  {
    code: 'ENGLISH' as Language,
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  {
    code: 'TELUGU' as Language,
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
  },
]

export default function LanguageSelectPage() {
  const router = useRouter()
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('ENGLISH')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if language is already selected
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
    
    // Redirect to home page
    setTimeout(() => {
      router.push('/')
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"
            >
              <Globe className="w-10 h-10 text-green-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              FarmGearConnect
            </h1>
            <p className="text-gray-600">
              Select your preferred language
            </p>
            <p className="text-gray-600 text-sm mt-1">
              మీ ఇష్టమైన భాషను ఎంచుకోండి
            </p>
          </div>

          {/* Language Options */}
          <div className="space-y-3 mb-8">
            {languages.map((language, index) => (
              <motion.button
                key={language.code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                onClick={() => handleLanguageSelect(language.code)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  selectedLanguage === language.code
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{language.flag}</span>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">
                      {language.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {language.nativeName}
                    </p>
                  </div>
                </div>
                {selectedLanguage === language.code && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Continue Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </span>
            ) : (
              <>
                {selectedLanguage === 'ENGLISH' ? 'Continue' : 'కొనసాగించు'}
              </>
            )}
          </motion.button>

          {/* Skip Option */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            onClick={() => router.push('/')}
            className="w-full mt-4 text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors"
          >
            {selectedLanguage === 'ENGLISH' ? 'Skip for now' : 'ఇప్పుడు దాటవేయండి'}
          </motion.button>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-gray-600 text-sm mt-6"
        >
          {selectedLanguage === 'ENGLISH'
            ? 'You can change this later in settings'
            : 'మీరు దీన్ని తర్వాత సెట్టింగ్‌లలో మార్చవచ్చు'}
        </motion.p>
      </motion.div>
    </div>
  )
}
