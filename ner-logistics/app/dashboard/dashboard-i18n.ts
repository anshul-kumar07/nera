import { LanguageCode } from '@/lib/i18n'

export interface DashboardTranslations {
  hero_title: string
  hero_sub: string
  btn_sms_simulator: string
  btn_live_map: string
  btn_authorize_missions: string
  btn_report_incident: string
  kpi_convoys_label: string
  kpi_convoys_val: string
  kpi_convoys_sub: string
  kpi_lifelines_label: string
  kpi_lifelines_sub: string
  kpi_hazards_label: string
  kpi_hazards_val: string
  kpi_hazards_sub: string
  kpi_porters_label: string
  kpi_porters_val: string
  kpi_porters_sub: string
  missions_table_title: string
  missions_table_sub: string
  filter_all: string
  filter_critical: string
  filter_high: string
  th_id_cargo: string
  th_severity: string
  th_origin_vap: string
  th_vehicle_mode: string
  th_status: string
  th_progress_eta: string
  alerts_title: string
  alerts_sub: string
  btn_engage_bypass: string
  depots_title: string
  depots_sub: string
  fleet_title: string
  fleet_sub: string
  btn_view_full_fleet: string
  btn_view_full_map: string
  showing_missions: string
  authority_label: string
}

export const DASHBOARD_I18N: Record<LanguageCode, DashboardTranslations> = {
  en: {
    hero_title: 'TACTICAL INCIDENT & LOGISTICS COMMAND GRID',
    hero_sub: 'Government of India • NDMA & MDoNER National Disaster Supply Chain & Multi-Modal Routing Matrix',
    btn_sms_simulator: 'MOBILE SMS SIMULATOR',
    btn_live_map: 'LIVE GIS MAP',
    btn_authorize_missions: 'AUTHORIZE MISSIONS',
    btn_report_incident: 'REPORT INCIDENT',
    kpi_convoys_label: 'ACTIVE RELIEF CONVOYS',
    kpi_convoys_val: '{count} Active',
    kpi_convoys_sub: 'Pan-India & Regional Depots En Route',
    kpi_lifelines_label: 'PASSABLE LIFELINES',
    kpi_lifelines_sub: '{count} Disrupted • Dynamic Bypasses Active',
    kpi_hazards_label: 'PRIORITY HAZARD LOGS',
    kpi_hazards_val: '{count} Directives',
    kpi_hazards_sub: 'Police OC (10.0) & BRO Field Verification',
    kpi_porters_label: 'VAP LAST-MILE PORTER RELAYS',
    kpi_porters_val: '18 Teams Active',
    kpi_porters_sub: 'Village Defence Parties & Drone Squadrons',
    missions_table_title: 'Active Multi-Modal Relief Missions & VAP Roadhead Dispatch',
    missions_table_sub: 'Live telemetry tracking from Strategic Pan-India Origins to NER Last-Mile Roadheads',
    filter_all: 'ALL',
    filter_critical: 'CRITICAL',
    filter_high: 'HIGH',
    th_id_cargo: 'Mission ID & Cargo',
    th_severity: 'Severity',
    th_origin_vap: 'Origin Hub ➔ Target VAP',
    th_vehicle_mode: 'Vehicle & Mode',
    th_status: 'Status',
    th_progress_eta: 'Progress & ETA',
    alerts_title: 'PRIORITY HAZARD DIRECTIVES',
    alerts_sub: 'Statutory Authority Weighting (Weights 7.0–10.0)',
    btn_engage_bypass: 'Engage Alternate Bypass',
    depots_title: 'Pan-India Strategic Depots & Staging Airbases',
    depots_sub: 'Real-time inventory levels of pediatric vaccines, blood plasma, oxygen and rations',
    fleet_title: 'Multi-Modal Vehicle Fleet Readiness & Safety Gates',
    fleet_sub: 'Real-time AIS-140 GPS telemetry, fuel margins and 8-point physical safety gate clearances',
    btn_view_full_fleet: 'View Full Fleet Matrix →',
    btn_view_full_map: 'Open Full Tactical Map →',
    showing_missions: 'Showing {count} active live missions • AIS-140 GPS Synced',
    authority_label: 'Authority:',
  },
  hi: {
    hero_title: 'रणनीतिक आपदा एवं रसद कमान ग्रिड',
    hero_sub: 'भारत सरकार • NDMA एवं MDoNER राष्ट्रीय आपदा आपूर्ति श्रृंखला एवं मल्टी-मॉडल रूटिंग मैट्रिक्स',
    btn_sms_simulator: 'मोबाइल SMS सिम्युलेटर',
    btn_live_map: 'लाइव GIS मानचित्र',
    btn_authorize_missions: 'मिशन स्वीकृत करें',
    btn_report_incident: 'आपदा रिपोर्ट करें',
    kpi_convoys_label: 'सक्रिय राहत काफिले',
    kpi_convoys_val: '{count} सक्रिय',
    kpi_convoys_sub: 'अखिल भारतीय एवं क्षेत्रीय डिपो मार्ग में',
    kpi_lifelines_label: 'चालू सुरक्षित मार्ग',
    kpi_lifelines_sub: '{count} बाधित • गतिशील बाईपास सक्रिय',
    kpi_hazards_label: 'प्राथमिकता खतरा निर्देश',
    kpi_hazards_val: '{count} निर्देश',
    kpi_hazards_sub: 'पुलिस OC (10.0) एवं BRO फील्ड सत्यापन',
    kpi_porters_label: 'अंतिम छोर पोर्टर एवं ड्रोन दल',
    kpi_porters_val: '18 टीमें सक्रिय',
    kpi_porters_sub: 'ग्राम रक्षा दल एवं ड्रोन स्क्वाड्रन',
    missions_table_title: 'सक्रिय मल्टी-मॉडल राहत मिशन एवं ग्राम वितरण प्रेषण',
    missions_table_sub: 'अखिल भारतीय डिपो से अंतिम मील वितरण बिंदुओं तक लाइव टेलीमेट्री ट्रैकिंग',
    filter_all: 'सभी (ALL)',
    filter_critical: 'अति गंभीर (CRITICAL)',
    filter_high: 'उच्च (HIGH)',
    th_id_cargo: 'मिशन आईडी एवं सामग्री',
    th_severity: 'गंभीरता',
    th_origin_vap: 'उद्गम डिपो ➔ लक्ष्य वितरण केंद्र',
    th_vehicle_mode: 'वाहन एवं साधन',
    th_status: 'स्थिति',
    th_progress_eta: 'प्रगति एवं पहुंचने का समय',
    alerts_title: 'प्राथमिकता खतरा निर्देश',
    alerts_sub: 'वैधानिक प्राथमिकता भार (7.0 - 10.0)',
    btn_engage_bypass: 'वैकल्पिक बाईपास लागू करें',
    depots_title: 'अखिल भारतीय रणनीतिक डिपो एवं एयरबेस',
    depots_sub: 'टीकों, ब्लड प्लाज्मा, ऑक्सीजन और राशन का वास्तविक समय स्टॉक स्तर',
    fleet_title: 'मल्टी-मॉडल वाहन बेड़ा एवं सुरक्षा गेट',
    fleet_sub: 'वास्तविक समय AIS-140 जीपीएस टेलीमेट्री, ईंधन स्तर एवं 8-बिंदु सुरक्षा जांच',
    btn_view_full_fleet: 'पूर्ण बेड़ा मैट्रिक्स देखें →',
    btn_view_full_map: 'संपूर्ण रणनीतिक मानचित्र खोलें →',
    showing_missions: '{count} सक्रिय लाइव मिशन प्रदर्शित • AIS-140 जीपीएस सिंक',
    authority_label: 'प्राधिकरण:',
  },
  as: {
    hero_title: 'ৰণনীতিমূলক দুৰ্যোগ আৰু যোগান কমাণ্ড গ্ৰিড',
    hero_sub: 'ভাৰত চৰকাৰ • NDMA আৰু MDoNER ৰাষ্ট্ৰীয় দুৰ্যোগ সাহায্য আৰু বহু-মাধ্যম পথ ব্যৱস্থা',
    btn_sms_simulator: 'ম’বাইল SMS ছিমুলেটৰ',
    btn_live_map: 'লাইভ GIS মেপ',
    btn_authorize_missions: 'অভিযান অনুমোদন কৰক',
    btn_report_incident: 'দুৰ্যোগৰ তথ্য দিয়ক',
    kpi_convoys_label: 'সক্ৰিয় সাহায্য কনভয়',
    kpi_convoys_val: '{count} সক্ৰিয়',
    kpi_convoys_sub: 'ৰাষ্ট্ৰীয় আৰু আঞ্চলিক ডিপোৰ পৰা পথত',
    kpi_lifelines_label: 'চলনক্ষম সুৰক্ষিত পথসমূহ',
    kpi_lifelines_sub: '{count} বাধাগ্ৰস্ত • বৈকল্পিক পথ সক্ৰিয়',
    kpi_hazards_label: 'বিধিবদ্ধ বিপদ নিৰ্দেশনা',
    kpi_hazards_val: '{count} নিৰ্দেশনা',
    kpi_hazards_sub: 'আৰক্ষী আৰু বিআৰঅ’ৰ দ্বাৰা নিশ্চিত',
    kpi_porters_label: 'অন্তিম মাইল সাহায্য দল',
    kpi_porters_val: '১৮টা দল সক্ৰিয়',
    kpi_porters_sub: 'গাঁও সুৰক্ষা বাহিনী আৰু ড্ৰোন দল',
    missions_table_title: 'সক্ৰিয় বহু-মাধ্যম সাহায্য অভিযান আৰু পথ প্ৰেৰণ',
    missions_table_sub: 'ৰাষ্ট্ৰীয় মূল কেন্দ্ৰৰ পৰা দুৰ্গম গাঁও কেন্দ্ৰলৈ লাইভ নিৰীক্ষণ',
    filter_all: 'সকলো (ALL)',
    filter_critical: 'অত্যন্ত জৰুৰী (CRITICAL)',
    filter_high: 'উচ্চ (HIGH)',
    th_id_cargo: 'অভিযান ID আৰু সামগ্ৰী',
    th_severity: 'মাত্ৰা',
    th_origin_vap: 'মূল ডিপো ➔ বিতৰণ কেন্দ্ৰ',
    th_vehicle_mode: 'বাহন আৰু মাধ্যম',
    th_status: 'স্থিতি',
    th_progress_eta: 'প্ৰগতি আৰু সময়',
    alerts_title: 'বিধিবদ্ধ বিপদ নিৰ্দেশনা',
    alerts_sub: 'আইনী অগ্ৰাধিকাৰ (৭.০ - ১০.০)',
    btn_engage_bypass: 'বৈকল্পিক পথ প্ৰয়োগ কৰক',
    depots_title: 'ৰাষ্ট্ৰীয় ডিপো আৰু বিমান ঘাটিসমূহ',
    depots_sub: 'ভেকচিন, তেজ, অক্সিজেন আৰু খাদ্যৰ লাইভ ভঁৰাল তথ্য',
    fleet_title: 'বাহনৰ সাজু অৱস্থা আৰু ভৌতিক সুৰক্ষা',
    fleet_sub: 'লাইভ AIS-140 GPS, ইন্ধন আৰু ৮-পইণ্ট সুৰক্ষা পৰীক্ষা',
    btn_view_full_fleet: 'সম্পূৰ্ণ বাহন তালিকা চাওক →',
    btn_view_full_map: 'সম্পূৰ্ণ মেপ খোলক →',
    showing_missions: '{count}টা সক্ৰিয় অভিযান প্ৰদৰ্শিত • AIS-140 GPS সংলগ্ন',
    authority_label: 'কৰ্তৃপক্ষ:',
  },
  bn: {
    hero_title: 'কৌশলগত দুর্যোগ ও রসদ কমান্ড গ্রিড',
    hero_sub: 'ভারত সরকার • NDMA ও MDoNER জাতীয় দুর্যোগ সরবরাহ শৃঙ্খল এবং রুট ম্যাট্রিক্স',
    btn_sms_simulator: 'মোবাইল এসএমএস সিমুলেটর',
    btn_live_map: 'লাইভ জিআইএস মানচিত্র',
    btn_authorize_missions: 'মিশন অনুমোদন করুন',
    btn_report_incident: 'ঘটনা রিপোর্ট করুন',
    kpi_convoys_label: 'সক্রিয় ত্রাণ কনভয়',
    kpi_convoys_val: '{count} সক্রিয়',
    kpi_convoys_sub: 'জাতীয় ও আঞ্চলিক ডিপো থেকে পথে রয়েছে',
    kpi_lifelines_label: 'সচল নিরাপদ সড়কসমূহ',
    kpi_lifelines_sub: '{count} ক্ষতিগ্রস্ত • বিকল্প রুট সক্রিয়',
    kpi_hazards_label: 'অগ্রাধিকার বিপদ নির্দেশিকা',
    kpi_hazards_val: '{count} নির্দেশনা',
    kpi_hazards_sub: 'পুলিশ ও বিআরও দ্বারা যাচাইকৃত',
    kpi_porters_label: 'শেষ প্রান্তের পোর্টার ও ড্রোন টিম',
    kpi_porters_val: '১৮টি দল সক্রিয়',
    kpi_porters_sub: 'গ্রাম প্রতিরক্ষা বাহিনী ও ড্রোন স্কোয়াড্রন',
    missions_table_title: 'সক্রিয় বহু-মাধ্যম ত্রাণ অভিযান ও প্রেরণ',
    missions_table_sub: 'জাতীয় ডিপো থেকে প্রত্যন্ত গ্রাম বিতরণ কেন্দ্র পর্যন্ত লাইভ ট্র্যাকিং',
    filter_all: 'সকল (ALL)',
    filter_critical: 'জরুরি (CRITICAL)',
    filter_high: 'উচ্চ (HIGH)',
    th_id_cargo: 'মিশন আইডি ও সামগ্রী',
    th_severity: 'তীব্রতা',
    th_origin_vap: 'উৎস ডিপো ➔ গন্তব্য কেন্দ্র',
    th_vehicle_mode: 'যানবাহন ও মোড',
    th_status: 'স্থিতি',
    th_progress_eta: 'অগ্রগতি ও সময়',
    alerts_title: 'অগ্রাধিকার বিপদ নির্দেশিকা',
    alerts_sub: 'আইনি অগ্রাধিকার ওজন (৭.০ - ১০.০)',
    btn_engage_bypass: 'বিকল্প বাইপাস চালু করুন',
    depots_title: 'জাতীয় কৌশলগত ডিপো ও এয়ারবেস',
    depots_sub: 'ওষুধ, রক্ত প্লাজমা, অক্সিজেন ও খাদ্য মজুদের লাইভ স্থিতি',
    fleet_title: 'যানবাহন প্রস্তুতি ও নিরাপত্তা গেট',
    fleet_sub: 'রিয়েল-টাইম AIS-140 জিপিএস ও ৮-পয়েন্ট নিরাপত্তা যাচাই',
    btn_view_full_fleet: 'সম্পূর্ণ যানবাহন তালিকা →',
    btn_view_full_map: 'সম্পূর্ণ মানচিত্র খুলুন →',
    showing_missions: '{count}টি সক্রিয় মিশন প্রদর্শিত • AIS-140 জিপিএস যুক্ত',
    authority_label: 'কর্তৃপক্ষ:',
  },
  mn: {
    hero_title: 'খুদোংথিবা মতমগী পোৎলম অমসুং লম্বী কমান্দ গ্ৰিদ',
    hero_sub: 'ভারত সরকার • NDMA অমসুং MDoNER লৈবাক্কী ত্রাণ পোৎলম য়েন্থোকপা মেত্রিক্স',
    btn_sms_simulator: 'মোবাইল SMS সিমুলেতৰ',
    btn_live_map: 'লাইভ GIS মেপ',
    btn_authorize_missions: 'মিসন অয়াবা পীবীয়ু',
    btn_report_incident: 'খুদোংথিবা পাউ ফোঙদোকউ',
    kpi_convoys_label: 'চৎলিবা ত্রাণ গারি কাংলুপ',
    kpi_convoys_val: '{count} হিংলি',
    kpi_convoys_sub: 'ডিপোশিংদগী লম্বীদা চৎলি',
    kpi_lifelines_label: 'নিংথিনা চৎপা য়াবা লম্বীশিং',
    kpi_lifelines_sub: '{count} থিংলে • অতোপ্পা লম্বী হাংলে',
    kpi_hazards_label: 'মকোক থোংবা বিপদ পাউ',
    kpi_hazards_val: '{count} নির্দেশ',
    kpi_hazards_sub: 'পুলিস অমসুং BRO না চেক তৌবা',
    kpi_porters_label: 'অরোইবা মাইল পুরকপা কাংলুপ',
    kpi_porters_val: '১৮ কাংলুপ হিংলি',
    kpi_porters_sub: 'খুঙ্গংগী ঙাকশেন কাংলুপ অমসুং দ্রোন',
    missions_table_title: 'চত্থরিবা বহু-মাধ্যম ত্রাণ মিসন অমসুং পোৎলম থাদোকপা',
    missions_table_sub: 'লৈবাক্কী মফমশিংদগী খুঙ্গংগী য়েন্থোকফম ফাওবা লাইভ ত্রেক তৌবা',
    filter_all: 'পুম্নমক (ALL)',
    filter_critical: 'য়ম্না কনবা (CRITICAL)',
    filter_high: 'ৱাংবা (HIGH)',
    th_id_cargo: 'মিসন ID অমসুং পোৎলম',
    th_severity: 'কনবগী চাং',
    th_origin_vap: 'হৌরকফম ➔ য়ৌগদবা মফম',
    th_vehicle_mode: 'গারি অমসুং মওং',
    th_status: 'ফিভম',
    th_progress_eta: 'চৎখিবগী চাং অমসুং মতম',
    alerts_title: 'মকোক থোংবা বিপদ নির্দেশ',
    alerts_sub: 'আইনগী প্রায়োরিতি (৭.০ - ১০.০)',
    btn_engage_bypass: 'অতোপ্পা লম্বী শিজিন্নৌ',
    depots_title: 'লৈবাক্কী মরুওইবা ডিপোশিং অমসুং হেলিপেদ',
    depots_sub: 'হিদাক-লাংথক, ওক্সিজেন অমসুং চিঞ্জাক লৈরিবগী চাং',
    fleet_title: 'গারি লৈরিবগী ফিভম অমসুং সেফতি গেত',
    fleet_sub: 'লাইভ AIS-140 GPS অমসুং ৮-পইন্ত সেফতি চেক',
    btn_view_full_fleet: 'গারি পুম্নমক য়েংবীয়ু →',
    btn_view_full_map: 'মেপ হাংদোকউ →',
    showing_missions: '{count} মিসন হিংলি • AIS-140 GPS',
    authority_label: 'ওথোরিতি:',
  },
}

