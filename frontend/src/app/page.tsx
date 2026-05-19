'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
  ArrowRight
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [language, setLanguage] = useState<'ENGLISH' | 'TELUGU'>('ENGLISH')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage')
    if (savedLanguage) {
      setLanguage(savedLanguage as 'ENGLISH' | 'TELUGU')
    } else {
      router.push('/language-select')
    }
  }, [router])

  const t = language === 'ENGLISH' ? {
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
  } : {
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
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Tractor className="w-8 h-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">FarmGearConnect</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/marketplace"
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                {t.hero.browseMarketplace}
              </Link>
              <Link
                href="/login"
                className="text-gray-700 hover:text-green-600 transition-colors"
              >
                {t.cta.login}
              </Link>
              <Link
                href="/register"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {t.cta.register}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {t.hero.title}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors"
              >
                {t.hero.browseMarketplace}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/register?role=OWNER"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-green-600 border-2 border-green-600 px-8 py-4 rounded-xl font-semibold transition-colors"
              >
                {t.hero.listEquipment}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            {t.features.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.features.items.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <feature.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            {t.stats.title}
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {t.stats.items.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-green-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            {t.howItWorks.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Farmer Flow */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {t.howItWorks.farmer.title}
              </h3>
              <div className="space-y-4">
                {t.howItWorks.farmer.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Owner Flow */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {t.howItWorks.owner.title}
              </h3>
              <div className="space-y-4">
                {t.howItWorks.owner.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            {t.cta.title}
          </h2>
          <p className="text-xl text-green-100 mb-8">
            {t.cta.subtitle}
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-green-600 px-8 py-4 rounded-xl font-semibold transition-colors"
          >
            {t.cta.register}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Tractor className="w-6 h-6 text-green-500" />
            <span className="text-lg font-semibold text-white">FarmGearConnect</span>
          </div>
          <p className="mb-4">
            Connecting farmers with equipment owners across India
          </p>
          <p className="text-sm">
            © 2024 FarmGearConnect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
