export type Language = 'ENGLISH' | 'TELUGU'

export const translations = {
  ENGLISH: {
    // Common
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      submit: 'Submit',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
    },
    
    // Navigation
    nav: {
      home: 'Home',
      marketplace: 'Marketplace',
      myEquipment: 'My Equipment',
      bookings: 'Bookings',
      messages: 'Messages',
      notifications: 'Notifications',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
      admin: 'Admin Panel',
    },
    
    // Auth
    auth: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      phone: 'Phone Number',
      forgotPassword: 'Forgot Password?',
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: 'Already have an account?',
      signUp: 'Sign Up',
      signIn: 'Sign In',
      verifyEmail: 'Verify Email',
      enterOtp: 'Enter OTP',
      resendOtp: 'Resend OTP',
      selectRole: 'Select Role',
      farmer: 'Farmer',
      equipmentOwner: 'Equipment Owner',
    },
    
    // Equipment
    equipment: {
      title: 'Equipment',
      addNew: 'Add New Equipment',
      category: 'Category',
      brand: 'Brand',
      fuelType: 'Fuel Type',
      pricePerDay: 'Price per Day',
      pricePerHour: 'Price per Hour',
      deposit: 'Deposit Amount',
      location: 'Location',
      description: 'Description',
      specifications: 'Specifications',
      images: 'Images',
      uploadImages: 'Upload Images',
      status: 'Status',
      draft: 'Draft',
      pending: 'Pending Approval',
      approved: 'Approved',
      rejected: 'Rejected',
      nearbyEquipment: 'Nearby Equipment',
      viewDetails: 'View Details',
      bookNow: 'Book Now',
    },
    
    // Booking
    booking: {
      title: 'Bookings',
      createBooking: 'Create Booking',
      startDate: 'Start Date',
      endDate: 'End Date',
      totalAmount: 'Total Amount',
      status: 'Status',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed',
      cancelled: 'Cancelled',
      approve: 'Approve',
      reject: 'Reject',
      cancel: 'Cancel',
      complete: 'Complete',
      bookingReference: 'Booking Reference',
      farmerNote: 'Note from Farmer',
      ownerNote: 'Note from Owner',
    },
    
    // Messages
    messages: {
      title: 'Messages',
      typeMessage: 'Type a message...',
      send: 'Send',
      voiceNote: 'Voice Note',
      noMessages: 'No messages yet',
      startConversation: 'Start a conversation',
    },
    
    // Notifications
    notifications: {
      title: 'Notifications',
      markAllRead: 'Mark All as Read',
      noNotifications: 'No notifications',
    },
    
    // Profile
    profile: {
      title: 'Profile',
      editProfile: 'Edit Profile',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      state: 'State',
      district: 'District',
      village: 'Village',
      language: 'Preferred Language',
    },
    
    // Admin
    admin: {
      dashboard: 'Dashboard',
      users: 'Users',
      equipment: 'Equipment',
      bookings: 'Bookings',
      coupons: 'Coupons',
      analytics: 'Analytics',
      pendingApprovals: 'Pending Approvals',
      totalUsers: 'Total Users',
      totalEquipment: 'Total Equipment',
      totalBookings: 'Total Bookings',
      revenue: 'Revenue',
    },
  },
  
  TELUGU: {
    // Common
    common: {
      loading: 'లోడ్ అవుతోంది...',
      save: 'సేవ్ చేయండి',
      cancel: 'రద్దు చేయండి',
      delete: 'తొలగించు',
      edit: 'సవరించు',
      submit: 'సమర్పించు',
      search: 'వెతకండి',
      filter: 'ఫిల్టర్',
      sort: 'క్రమబద్ధీకరించు',
      back: 'వెనుకకు',
      next: 'తదుపరి',
      previous: 'మునుపటి',
      close: 'మూసివేయి',
      confirm: 'నిర్ధారించు',
      yes: 'అవును',
      no: 'కాదు',
    },
    
    // Navigation
    nav: {
      home: 'హోమ్',
      marketplace: 'మార్కెట్‌ప్లేస్',
      myEquipment: 'నా పరికరాలు',
      bookings: 'బుకింగ్‌లు',
      messages: 'సందేశాలు',
      notifications: 'నోటిఫికేషన్‌లు',
      profile: 'ప్రొఫైల్',
      settings: 'సెట్టింగ్‌లు',
      logout: 'లాగ్అవుట్',
      admin: 'అడ్మిన్ ప్యానెల్',
    },
    
    // Auth
    auth: {
      login: 'లాగిన్',
      register: 'రిజిస్టర్',
      email: 'ఇమెయిల్',
      password: 'పాస్‌వర్డ్',
      confirmPassword: 'పాస్‌వర్డ్ నిర్ధారించండి',
      fullName: 'పూర్తి పేరు',
      phone: 'ఫోన్ నంబర్',
      forgotPassword: 'పాస్‌వర్డ్ మర్చిపోయారా?',
      dontHaveAccount: 'ఖాతా లేదా?',
      alreadyHaveAccount: 'ఇప్పటికే ఖాతా ఉందా?',
      signUp: 'సైన్ అప్',
      signIn: 'సైన్ ఇన్',
      verifyEmail: 'ఇమెయిల్ ధృవీకరించండి',
      enterOtp: 'OTP నమోదు చేయండి',
      resendOtp: 'OTP మళ్లీ పంపండి',
      selectRole: 'పాత్ర ఎంచుకోండి',
      farmer: 'రైతు',
      equipmentOwner: 'పరికరాల యజమాని',
    },
    
    // Equipment
    equipment: {
      title: 'పరికరాలు',
      addNew: 'కొత్త పరికరం జోడించండి',
      category: 'వర్గం',
      brand: 'బ్రాండ్',
      fuelType: 'ఇంధన రకం',
      pricePerDay: 'రోజుకు ధర',
      pricePerHour: 'గంటకు ధర',
      deposit: 'డిపాజిట్ మొత్తం',
      location: 'స్థానం',
      description: 'వివరణ',
      specifications: 'వివరాలు',
      images: 'చిత్రాలు',
      uploadImages: 'చిత్రాలను అప్‌లోడ్ చేయండి',
      status: 'స్థితి',
      draft: 'డ్రాఫ్ట్',
      pending: 'ఆమోదం కోసం వేచి ఉంది',
      approved: 'ఆమోదించబడింది',
      rejected: 'తిరస్కరించబడింది',
      nearbyEquipment: 'సమీప పరికరాలు',
      viewDetails: 'వివరాలు చూడండి',
      bookNow: 'ఇప్పుడే బుక్ చేయండి',
    },
    
    // Booking
    booking: {
      title: 'బుకింగ్‌లు',
      createBooking: 'బుకింగ్ సృష్టించండి',
      startDate: 'ప్రారంభ తేదీ',
      endDate: 'ముగింపు తేదీ',
      totalAmount: 'మొత్తం మొత్తం',
      status: 'స్థితి',
      pending: 'పెండింగ్',
      approved: 'ఆమోదించబడింది',
      rejected: 'తిరస్కరించబడింది',
      completed: 'పూర్తయింది',
      cancelled: 'రద్దు చేయబడింది',
      approve: 'ఆమోదించు',
      reject: 'తిరస్కరించు',
      cancel: 'రద్దు చేయి',
      complete: 'పూర్తి చేయి',
      bookingReference: 'బుకింగ్ రిఫరెన్స్',
      farmerNote: 'రైతు నుండి గమనిక',
      ownerNote: 'యజమాని నుండి గమనిక',
    },
    
    // Messages
    messages: {
      title: 'సందేశాలు',
      typeMessage: 'సందేశం టైప్ చేయండి...',
      send: 'పంపు',
      voiceNote: 'వాయిస్ నోట్',
      noMessages: 'ఇంకా సందేశాలు లేవు',
      startConversation: 'సంభాషణ ప్రారంభించండి',
    },
    
    // Notifications
    notifications: {
      title: 'నోటిఫికేషన్‌లు',
      markAllRead: 'అన్నింటినీ చదివినట్లు గుర్తించు',
      noNotifications: 'నోటిఫికేషన్‌లు లేవు',
    },
    
    // Profile
    profile: {
      title: 'ప్రొఫైల్',
      editProfile: 'ప్రొఫైల్ సవరించు',
      changePassword: 'పాస్‌వర్డ్ మార్చు',
      currentPassword: 'ప్రస్తుత పాస్‌వర్డ్',
      newPassword: 'కొత్త పాస్‌వర్డ్',
      state: 'రాష్ట్రం',
      district: 'జిల్లా',
      village: 'గ్రామం',
      language: 'ఇష్టమైన భాష',
    },
    
    // Admin
    admin: {
      dashboard: 'డాష్‌బోర్డ్',
      users: 'వినియోగదారులు',
      equipment: 'పరికరాలు',
      bookings: 'బుకింగ్‌లు',
      coupons: 'కూపన్‌లు',
      analytics: 'విశ్లేషణలు',
      pendingApprovals: 'పెండింగ్ ఆమోదాలు',
      totalUsers: 'మొత్తం వినియోగదారులు',
      totalEquipment: 'మొత్తం పరికరాలు',
      totalBookings: 'మొత్తం బుకింగ్‌లు',
      revenue: 'ఆదాయం',
    },
  },
}

export function useTranslation(language: Language = 'ENGLISH') {
  return translations[language]
}
