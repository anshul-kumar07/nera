import { LanguageCode } from '@/lib/i18n'

export interface FAQItem {
  id: string
  category: 'GENERAL' | 'ADMIN' | 'POLICE' | 'CITIZEN' | 'TECH'
  question: string
  answer: string
  highlights?: string[]
}

const EN_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'GENERAL',
    question: 'What is NERA and what problem does it solve in North East India?',
    answer: 'NERA (North East Disaster Logistics & Resilient Routing Platform) is an enterprise-grade emergency logistics command and resilient routing engine designed specifically for the 8 North Eastern States. It tackles severe monsoon disruptions, hill landslides, bridge scourings, and river floods by fusing dynamic GIS routing with real-time multi-agency sensor feeds (IMD Doppler, GSI LEWS, CWC Hydrographs, and BRO telemetry).',
    highlights: ['Multi-Modal Routing (Road, Airlift, Riverine)', '8 North Eastern States Coverage', 'Offline First Architecture'],
  },
  {
    id: 'faq-2',
    category: 'ADMIN',
    question: 'How does NERA calculate dynamic bypass trajectories when a highway is severed?',
    answer: 'The system uses a modified Dijkstra multi-criteria graph engine embedded with elevation models and real-time incident penalties. When a road is blocked (e.g. NH-27 at Dima Hasao), the algorithm assigns an infinite cost weight to the severed segment, queries connected bypass corridors (such as NH-6 via Shillong or IAF helicopter airbridges), and computes the fastest safe trajectory with bridge load gating and mountain fuel burn adjustments.',
    highlights: ['Automated Dynamic Bypass Calculation', 'Bridge Class Rating Gate (24T max)', 'Mountain Fuel & Forward Refuel Points (FRP)'],
  },
  {
    id: 'faq-3',
    category: 'POLICE',
    question: 'What is the statutory role of Police Officers under Section 187 of BNSS 2023?',
    answer: 'Under Section 187 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023, law enforcement officers and highway patrols have statutory authority to regulate highway corridors, enforce vehicular diversions, and clear emergency relief lanes during natural disasters. In NERA, reports filed by Police OCs receive Statutory Weight 9.5 priority, instantly triggering an admin auto-reroute review banner on the State EOC live map.',
    highlights: ['BNSS 2023 Sec 187 Authority', 'Statutory Weight 9.5 Priority', 'Instant State EOC Auto-Reroute Review'],
  },
  {
    id: 'faq-4',
    category: 'CITIZEN',
    question: 'How do citizens and village committees track arriving medicines and food supplies?',
    answer: 'Citizens can access the public Citizen Portal at /portal/citizen without administrative login. The portal renders live delivery countdown cards showing what essential supplies (anti-venom, pediatric vaccines, oxygen cylinders, dry rations) are in transit, the vehicle type, ETA countdown, and designated Village Access Point (VAP) distribution centers (e.g., Primary Health Centres or local schools).',
    highlights: ['Public Delivery Tracker (/portal/citizen)', 'Live ETA & Countdown', 'Designated Village Access Points (VAP)'],
  },
  {
    id: 'faq-5',
    category: 'TECH',
    question: 'How does the platform function when a convoy enters a cellular blackout zone?',
    answer: 'NERA is built local-first. Map vector tiles, route geometries, and emergency checklists are cached locally in IndexedDB. In cellular blackout zones (such as deep river gorges or mountain passes), telemetry is maintained via VHF radio repeater relays (Emergency Channel 14 at 156.700 MHz) and onboard dead-reckoning sensors. When connectivity returns, local queues automatically synchronize with Supabase Realtime.',
    highlights: ['IndexedDB Offline Caching', 'VHF Radio Repeater Node Relay (CH-14)', 'Automatic Cloud Sync upon Reconnection'],
  },
  {
    id: 'faq-6',
    category: 'ADMIN',
    question: 'What is the 8-Point Physical Safety Gate required before dispatching a vehicle on /vehicles?',
    answer: 'Before any vehicle can depart on a critical relief mission, administrators must verify 8 mandatory physical readiness checks: 1. AIS-140 GPS Telemetry & SOS button, 2. Dual-Braking & Hill Descent Control, 3. Severe Weather Grade All-Terrain Tires, 4. Heavy-Duty Winch & Recovery Kit, 5. Cold-Chain PCM Power (for vaccines), 6. Trauma First-Aid & Oxygen, 7. VHF Emergency Radio & GPS, and 8. Fitness Certificate Compliance. Admins can sign an official statutory certification override if required.',
    highlights: ['8 Mandatory Hardware Checkpoints', 'AIS-140 & SOS Integration', 'Cold-Chain 2-8°C Active Monitoring'],
  },
]

