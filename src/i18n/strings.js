/*
 * The interface, in both languages.
 *
 * Keys are dotted paths that name where the string lives, not the English
 * text — so fixing the English wording does not silently orphan the Nepali.
 *
 * Inventory is not here on purpose. A venue's name, a dish's description and
 * a price are what the supplier wrote; translating them would be inventing
 * them. What is here is everything the *product* says: navigation, actions,
 * labels, and the sentences that tell someone what is about to happen.
 */

export const STRINGS = {
  // ---------------------------------------------------------------- nav
  'nav.home': { en: 'Home', np: 'गृहपृष्ठ' },
  'nav.venues': { en: 'Venues', np: 'भेन्यु' },
  'nav.catering': { en: 'Catering', np: 'खानपान' },
  'nav.studios': { en: 'Studios', np: 'स्टुडियो' },
  'nav.about': { en: 'About', np: 'हाम्रो बारे' },
  'nav.cart': { en: 'Cart', np: 'कार्ट' },
  'nav.login': { en: 'Log in', np: 'लग इन' },
  'nav.logout': { en: 'Log out', np: 'लग आउट' },
  'nav.profile': { en: 'Profile', np: 'प्रोफाइल' },
  'nav.orders': { en: 'Orders', np: 'अर्डरहरू' },
  'nav.menu': { en: 'Menu', np: 'मेनु' },

  // ------------------------------------------------------------ actions
  'action.search': { en: 'Search', np: 'खोज्नुहोस्' },
  'action.book': { en: 'Book', np: 'बुक गर्नुहोस्' },
  'action.addToCart': { en: 'Add to cart', np: 'कार्टमा राख्नुहोस्' },
  'action.remove': { en: 'Remove', np: 'हटाउनुहोस्' },
  'action.cancel': { en: 'Cancel', np: 'रद्द गर्नुहोस्' },
  'action.confirm': { en: 'Confirm', np: 'पुष्टि गर्नुहोस्' },
  'action.close': { en: 'Close', np: 'बन्द गर्नुहोस्' },
  'action.back': { en: 'Back', np: 'पछाडि' },
  'action.next': { en: 'Next', np: 'अर्को' },
  'action.viewAll': { en: 'View all', np: 'सबै हेर्नुहोस्' },
  'action.chooseDates': { en: 'Choose dates', np: 'मिति छान्नुहोस्' },
  'action.shortlist': { en: 'Add to shortlist', np: 'सूचीमा राख्नुहोस्' },
  'action.unshortlist': { en: 'Remove from shortlist', np: 'सूचीबाट हटाउनुहोस्' },

  // ------------------------------------------------------------- labels
  'label.guests': { en: 'Guests', np: 'पाहुनाहरू' },
  'label.location': { en: 'Location', np: 'स्थान' },
  'label.price': { en: 'Price', np: 'मूल्य' },
  'label.capacity': { en: 'Capacity', np: 'क्षमता' },
  'label.date': { en: 'Date', np: 'मिति' },
  'label.from': { en: 'From', np: 'देखि' },
  'label.till': { en: 'Till', np: 'सम्म' },
  'label.total': { en: 'Total', np: 'जम्मा' },
  'label.paid': { en: 'Paid', np: 'भुक्तानी भएको' },
  'label.dueNow': { en: 'Due now', np: 'अहिले तिर्नुपर्ने' },
  'label.status': { en: 'Status', np: 'अवस्था' },
  'label.perPlate': { en: 'per plate', np: 'प्रति थाल' },
  'label.perEvent': { en: 'per event', np: 'प्रति कार्यक्रम' },
  'label.email': { en: 'Email', np: 'इमेल' },
  'label.phone': { en: 'Phone', np: 'फोन' },
  'label.name': { en: 'Name', np: 'नाम' },

  // ----------------------------------------------------------- statuses
  'status.draft': { en: 'Draft', np: 'ड्राफ्ट' },
  'status.pending': { en: 'Pending', np: 'पर्खाइमा' },
  'status.confirmed': { en: 'Confirmed', np: 'पक्का भयो' },
  'status.completed': { en: 'Completed', np: 'सम्पन्न' },
  'status.cancelled': { en: 'Cancelled', np: 'रद्द' },

  // ---------------------------------------------------------- occasions
  'occasion.wedding': { en: 'Wedding', np: 'विवाह' },
  'occasion.bratabandha': { en: 'Bratabandha', np: 'व्रतबन्ध' },
  'occasion.pasni': { en: 'Pasni', np: 'पास्नी' },
  'occasion.mehendi': { en: 'Mehendi & Sangeet', np: 'मेहेन्दी र संगीत' },
  'occasion.corporate': { en: 'Corporate', np: 'कर्पोरेट' },
  'occasion.anniversary': { en: 'Anniversary', np: 'वार्षिकोत्सव' },

  // ------------------------------------------------------------- header
  'home.eyebrow': { en: 'Weddings & events · Nepal', np: 'विवाह र कार्यक्रम · नेपाल' },
  'home.ctaVenue': { en: 'Start with a venue', np: 'भेन्युबाट सुरु गर्नुहोस्' },
  'home.ctaCatering': { en: 'Browse catering', np: 'खानपान हेर्नुहोस्' },
  'home.plan': { en: 'Your plan', np: 'तपाईंको योजना' },
  'home.planEmpty': { en: 'Nothing chosen yet', np: 'अहिलेसम्म केही छानिएको छैन' },
  'home.runningTotal': { en: 'Running total', np: 'हालको जम्मा' },
  'home.checkDate': { en: 'Check a date', np: 'मिति जाँच्नुहोस्' },

  // -------------------------------------------------------------- money
  'pay.khalti': { en: 'Khalti', np: 'खल्ती' },
  'pay.fonepay': { en: 'Fonepay', np: 'फोनपे' },
  'pay.cash': { en: 'Cash after service', np: 'सेवापछि नगद' },
  'pay.full': { en: 'Pay in full', np: 'पूरा भुक्तानी' },
  'pay.advance': { en: 'Pay 25% now', np: 'अहिले २५% तिर्नुहोस्' },

  // ------------------------------------------------------------- states
  'state.loading': { en: 'Loading…', np: 'लोड हुँदैछ…' },
  'state.empty': { en: 'Nothing here yet', np: 'यहाँ अहिले केही छैन' },
  'state.error': { en: 'Something went wrong', np: 'केही गडबड भयो' },
  'state.tryAgain': { en: 'Try again', np: 'फेरि प्रयास गर्नुहोस्' },
}

export default STRINGS
