'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Tractor, 
  Search, 
  Shield, 
  MessageCircle, 
  Star, 
  TrendingUp,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [language, setLanguage] = useState<'ENGLISH' | 'HINDI' | 'TELUGU'>('ENGLISH')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage')
    if (savedLanguage) {
      setLanguage(savedLanguage as 'ENGLISH' | 'HINDI' | 'TELUGU')
    } else {
      router.push('/language-select')
    }
  }, [router])

  const handleLanguageChange = (lang: 'ENGLISH' | 'HINDI' | 'TELUGU') => {
    setLanguage(lang)
    localStorage.setItem('preferredLanguage', lang)
  }

  const translations = {
    ENGLISH: {
    hero: {
      title: 'Rent Farm Equipment',
      subtitle: 'Connect with nearby farmers and equipment owners',
      searchPlaceholder: 'Search for tractors, harvesters, and more...',
      browseMarketplace: 'Browse Marketplace',
      listEquipment: 'List Your Equipment',
    },
    features: {
      title: 'Why Choose FarmGearConnect?',
      items: [
        {
          icon: Search,
          title: 'Easy Discovery',
          description: 'Find equipment near you with smart filters and GPS search',
        },
        {
          icon: Shield,
          title: 'Verified Listings',
          description: 'All equipment is verified by our admin team before going live',
        },
        {
          icon: MessageCircle,
          title: 'Secure Communication',
          description: 'Chat and call without exposing your phone number',
        },
        {
          icon: Star,
          title: 'Ratings & Reviews',
          description: 'Make informed decisions with community feedback',
        },
      ],
    },
    stats: {
      title: 'Trusted by Farmers Across India',
      items: [
        { value: '1000+', label: 'Equipment Listed' },
        { value: '500+', label: 'Active Users' },
        { value: '2000+', label: 'Bookings Completed' },
        { value: '4.8', label: 'Average Rating' },
      ],
    },
    howItWorks: {
      title: 'How It Works',
      farmer: {
        title: 'For Farmers',
        steps: [
          'Browse nearby equipment',
          'Check availability and pricing',
          'Send booking request',
          'Get equipment delivered',
        ],
      },
      owner: {
        title: 'For Equipment Owners',
        steps: [
          'List your equipment',
          'Get admin approval',
          'Receive booking requests',
          'Earn from your equipment',
        ],
      },
    },
    cta: {
      title: 'Ready to Get Started?',
      subtitle: 'Join thousands of farmers and equipment owners',
      register: 'Register Now',
      login: 'Login',
    },
    },
    HINDI: {
      hero: {
        title: 'कृषि उपकरण किराए पर लें',
        subtitle: 'पास के किसानों और उपकरण मालिकों से जुड़ें',
        searchPlaceholder: 'ट्रैक्टर, हार्वेस्टर और अधिक खोजें...',
        browseMarketplace: 'मार्केटप्लेस देखें',
        listEquipment: 'अपना उपकरण सूचीबद्ध करें',
      },
      features: {
        title: 'FarmGearConnect क्यों चुनें?',
        items: [
          { icon: Search, title: 'आसान खोज', description: 'स्मार्ट फ़िल्टर और GPS से पास के उपकरण खोजें' },
          { icon: Shield, title: 'सत्यापित सूचियाँ', description: 'सभी उपकरण हमारी टीम द्वारा सत्यापित हैं' },
          { icon: MessageCircle, title: 'सुरक्षित संवाद', description: 'फ़ोन नंबर उजागर किए बिना चैट और कॉल करें' },
          { icon: Star, title: 'रेटिंग और समीक्षाएं', description: 'समुदाय की प्रतिक्रिया से सूचित निर्णय लें' },
        ],
      },
      stats: {
        title: 'पूरे भारत के किसानों का भरोसा',
        items: [
          { value: '1000+', label: 'उपकरण सूचीबद्ध' },
          { value: '500+', label: 'सक्रिय उपयोगकर्ता' },
          { value: '2000+', label: 'बुकिंग पूर्ण' },
          { value: '4.8', label: 'औसत रेटिंग' },
        ],
      },
      howItWorks: {
        title: 'यह कैसे काम करता है',
        farmer: {
          title: 'किसानों के लिए',
          steps: ['पास के उपकरण देखें', 'उपलब्धता और मूल्य जांचें', 'बुकिंग अनुरोध भेजें', 'उपकरण डिलीवरी पाएं'],
        },
        owner: {
          title: 'उपकरण मालिकों के लिए',
          steps: ['अपना उपकरण सूचीबद्ध करें', 'व्यवस्थापक अनुमोदन पाएं', 'बुकिंग अनुरोध प्राप्त करें', 'कमाई करें'],
        },
      },
      cta: {
        title: 'शुरू करने के लिए तैयार हैं?',
        subtitle: 'हजारों किसानों और मालिकों से जुड़ें',
        register: 'अभी रजिस्टर करें',
        login: 'लॉग इन',
      },
    },
    TELUGU: {
      hero: {
        title: 'వ్యవసాయ పరికరాలను అద్దెకు తీసుకోండి',
      subtitle: 'సమీప రైతులు మరియు పరికరాల యజమానులతో కనెక్ట్ అవ్వండి',
      searchPlaceholder: 'ట్రాక్టర్లు, హార్వెస్టర్లు మరియు మరిన్నింటి కోసం వెతకండి...',
      browseMarketplace: 'మార్కెట్‌ప్లేస్ బ్రౌజ్ చేయండి',
      listEquipment: 'మీ పరికరాలను జాబితా చేయండి',
    },
    features: {
      title: 'FarmGearConnect ఎందుకు ఎంచుకోవాలి?',
      items: [
        {
          icon: Search,
          title: 'సులభ కనుగొనడం',
          description: 'స్మార్ట్ ఫిల్టర్లు మరియు GPS శోధనతో మీ సమీపంలో పరికరాలను కనుగొనండి',
        },
        {
          icon: Shield,
          title: 'ధృవీకరించబడిన జాబితాలు',
          description: 'అన్ని పరికరాలు లైవ్‌కు వెళ్లే ముందు మా అడ్మిన్ టీమ్ ద్వారా ధృవీకరించబడతాయి',
        },
        {
          icon: MessageCircle,
          title: 'సురక్షిత కమ్యూనికేషన్',
          description: 'మీ ఫోన్ నంబర్‌ను బహిర్గతం చేయకుండా చాట్ మరియు కాల్ చేయండి',
        },
        {
          icon: Star,
          title: 'రేటింగ్‌లు & సమీక్షలు',
          description: 'కమ్యూనిటీ ఫీడ్‌బ్యాక్‌తో సమాచార నిర్ణయాలు తీసుకోండి',
        },
      ],
    },
    stats: {
      title: 'భారతదేశం అంతటా రైతులచే విశ్వసనీయం',
      items: [
        { value: '1000+', label: 'పరికరాలు జాబితా చేయబడ్డాయి' },
        { value: '500+', label: 'క్రియాశీల వినియోగదారులు' },
        { value: '2000+', label: 'బుకింగ్‌లు పూర్తయ్యాయి' },
        { value: '4.8', label: 'సగటు రేటింగ్' },
      ],
    },
    howItWorks: {
      title: 'ఇది ఎలా పనిచేస్తుంది',
      farmer: {
        title: 'రైతుల కోసం',
        steps: [
          'సమీప పరికరాలను బ్రౌజ్ చేయండి',
          'లభ్యత మరియు ధరలను తనిఖీ చేయండి',
          'బుకింగ్ అభ్యర్థన పంపండి',
          'పరికరాలను డెలివరీ చేయించుకోండి',
        ],
      },
      owner: {
        title: 'పరికరాల యజమానుల కోసం',
        steps: [
          'మీ పరికరాలను జాబితా చేయండి',
          'అడ్మిన్ ఆమోదం పొందండి',
          'బుకింగ్ అభ్యర్థనలను స్వీకరించండి',
          'మీ పరికరాల నుండి సంపాదించండి',
        ],
      },
    },
    cta: {
      title: 'ప్రారంభించడానికి సిద్ధంగా ఉన్నారా?',
      subtitle: 'వేలాది రైతులు మరియు పరికరాల యజమానులతో చేరండి',
      register: 'ఇప్పుడే రిజిస్టర్ చేయండి',
      login: 'లాగిన్',
      },
    },
  }

  const t = translations[language]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Tractor className="w-7 h-7 text-green-600" />
              <span className="text-lg font-bold text-gray-900">FarmGearConnect</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/marketplace" className="text-gray-700 hover:text-green-600 transition-colors text-sm">
                {t.hero.browseMarketplace}
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-green-600 transition-colors text-sm">
                {t.cta.login}
              </Link>
              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {(['ENGLISH', 'HINDI', 'TELUGU'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                      language === lang
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {lang === 'ENGLISH' ? 'EN' : lang === 'HINDI' ? 'HI' : 'TE'}
                  </button>
                ))}
              </div>
              <Link href="/register"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                {t.cta.register}
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="sm:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden overflow-hidden border-t border-gray-100 bg-white"
            >
              <div className="px-4 py-3 space-y-1">
                <Link href="/marketplace"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 font-medium text-sm transition-colors">
                  {t.hero.browseMarketplace}
                </Link>
                <Link href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-700 font-medium text-sm transition-colors">
                  {t.cta.login}
                </Link>
                <Link href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm text-center transition-colors mt-2">
                  {t.cta.register}
                </Link>
                {/* Mobile Language Switcher */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400 font-medium">Language:</span>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    {(['ENGLISH', 'HINDI', 'TELUGU'] as const).map((lang) => (
                      <button key={lang} onClick={() => { handleLanguageChange(lang); setMobileMenuOpen(false) }}
                        className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${language === lang ? 'bg-green-600 text-white' : 'text-gray-500'}`}>
                        {lang === 'ENGLISH' ? 'EN' : lang === 'HINDI' ? 'HI' : 'TE'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/hero-bg.png)' }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(4,47,25,0.82) 0%, rgba(6,78,59,0.75) 50%, rgba(5,150,105,0.6) 100%)' }} />

        {/* Animated floating orbs */}
        <motion.div animate={{ y: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-24 left-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.3), transparent)' }} />
        <motion.div animate={{ y: [0, 25, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-20 right-20 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(110,231,183,0.25), transparent)' }} />
        <motion.div animate={{ x: [0, 20, 0], y: [0, -15, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(167,243,208,0.2), transparent)' }} />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div key={i}
            animate={{ y: [0, -20, 0], x: [0, 10, 0], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
            className="absolute w-2 h-2 rounded-full bg-green-300"
            style={{ left: `${10 + i * 11}%`, top: `${20 + (i % 3) * 25}%`, opacity: 0.5 }}
          />
        ))}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20 pb-16">
          <div className="text-center">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)', color: '#a7f3d0' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Trusted by 500+ Farmers across India
            </motion.div>

            {/* Title */}
            <motion.h1
              key={language + '-title'}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight"
              style={{ textShadow: '0 4px 30px rgba(0,0,0,0.4)' }}
            >
              {t.hero.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              key={language + '-sub'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              {t.hero.subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link href="/marketplace"
                  className="inline-flex items-center justify-center gap-2 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all"
                  style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 8px 32px rgba(5,150,105,0.5)' }}>
                  {t.hero.browseMarketplace}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link href="/register?role=OWNER"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '2px solid rgba(255,255,255,0.4)', color: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                  {t.hero.listEquipment}
                </Link>
              </motion.div>
            </motion.div>

            {/* Stats row */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[{ val: '1000+', lbl: t.stats.items[0].label }, { val: '500+', lbl: t.stats.items[1].label }, { val: '2000+', lbl: t.stats.items[2].label }, { val: '4.8★', lbl: t.stats.items[3].label }].map((s, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05 }}
                  className="p-4 rounded-2xl text-center"
                  style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div className="text-2xl font-extrabold text-white">{s.val}</div>
                  <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{s.lbl}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12" style={{ display: 'block' }}>
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        {/* subtle bg decoration */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #059669, transparent)' }} />
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4" style={{ background: '#ecfdf5', color: '#059669' }}>Why Us</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{t.features.title}</h2>
            <div className="w-16 h-1 rounded-full mx-auto" style={{ background: 'linear-gradient(90deg, #059669, #10b981)' }} />
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.features.items.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.12, duration: 0.5, ease: 'easeOut' }}
                viewport={{ once: true }}
                whileHover={{ y: -8, boxShadow: '0 24px 60px rgba(5,150,105,0.18)' }}
                className="relative text-center p-8 rounded-3xl border border-gray-100 bg-white cursor-default transition-shadow"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
              >
                {/* number watermark */}
                <span className="absolute top-4 right-5 text-6xl font-black opacity-5 text-green-400 select-none">{index + 1}</span>
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
                  style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', boxShadow: '0 4px 16px rgba(5,150,105,0.2)' }}
                >
                  <feature.icon className="w-8 h-8" style={{ color: '#059669' }} />
                </motion.div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%)' }}
      >
        {/* animated bg rings */}
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 6, repeat: Infinity }}
          className="absolute -left-20 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full border-2 border-green-400" />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.12, 0.05] }} transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          className="absolute -right-20 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-2 border-green-300" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-3">{t.stats.title}</h2>
            <div className="w-16 h-1 rounded-full mx-auto" style={{ background: 'linear-gradient(90deg, #34d399, #6ee7b7)' }} />
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {t.stats.items.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.6, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.12, type: 'spring', stiffness: 200, damping: 15 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.06 }}
                className="text-center p-6 rounded-3xl"
                style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.12 }}
                  viewport={{ once: true }}
                  className="text-5xl font-black text-white mb-1"
                  style={{ textShadow: '0 0 30px rgba(52,211,153,0.5)' }}
                >{stat.value}</motion.div>
                <div className="text-green-200 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative" style={{ background: '#f8fffe' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4" style={{ background: '#ecfdf5', color: '#059669' }}>Simple Process</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{t.howItWorks.title}</h2>
            <div className="w-16 h-1 rounded-full mx-auto" style={{ background: 'linear-gradient(90deg, #059669, #10b981)' }} />
          </motion.div>
          <div className="grid md:grid-cols-2 gap-10">
            {/* Farmer Flow */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 shadow-lg"
              style={{ border: '1px solid #e6faf3' }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{t.howItWorks.farmer.title}</h3>
              </div>
              <div className="space-y-0">
                {t.howItWorks.farmer.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4 relative"
                  >
                    {/* connector line */}
                    {index < t.howItWorks.farmer.steps.length - 1 && (
                      <div className="absolute left-4 top-10 bottom-0 w-0.5" style={{ background: 'linear-gradient(to bottom, #d1fae5, transparent)' }} />
                    )}
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white z-10"
                      style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 4px 12px rgba(5,150,105,0.4)' }}
                    >{index + 1}</motion.div>
                    <div className="pb-6">
                      <p className="text-gray-700 font-medium pt-1">{step}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Owner Flow */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 shadow-lg"
              style={{ border: '1px solid #e6faf3' }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #065f46, #059669)' }}>
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{t.howItWorks.owner.title}</h3>
              </div>
              <div className="space-y-0">
                {t.howItWorks.owner.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4 relative"
                  >
                    {index < t.howItWorks.owner.steps.length - 1 && (
                      <div className="absolute left-4 top-10 bottom-0 w-0.5" style={{ background: 'linear-gradient(to bottom, #d1fae5, transparent)' }} />
                    )}
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: -5 }}
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white z-10"
                      style={{ background: 'linear-gradient(135deg, #065f46, #059669)', boxShadow: '0 4px 12px rgba(5,150,105,0.4)' }}
                    >{index + 1}</motion.div>
                    <div className="pb-6">
                      <p className="text-gray-700 font-medium pt-1">{step}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #065f46 100%)' }}
      >
        {/* Decorative rings */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.06, 0.14, 0.06] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="w-[600px] h-[600px] rounded-full border border-green-500" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.04, 0.10, 0.04] }}
          transition={{ duration: 7, repeat: Infinity, delay: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="w-[900px] h-[900px] rounded-full border border-green-400" />
        </motion.div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 150 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6" style={{ background: 'rgba(52,211,153,0.15)', color: '#6ee7b7', border: '1px solid rgba(52,211,153,0.3)' }}>Get Started Today</span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-5 leading-tight">{t.cta.title}</h2>
            <p className="text-xl mb-10" style={{ color: 'rgba(255,255,255,0.7)' }}>{t.cta.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 text-green-800 font-bold px-10 py-4 rounded-2xl transition-all"
                  style={{ background: 'linear-gradient(135deg, #6ee7b7, #34d399)', boxShadow: '0 8px 32px rgba(52,211,153,0.4)' }}
                >
                  {t.cta.register}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 font-bold px-10 py-4 rounded-2xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.25)', color: 'white', backdropFilter: 'blur(8px)' }}
                >
                  {t.cta.login}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                <Tractor className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FarmGearConnect</span>
            </div>
            <p className="mb-2 text-sm">Connecting farmers with equipment owners across India</p>
            <div className="flex items-center justify-center gap-2 my-6">
              <div className="h-px flex-1 max-w-xs" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <div className="h-px flex-1 max-w-xs" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' }} />
            </div>
            <p className="text-xs text-gray-600">© 2024 FarmGearConnect. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}