const HI_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'GENERAL',
    question: 'NERA क्या है और यह उत्तर पूर्व भारत में क्या समस्या हल करता है?',
    answer: 'NERA (उत्तर पूर्व आपदा रसद एवं सुदृढ़ मार्ग मंच) 8 पूर्वोत्तर राज्यों के लिए विशेष रूप से डिजाइन किया गया एक आपातकालीन रसद और मार्ग प्रबंधन प्रणाली है। यह भारी मानसून, भूस्खलन, पुल टूटने और बाढ़ के समय वास्तविक समय में मौसम (IMD), भूस्खलन (GSI) और नदी जल स्तर (CWC) डेटा का उपयोग करके सुरक्षित बाईपास मार्ग प्रदान करता है।',
    highlights: ['मल्टी-मॉडल रूटिंग (सड़क, हवाई, जलमार्ग)', '8 पूर्वोत्तर राज्यों का पूर्ण कवरेज', 'ऑफ़लाइन-फर्स्ट तकनीक'],
  },
  {
    id: 'faq-2',
    category: 'ADMIN',
    question: 'राजमार्ग अवरुद्ध होने पर NERA वैकल्पिक मार्ग (Bypass) की गणना कैसे करता है?',
    answer: 'सिस्टम उन्नत ग्राफ एल्गोरिदम और इलाके की ऊंचाई मॉडल का उपयोग करता है। जब कोई सड़क बंद होती है (जैसे दीमा हसाओ में NH-27), तो यह तुरंत खुले बाईपास कॉरिडोर (जैसे शिलांग के रास्ते NH-6 या वायु सेना के हेलीकॉप्टर) की गणना करता है और पुल की भार क्षमता तथा पहाड़ी ईंधन खपत की गणना करता है।',
    highlights: ['स्वचालित बाईपास गणना', 'पुल भार क्षमता सुरक्षा (अधिकतम 24 टन)', 'पहाड़ी ईंधन और रिफ्यूलिंग बिंदु'],
  },
  {
    id: 'faq-3',
    category: 'POLICE',
    question: 'BNSS 2023 की धारा 187 के तहत पुलिस अधिकारियों की क्या भूमिका है?',
    answer: 'भारतीय नागरिक सुरक्षा संहिता (BNSS) 2023 की धारा 187 के तहत पुलिस अधिकारियों के पास प्राकृतिक आपदाओं के दौरान यातायात डायवर्जन लागू करने और राहत लेन को खाली कराने का वैधानिक अधिकार है। पुलिस द्वारा दर्ज की गई रिपोर्ट को सर्वोच्च प्राथमिकता (वेटेज 9.5) दी जाती है, जिससे स्टेट कमांड मैप पर तुरंत अलर्ट जारी होता है।',
    highlights: ['BNSS 2023 धारा 187 अधिकार', 'वैधानिक प्राथमिकता 9.5', 'राज्य EOC को तत्काल स्वचालित चेतावनी'],
  },
  {
    id: 'faq-4',
    category: 'CITIZEN',
    question: 'नागरिक और ग्राम समितियां दवाओं और भोजन की आपूर्ति को कैसे ट्रैक करते हैं?',
    answer: 'नागरिक बिना लॉगिन किए /portal/citizen पर सार्वजनिक ट्रैकर देख सकते हैं। यह पोर्टल आने वाली आवश्यक आपूर्ति (एंटी-वेनम, टीके, ऑक्सीजन सिलेंडर, सूखा राशन) की वास्तविक समय में डिलीवरी स्थिति, वाहन का प्रकार, पहुंचने का अनुमानित समय (ETA) और ग्राम वितरण केंद्र (VAP) दिखाता है।',
    highlights: ['सार्वजनिक डिलीवरी ट्रैकर (/portal/citizen)', 'लाइव ETA और उलटी गिनती', 'नामित ग्राम वितरण बिंदु (VAP)'],
  },
  {
    id: 'faq-5',
    category: 'TECH',
    question: 'मोबाइल नेटवर्क न होने पर (Blackout Zone) यह प्लेटफॉर्म कैसे काम करता है?',
    answer: 'NERA ऑफ़लाइन-फर्स्ट तकनीक पर आधारित है। सभी मैप टाइल्स और आपातकालीन चेकलिस्ट स्थानीय रूप से IndexedDB में सुरक्षित रहते हैं। नेटवर्क न होने पर VHF रेडियो (चैनल 14, 156.700 MHz) द्वारा संचार जारी रहता है और नेटवर्क आने पर डेटा स्वतः क्लाउड से सिंक हो जाता है।',
    highlights: ['IndexedDB ऑफ़लाइन कैशिंग', 'VHF रेडियो रिले (चैनल 14)', 'पुनः कनेक्ट होने पर स्वचालित सिंक'],
  },
  {
    id: 'faq-6',
    category: 'ADMIN',
    question: 'वाहन रवाना करने से पहले 8-बिंदु भौतिक सुरक्षा जांच क्या है?',
    answer: 'राहत मिशन पर वाहन रवाना करने से पहले 8 अनिवार्य जांचें पूरी की जाती हैं: 1. AIS-140 जीपीएस एवं एसओएस, 2. डुअल ब्रेकिंग और हिल डिसेंट कंट्रोल, 3. ऑल-टेरेन टायर, 4. हेवी-ड्यूटी विंच, 5. कोल्ड-चेन वैक्सीन तापमान (2-8°C), 6. प्राथमिक चिकित्सा एवं ऑक्सीजन, 7. VHF आपातकालीन रेडियो, और 8. फिटनेस प्रमाण पत्र।',
    highlights: ['8 अनिवार्य हार्डवेयर चेकपॉइंट', 'AIS-140 और SOS एकीकरण', 'कोल्ड-चेन 2-8°C सक्रिय निगरानी'],
  },
]