// Localized Mission Commodity & Depot dictionary
export const CARGO_I18N: Record<LanguageCode, Record<string, string>> = {
  en: {
    'MIS-2026-081': 'Cold-Chain Anti-Venom & Pediatric Vaccines (2-8°C)',
    'MIS-2026-082': 'Emergency Cryo-Preserved Blood Plasma & Oxygen Cylinders',
    'MIS-2026-083': 'High-Calorie Dry Rations & Mobile Water Purification Packs',
    'MIS-2026-084': 'Excavator Hydraulic Spares & Steel Bailey Bridge Pins',
  },
  hi: {
    'MIS-2026-081': 'कोल्ड-चेन एंटी-वेनम एवं बाल चिकित्सा टीके (2-8°C)',
    'MIS-2026-082': 'आपातकालीन क्रायो-प्रिजर्व्ड ब्लड प्लाज्मा एवं ऑक्सीजन सिलेंडर',
    'MIS-2026-083': 'उच्च-कैलोरी सूखा राशन एवं मोबाइल जल शोधन पैक',
    'MIS-2026-084': 'उत्खनन हाइड्रोलिक पुर्जे एवं स्टील बेली ब्रिज पिन',
  },
  as: {
    'MIS-2026-081': 'কোল্ড-চেইন এণ্টি-ভেনম আৰু শিশুৰ ভেকচিন (২-৮°C)',
    'MIS-2026-082': 'জৰুৰীকালীন সংৰক্ষিত তেজৰ প্লাজমা আৰু অক্সিজেন চিলিণ্ডাৰ',
    'MIS-2026-083': 'উচ্চ-শক্তিৰ শুকান খাদ্য আৰু পানী বিশুদ্ধকৰণ পেকেট',
    'MIS-2026-084': 'খনন যন্ত্ৰৰ স্পেয়াৰ পাৰ্টছ আৰু ষ্টিল বেইলি ব্ৰিজ পিন',
  },
  bn: {
    'MIS-2026-081': 'কোল্ড-চেইন অ্যান্টি-ভেনম ও পেডিয়াট্রিক ভ্যাকসিন (২-৮°C)',
    'MIS-2026-082': 'জরুরি সংরক্ষিত ব্লাড প্লাজমা ও অক্সিজেন সিলিন্ডার',
    'MIS-2026-083': 'উচ্চ-ক্যালোরি শুকনো খাদ্য ও মোবাইল পানি বিশুদ্ধকরণ প্যাক',
    'MIS-2026-084': 'খননকারী হাইড্রোলিক যন্ত্রাংশ ও স্টিল বেইলি ব্রিজ পিন',
  },
  mn: {
    'MIS-2026-081': 'কোল্ড-চেন হিদাক অমসুং অঙাংগী ভেক্সিন (২-৮°C)',
    'MIS-2026-082': 'ঈগী প্লাজমা অমসুং ওক্সিজেন সিলিন্দর',
    'MIS-2026-083': 'চিঞ্জাক অমসুং ঈশিং শেংদোকপা পেকেত',
    'MIS-2026-084': 'মেসিনগী পোৎলম অমসুং বেলী থোংগী পিন',
  },
}