const AS_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'GENERAL',
    question: 'NERA কি আৰু ই উত্তৰ-পূব ভাৰতত কি সমস্যা সমাধান কৰে?',
    answer: 'NERA হৈছে উত্তৰ-পূৰ্বাঞ্চলৰ ৮খন ৰাজ্যৰ বাবে বিশেষভাৱে প্ৰস্তুত কৰা এক জৰুৰীকালীন দুৰ্যোগ যোগান আৰু পথ ব্যৱস্থাপনা ব্যৱস্থা। বাৰিষাৰ ভূমিস্খলন, বানপানী আৰু দলং ভঙাৰ সময়ত ই সঠিক বৈকল্পিক পথ আৰু বিমান সেৱাৰ ব্যৱস্থা কৰে।',
    highlights: ['বহু-মাধ্যম পথ নিৰ্ধাৰণ (পথ, বিমান, জলপথ)', '৮খন উত্তৰ-পূৰ্ব ৰাজ্যৰ সম্পূৰ্ণ কভাৰেজ', 'অফলাইন প্ৰযুক্তি'],
  },
  {
    id: 'faq-2',
    category: 'ADMIN',
    question: 'ৰাষ্ট্ৰীয় ঘাইপথ বন্ধ হ’লে NERA এ কেনেকৈ বৈকল্পিক পথ নিৰ্ণয় কৰে?',
    answer: 'এই ব্যৱস্থাই উন্নত এলগৰিদম ব্যৱহাৰ কৰে। যেতিয়া এটা পথ বন্ধ হয় (যেনে ডিমা হাছাওৰ NH-27), ই লগে লগে মুকলি থকা অন্য পথ বা হেলিকপ্টাৰ সেৱাৰ তথ্য প্ৰদান কৰে।',
    highlights: ['স্বয়ংক্ৰিয় বৈকল্পিক পথ গণনা', 'দলঙৰ ওজন ক্ষমতা পৰীক্ষা (২৪ টন সৰ্বোচ্চ)', 'ইন্ধন সংৰক্ষণ পৰিকল্পনা'],
  },
  {
    id: 'faq-3',
    category: 'POLICE',
    question: 'BNSS ২০২৩ ৰ ধাৰা ১৮৭ ৰ অধীনত আৰক্ষী বিষয়াৰ ভূমিকা কি?',
    answer: 'BNSS ২০২৩ ৰ ধাৰা ১৮৭ ৰ অধীনত আৰক্ষী আৰু বিআৰঅ’ বিষয়াৰ দুৰ্যোগৰ সময়ত যান-বাহন চলাচল নিয়ন্ত্ৰণ আৰু পথ বন্ধ ঘোষণা কৰাৰ সাংবিধানিক অধিকাৰ আছে।',
    highlights: ['BNSS ২০২৩ ধাৰা ১৮৭ অধিকাৰ', 'বিধিবদ্ধ অগ্ৰাধিকাৰ ৯.৫', 'ৰাজ্যিক EOC লৈ তৎক্ষণাৎ সংকেত'],
  },
  {
    id: 'faq-4',
    category: 'CITIZEN',
    question: 'ৰাইজে সাহায্য আৰু দৰব অহাৰ সময় কেনেকৈ ট্ৰেক কৰিব পাৰে?',
    answer: 'ৰাইজে /portal/citizen যোগেদি কোনো পাছৱৰ্ড নোহোৱাকৈয়ে অত্যাৱশ্যকীয় সামগ্ৰী (ভেকচিন, অক্সিজেন, খাদ্য) কঢ়িওৱা বাহন আৰু বিতৰণ কেন্দ্ৰৰ সঠিক সময় জানিব পাৰে।',
    highlights: ['ৰাজহুৱা ট্ৰেকিং পৰ্টেল', 'লাইভ সময় গণনা', 'নিৰ্ধাৰিত গাঁও বিতৰণ কেন্দ্ৰ (VAP)'],
  },
  {
    id: 'faq-5',
    category: 'TECH',
    question: 'মোবাইল নেটৱৰ্ক নথকা অঞ্চলত এই পৰ্টেলে কেনেকৈ কাম কৰে?',
    answer: 'NERA ত অফলাইন কাৰ্যপ্ৰণালী আছে। নেটৱৰ্ক নথকা স্থানত VHF ৰেডিঅ’ (চেনেল ১৪) আৰু মেপ ডিভাইচত মজুত থাকে আৰু নেটৱৰ্ক পোৱাৰ লগে লগে তথ্য আপডেট হয়।',
    highlights: ['IndexedDB অফলাইন সংৰক্ষণ', 'VHF ৰেডিঅ’ ৰিলে (চেনেল ১৪)', 'স্বয়ংক্ৰিয় ক্লাউড সংমিশ্ৰণ'],
  },
]

const BN_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'GENERAL',
    question: 'NERA কী এবং এটি উত্তর-পূর্ব ভারতে কী সমস্যা সমাধান করে?',
    answer: 'NERA হল উত্তর-পূর্বাঞ্চলের ৮টি রাজ্যের জন্য তৈরি একটি জরুরি দুর্যোগ ত্রাণ ও রসদ ব্যবস্থাপনা প্ল্যাটফর্ম। পাহাড়ি ধস, বন্যা ও সেতু ক্ষতির সময় এটি সঠিক নিরাপদ বিকল্প রুট ও হেলিকপ্টার সহায়তা নিশ্চিত করে।',
    highlights: ['বহু-মাধ্যম রুট (সড়ক, বিমান, নদী)', '৮টি উত্তর-পূর্ব রাজ্যের কভারেজ', 'অফলাইন আর্কিটেকচার'],
  },
  {
    id: 'faq-2',
    category: 'ADMIN',
    question: 'সড়ক বন্ধ হলে NERA কীভাবে বিকল্প রুট নির্ধারণ করে?',
    answer: 'সিস্টেমটি উন্নত গ্রাফ অ্যালগরিদম ব্যবহার করে। যখন কোনো মহাসড়ক বন্ধ হয়, এটি স্বয়ংক্রিয়ভাবে উন্মুক্ত বাইপাস রুট ও সেতুর ওজন ক্ষমতা যাচাই করে দ্রুততম নিরাপদ রুট প্রদর্শন করে।',
    highlights: ['স্বয়ংক্রিয় বাইপাস গণনা', 'সেতু লোড রেটিং গেট', 'পাহাড়ি জ্বালানি ব্যবস্থাপনা'],
  },
  {
    id: 'faq-3',
    category: 'POLICE',
    question: 'BNSS ২০২৩ এর ধারা ১৮৭ এর অধীনে পুলিশের ভূমিকা কী?',
    answer: 'BNSS ২০২৩ এর ধারা ১৮৭ অনুসারে দুর্যোগের সময় পুলিশ ও বিআরও কর্মকর্তাদের ট্রাফিক নিয়ন্ত্রণ ও জরুরি লেন খালি করার পূর্ণ আইনি কর্তৃত্ব রয়েছে।',
    highlights: ['BNSS ২০২৩ ধারা ১৮৭', 'আইনি অগ্রাধিকার ৯.৫', 'তাত্ক্ষণিক রাজ্য EOC পর্যালোচনা'],
  },
  {
    id: 'faq-4',
    category: 'CITIZEN',
    question: 'নাগরিকরা কীভাবে প্রয়োজনীয় ওষুধ ও খাদ্য সামগ্রীর আগমন ট্র্যাক করবেন?',
    answer: 'নাগরিকরা /portal/citizen এ সরাসরি ত্রাণ সরবরাহ, অক্সিজেন, ওষুধ এবং পৌঁছানোর আনুমানিক সময় (ETA) দেখতে পাবেন।',
    highlights: ['পাবলিক ট্র্যাকার', 'লাইভ কাউন্টডাউন', 'গ্রাম বিতরণ পয়েন্ট (VAP)'],
  },
]

const MN_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'GENERAL',
    question: 'NERA হায়বসি করিনো অমসুং মসিনা নোংপোক-চিংশাং লমদমদা করি কান্নবা পীবগে?',
    answer: 'NERA অসিনা নোংপোক-চিংশাংগী রাজ্য ৮গীদমক অখন্নবা খুদোংথিবা মতমগী পোৎলম য়েন্থোকপা অমসুং লম্বী য়েংশিনবগী প্লেতফোৰ্মনি। নোং-চিংনা মরম ওইদুনা লম্বী থিংবদা মসিগী খুত্থাংদা অতোপ্পা লম্বী অমসুং হেলিকপ্তৰ ফংহল্লি।',
    highlights: ['মখল কয়াগী লম্বী (লম্বী, পাইবা, ঈশিং)', 'রাজ্য ৮ কভরেজ', 'ওফলাইন তৌবা য়াবা'],
  },
  {
    id: 'faq-2',
    category: 'ADMIN',
    question: 'লম্বী থিংলবদি NERA না করম্না অতোপ্পা লম্বী থিদোকই?',
    answer: 'সিস্তেম অসিনা এআই এলগোরিদম শীজিন্নদুনা লম্বী থিংলবা মতমদা থোংগী ফীভম অমসুং অথোইবা অতোপ্পা লম্বী মশানা থিদোকই।',
    highlights: ['অতোপ্পা লম্বী মশানা থিবা', 'থোংগী অকিবগী চাং য়েংবা', 'থাও শিজিন্নবগী চাং'],
  },
  {
    id: 'faq-3',
    category: 'POLICE',
    question: 'BNSS ২০২৩ গী সেক্সন ১৮৭ গী মখাদা পুলিসকী থৌদাং করিনো?',
    answer: 'BNSS ২০২৩ গী মখাদা পুলিস ওফিসারশিংনা খুদোংথিবা মতমদা লম্বী ত্রাফিক য়েংশিনবা অমসুং ত্রাণ গারিশিংগীদমক লম্বী হাংহনবগী আইনগী হক লৈ।',
    highlights: ['BNSS ২০২৩ সেক্সন ১৮৭', 'আইনগী প্রায়োরিতি ৯.৫', 'ষ্টেত কমান্দদা পাউ পীব'],
  },
  {
    id: 'faq-4',
    category: 'CITIZEN',
    question: 'মীচম মীয়াম্না হিদাক-লাংথক অমসুং চিঞ্জাক য়ৌরকপা করম্না ত্রেক তৌগনি?',
    answer: 'মীয়াম্না /portal/citizen দা চঙলগা হিদাক-লাংথক, ওক্সিজেন অমসুং চিঞ্জাক পুরক্লিবা গারি অমসুং মতম য়েংবা য়াগনি।',
    highlights: ['মীয়ামগী ত্রেক তৌনবগী পোৰ্তেল', 'লাইভ মতম য়েংবা', 'খুঙ্গংগী য়েন্থোকফম মফম (VAP)'],
  },
]

export function getFAQDatabase(lang: LanguageCode): FAQItem[] {
  switch (lang) {
    case 'hi':
      return HI_FAQS
    case 'as':
      return AS_FAQS
    case 'bn':
      return BN_FAQS
    case 'mn':
      return MN_FAQS
    case 'en':
    default:
      return EN_FAQS
  }
}

