import { LanguageCode } from '@/lib/i18n'

export interface LoginTranslations {
  gov_badge: string
  title: string
  subtitle: string
  encryption_note: string
  admin_badge: string
  admin_title: string
  admin_sub: string
  admin_desc: string
  admin_f1: string
  admin_f2: string
  admin_f3: string
  admin_btn: string
  admin_loading: string
  police_badge: string
  police_title: string
  police_sub: string
  police_desc: string
  police_f1: string
  police_f2: string
  police_f3: string
  police_btn: string
  police_loading: string
  citizen_badge: string
  citizen_title: string
  citizen_sub: string
  citizen_desc: string
  citizen_f1: string
  citizen_f2: string
  citizen_f3: string
  citizen_btn: string
  citizen_loading: string
  statutory_footer: string
  gigw_footer: string
}

export const LOGIN_I18N: Record<LanguageCode, LoginTranslations> = {
  en: {
    gov_badge: 'GOVERNMENT OF INDIA • DISASTER LOGISTICS AUTHORITY',
    title: 'NERA Command Gateway',
    subtitle: 'Authorized personnel, law enforcement officers, and citizens: select your designated operational portal to access logistics dispatch, sector patrol, or relief tracking.',
    encryption_note: '256-BIT ENCRYPTED STATUTORY SESSION • DISASTER MANAGEMENT ACT 2005',
    admin_badge: 'ADMIN • EXECUTIVE',
    admin_title: 'Admin',
    admin_sub: 'State Command & Emergency Relief Operations',
    admin_desc: 'Full operational authority over multi-modal fleet dispatch, physical safety gate overrides, live 3D map reroute approvals, and multi-agency feeds.',
    admin_f1: 'Multi-Modal Mission Dispatch & Approval',
    admin_f2: '1-Click Reroute Approvals & Live 3D GIS',
    admin_f3: '8-Point Vehicle Physical Safety Overrides',
    admin_btn: 'Enter Admin Portal',
    admin_loading: 'Authenticating...',
    police_badge: 'STATUTORY RANK 9.5 • ENFORCEMENT',
    police_title: 'Field Law Enforcement',
    police_sub: 'Traffic OCs, BRO Sector Engineers & SDRF',
    police_desc: 'Tactical highway management: Track district relief convoys, enforce traffic diversions under Section 187 BNSS 2023, and report road severance.',
    police_f1: 'Live Sector Relief Convoy & Escort Tracking',
    police_f2: '1-Click Road Severance Logging (Weight 9.5)',
    police_f3: 'Tactical GIS Checkpoints & VHF Channel 14',
    police_btn: 'Enter Police Sector Portal',
    police_loading: 'Authenticating...',
    citizen_badge: 'PUBLIC ACCESS • BENEFICIARY',
    citizen_title: 'Citizen Beneficiary',
    citizen_sub: 'Public Residents & Village Access Points (VAP)',
    citizen_desc: 'Public transparency tracker: View live delivery countdowns for pediatric vaccines, medicines, oxygen, clean water, and check open safe road maps.',
    citizen_f1: 'Arriving Medicines, Oxygen & Rations ETAs',
    citizen_f2: 'Simplified Public Safe Road Map',
    citizen_f3: 'Community Hazard & Road Obstacle Reports',
    citizen_btn: 'Enter Citizen Public Tracker',
    citizen_loading: 'Authenticating...',
    statutory_footer: 'Statutory Operational Grid authorized under Sections 34, 51 & 54 of the Disaster Management Act, 2005.',
    gigw_footer: 'Guidelines for Indian Government Websites (GIGW 3.0) • DPDP Act 2023 Compliant • 24x7 Emergency Helpline: 112 / 1070',
  },
  hi: {
    gov_badge: 'भारत सरकार • आपदा रसद प्राधिकरण',
    title: 'NERA कमांड गेटवे',
    subtitle: 'अधिकृत कार्मिक, कानून प्रवर्तन अधिकारी और नागरिक: रसद प्रेषण, सेक्टर गश्ती या राहत ट्रैकिंग तक पहुंचने के लिए अपने निर्धारित परिचालन पोर्टल का चयन करें।',
    encryption_note: '256-बिट एन्क्रिप्टेड वैधानिक सत्र • आपदा प्रबंधन अधिनियम 2005',
    admin_badge: 'एडमिन • कार्यकारी कमान',
    admin_title: 'एडमिन',
    admin_sub: 'राज्य आपदा नियंत्रण केंद्र एवं राहत संचालन',
    admin_desc: 'मल्टी-मॉडल बेड़ा प्रेषण, भौतिक सुरक्षा जांच ओवरराइड, लाइव 3D मानचित्र मार्ग परिवर्तन और बहु-एजेंसी सेंसर डेटा पर पूर्ण अधिकार।',
    admin_f1: 'मल्टी-मॉडल मिशन प्रेषण एवं स्वीकृति',
    admin_f2: '1-क्लिक बाईपास मार्ग स्वीकृति एवं 3D GIS',
    admin_f3: '8-बिंदु वाहन भौतिक सुरक्षा ओवरराइड',
    admin_btn: 'एडमिन पोर्टल में प्रवेश करें',
    admin_loading: 'प्रमाणीकरण जारी...',
    police_badge: 'वैधानिक रैंक 9.5 • प्रवर्तन',
    police_title: 'फील्ड कानून प्रवर्तन',
    police_sub: 'ट्रैफिक प्रभारी, बीआरओ सेक्टर इंजीनियर एवं एसडीआरएफ',
    police_desc: 'राजमार्ग प्रबंधन: जिला राहत काफिलों की निगरानी करें, BNSS 2023 की धारा 187 के तहत यातायात डायवर्जन लागू करें और सड़क अवरोध रिपोर्ट करें।',
    police_f1: 'लाइव सेक्टर राहत काफिला एवं एस्कॉर्ट ट्रैकिंग',
    police_f2: '1-क्लिक सड़क विच्छेद रिपोर्ट (प्राथमिकता 9.5)',
    police_f3: 'रणनीतिक GIS चेकपॉइंट एवं VHF चैनल 14',
    police_btn: 'पुलिस सेक्टर पोर्टल में प्रवेश करें',
    police_loading: 'प्रमाणीकरण जारी...',
    citizen_badge: 'सार्वजनिक पहुंच • लाभार्थी',
    citizen_title: 'नागरिक लाभार्थी',
    citizen_sub: 'स्थानीय नागरिक एवं ग्राम वितरण केंद्र (VAP)',
    citizen_desc: 'सार्वजनिक पारदर्शिता ट्रैकर: दवाओं, टीकों, ऑक्सीजन सिलेंडर और राशन के पहुंचने का लाइव समय देखें तथा खुले सुरक्षित मार्गों की जांच करें।',
    citizen_f1: 'आने वाली दवाओं, ऑक्सीजन एवं राशन का समय',
    citizen_f2: 'सरलीकृत सार्वजनिक सुरक्षित सड़क मानचित्र',
    citizen_f3: 'सामुदायिक सड़क बाधा एवं खतरा रिपोर्ट',
    citizen_btn: 'नागरिक पब्लिक ट्रैकर में प्रवेश करें',
    citizen_loading: 'प्रमाणीकरण जारी...',
    statutory_footer: 'आपदा प्रबंधन अधिनियम, 2005 की धारा 34, 51 और 54 के तहत अधिकृत वैधानिक परिचालन ग्रिड।',
    gigw_footer: 'भारतीय सरकारी वेबसाइट दिशानिर्देश (GIGW 3.0) • DPDP अधिनियम 2023 • 24x7 आपातकालीन हेल्पलाइन: 112 / 1070',
  },
  as: {
    gov_badge: 'ভাৰত চৰকাৰ • দুৰ্যোগ যোগান প্ৰাধিকৰণ',
    title: 'NERA কমাণ্ড গেটৱে',
    subtitle: 'অনুমোদিত বিষয়া, আৰক্ষী আৰু নাগৰিকসকল: সাহায্য প্ৰেৰণ, টহলদাৰী বা ট্ৰেকিং সেৱা লাভ কৰিবলৈ আপোনাৰ নিৰ্ধাৰিত পৰ্টেল বাছক।',
    encryption_note: '২৫৬-বিট এনক্ৰিপ্ট কৰা বৈধানিক সত্ৰ • দুৰ্যোগ ব্যৱস্থাপনা আইন ২০০৫',
    admin_badge: 'এডমিন • কাৰ্যবাহী',
    admin_title: 'এডমিন',
    admin_sub: 'ৰাজ্যিক কমাণ্ড আৰু জৰুৰীকালীন সাহায্য পৰিচালনা',
    admin_desc: 'বহু-মাধ্যম সাহায্য প্ৰেৰণ, সুৰক্ষা পৰীক্ষা, ৩ডি মেপত বৈকল্পিক পথ অনুমোদন আৰু চেন্সৰ দেটাৰ ওপৰত সম্পূৰ্ণ কৰ্তৃত্ব।',
    admin_f1: 'বহু-মাধ্যম সাহায্য অভিযান প্ৰেৰণ আৰু অনুমোদন',
    admin_f2: '১-ক্লিকত বৈকল্পিক পথ অনুমোদন আৰু ৩ডি GIS',
    admin_f3: '৮-পইণ্ট বাহন ভৌতিক সুৰক্ষা অনুমোদন',
    admin_btn: 'এডমিন পৰ্টেলত প্ৰৱেশ কৰক',
    admin_loading: 'প্ৰৱেশ কৰা হৈছে...',
    police_badge: 'বিধিবদ্ধ অগ্ৰাধিকাৰ ৯.৫ • প্ৰৱৰ্তন',
    police_title: 'আইন প্ৰৱৰ্তন আৰু আৰক্ষী',
    police_sub: 'ট্ৰাফিক বিষয়া, বিআৰঅ’ অভিযন্তা আৰু এছডিআৰএফ',
    police_desc: 'ৰাষ্ট্ৰীয় ঘাইপথ নিৰীক্ষণ: সাহায্য কনভয় ট্ৰেক কৰক, BNSS ২০২৩ ৰ ধাৰা ১৮৭ ৰ অধীনত পথ নিয়ন্ত্ৰণ কৰক আৰু পথ বন্ধৰ তথ্য দিয়ক।',
    police_f1: 'লাইভ সাহায্য কনভয় আৰু এস্কৰ্ট নিৰীক্ষণ',
    police_f2: '১-ক্লিকত পথ বন্ধৰ তথ্য দাখিল (অগ্ৰাধিকাৰ ৯.৫)',
    police_f3: 'ৰণনীতিমূলক GIS চেকপইণ্ট আৰু VHF চেনেল ১৪',
    police_btn: 'আৰক্ষী পৰ্টেলত প্ৰৱেশ কৰক',
    police_loading: 'প্ৰৱেশ কৰা হৈছে...',
    citizen_badge: 'ৰাজহুৱা প্ৰৱেশ • উপভোক্তা',
    citizen_title: 'নাগৰিক উপভোক্তা',
    citizen_sub: 'জনসাধাৰণ আৰু গাঁও বিতৰণ কেন্দ্ৰ (VAP)',
    citizen_desc: 'ৰাজহুৱা স্বচ্ছতা ট্ৰেকাৰ: জীৱনৰক্ষী দৰব, ভেকচিন, অক্সিজেন আৰু খাদ্য সাহায্য অহাৰ লাইভ সময় আৰু নিৰাপদ পথ চাওক।',
    citizen_f1: 'দৰব, অক্সিজেন আৰু খাদ্য সামগ্ৰী অহাৰ সময়',
    citizen_f2: 'সহজ ৰাজহুৱা নিৰাপদ পথৰ মানচিত্ৰ',
    citizen_f3: 'পথৰ বাধা আৰু বিপদৰ ৰাজহুৱা প্ৰতিবেদন',
    citizen_btn: 'নাগৰিক ট্ৰেকাৰত প্ৰৱেশ কৰক',
    citizen_loading: 'প্ৰৱেশ কৰা হৈছে...',
    statutory_footer: 'দুৰ্যোগ ব্যৱস্থাপনা আইন, ২০০৫ ৰ ধাৰা ৩৪, ৫১ আৰু ৫৪ ৰ অধীনত অনুমোদিত।',
    gigw_footer: 'GIGW 3.0 মানদণ্ড • DPDP আইন ২০২৩ অনুপালিত • জৰুৰীকালীন হেল্পলাইন: ১১২ / ১০৭০',
  },
  bn: {
    gov_badge: 'ভারত সরকার • দুর্যোগ রসদ কর্তৃপক্ষ',
    title: 'NERA কমান্ড গেটওয়ে',
    subtitle: 'অনুমোদিত কর্মী, পুলিশ আধিকারিক এবং নাগরিকবৃন্দ: ত্রাণ প্রেরণ, টহল বা ট্র্যাকিং করতে আপনার নির্ধারিত পোর্টাল বেছে নিন।',
    encryption_note: '২৫৬-বিট এনক্রিপ্ট করা বৈধানিক সেশন • দুর্যোগ ব্যবস্থাপনা আইন ২০০৫',
    admin_badge: 'অ্যাডমিন • নির্বাহী কমান্ড',
    admin_title: 'অ্যাডমিন',
    admin_sub: 'রাজ্য কমান্ড এবং জরুরি ত্রাণ পরিচালনা',
    admin_desc: 'বহু-মাধ্যম ত্রাণ প্রেরণ, নিরাপত্তা গেট অনুমোদন, লাইভ থ্রিডি মানচিত্রে বিকল্প রুট এবং সেন্সর ডেটার উপর সম্পূর্ণ কর্তৃত্ব।',
    admin_f1: 'বহু-মাধ্যম মিশন অনুমোদন ও প্রেরণ',
    admin_f2: '১-ক্লিক বিকল্প রুট অনুমোদন ও ৩ডি জিআইএস',
    admin_f3: '৮-পয়েন্ট যানবাহন শারীরিক নিরাপত্তা গেট',
    admin_btn: 'অ্যাডমিন পোর্টালে প্রবেশ করুন',
    admin_loading: 'যাচাই করা হচ্ছে...',
    police_badge: 'আইনি পদমর্যাদা ৯.৫ • প্রয়োগ',
    police_title: 'আইন প্রয়োগকারী ও পুলিশ',
    police_sub: 'ট্রাফিক ওসি, বিআরও ইঞ্জিনিয়ার এবং এসডিআরএফ',
    police_desc: 'মহাসড়ক ব্যবস্থাপনা: ত্রাণ কনভয় ট্র্যাক করুন, BNSS ২০২৩ এর ধারা ১৮৭ এর অধীনে ট্রাফিক ডাইভারশন প্রয়োগ করুন।',
    police_f1: 'লাইভ ত্রাণ কনভয় ও এস্কর্ট পর্যবেক্ষণ',
    police_f2: '১-ক্লিক সড়ক বিঘ্ন লগিং (ওজন ৯.৫)',
    police_f3: 'কৌশলগত জিআইএস চেকপয়েন্ট ও VHF চ্যানেল ১৪',
    police_btn: 'পুলিশ সেক্টর পোর্টালে প্রবেশ করুন',
    police_loading: 'যাচাই করা হচ্ছে...',
    citizen_badge: 'পাবলিক অ্যাক্সেস • সুবিধাভোগী',
    citizen_title: 'নাগরিক সুবিধাভোগী',
    citizen_sub: 'সাধারণ বাসিন্দা এবং গ্রাম বিতরণ কেন্দ্র (VAP)',
    citizen_desc: 'পাবলিক ট্র্যাকার: প্রয়োজনীয় ওষুধ, ভ্যাকসিন, অক্সিজেন সিলিন্ডার এবং নিরাপদ রাস্তার লাইভ স্থিতি দেখুন।',
    citizen_f1: 'আগত ওষুধ, অক্সিজেন এবং খাদ্য পৌঁছানোর সময়',
    citizen_f2: 'সহজ পাবলিক নিরাপদ সড়ক মানচিত্র',
    citizen_f3: 'সড়ক বিপত্তি ও বাধার অভিযোগ দায়ের',
    citizen_btn: 'নাগরিক ট্র্যাকার খুলুন',
    citizen_loading: 'যাচাই করা হচ্ছে...',
    statutory_footer: 'দুর্যোগ ব্যবস্থাপনা আইন, ২০০৫ এর ধারা ৩৪, ৫১ এবং ৫৪ এর অধীনে অনুমোদিত।',
    gigw_footer: 'GIGW 3.0 মানদণ্ড • DPDP আইন ২০২৩ অনুগত • ২৪x৭ হেল্পলাইন: ১১২ / ১০৭০',
  },
  mn: {
    gov_badge: 'ভারত সরকার • খুদোংথিবা মতমগী পোৎলম য়েন্থোকপা ওথোরিতি',
    title: 'NERA কমান্দ গেতৱে',
    subtitle: 'অয়াবা লৈরবা ওফিসারশিং, পুলিস অমসুং মীচম মীয়াম: পোৎলম থাদোকপা, লম্বী য়েংশিনবা নত্রগা ত্রেক তৌনবগী পোৰ্তেল খনবীয়ু।',
    encryption_note: '২৫৬-বিত এনক্ৰিপ তৌবা সেসন • দিজাস্তর মেনেজমেন্ত এক্ত ২০০৫',
    admin_badge: 'এদমিন • মকোক ওফিসার',
    admin_title: 'এদমিন',
    admin_sub: 'ষ্টেত কমান্দ অমসুং খুদোংথিবা মতমগী থবক',
    admin_desc: 'পোৎলম থাদোকপা, গারি সেফতি চেক তৌবা, লাইভ ৩ডি মেপতা অতোপ্পা লম্বী অয়াবা পীবা পুম্নমক্কী হক লৈ।',
    admin_f1: 'পোৎলম থাদোকপা অমসুং মিসন অয়াবা পীবা',
    admin_f2: '১-ক্লিকতা অতোপ্পা লম্বী অয়াবা পীবা অমসুং ৩ডি GIS',
    admin_f3: '৮-পইন্ত গারি সেফতি য়েংশিনবা',
    admin_btn: 'এদমিন পোৰ্তেলদা চঙবীয়ু',
    admin_loading: 'চঙলি...',
    police_badge: 'আইনগী পদমর্যাদা ৯.৫ • পুলিস',
    police_title: 'আইন ঙাকপা অমসুং পুলিস',
    police_sub: 'ত্রাফিক পুলিস, BRO ইঞ্জিনিয়ার অমসুং SDRF',
    police_desc: 'লম্বী য়েংশিনবা: ত্রাণ গারি ত্রেক তৌবীয়ু, BNSS ২০২৩ গী সেক্সন ১৮৭ গী মখাদা লম্বী কাইবা ফোঙদোকউ।',
    police_f1: 'লাইভ ত্রাণ গারি অমসুং এস্কোৰ্ত য়েংশিনবা',
    police_f2: '১-ক্লিকতা লম্বী কাইবা ফোঙদোকপা (প্রায়োরিতি ৯.৫)',
    police_f3: 'GIS চেকপোইন্ত অমসুং VHF চেনেল ১৪',
    police_btn: 'পুলিস পোৰ্তেলদা চঙবীয়ু',
    police_loading: 'চঙলি...',
    citizen_badge: 'মীয়ামগী চঙফম • মীচম মীয়াম',
    citizen_title: 'মীচম মীয়াম',
    citizen_sub: 'মীচম মীয়াম অমসুং খুঙ্গংগী য়েন্থোকফম (VAP)',
    citizen_desc: 'হিদাক-লাংথক, ওক্সিজেন অমসুং চিঞ্জাক য়ৌরকপা ত্রেক তৌবীয়ু অমসুং চেকশিন্না চৎনবা লম্বী য়েংবীয়ু।',
    citizen_f1: 'হিদাক-লাংথক অমসুং চিঞ্জাক য়ৌরকপগী মতম',
    citizen_f2: 'লাইথোকহল্লবা নিংথিনা চৎপা য়াবা লম্বী মেপ',
    citizen_f3: 'লম্বীদা অপনবা থোকপা ফোঙদোকপা',
    citizen_btn: 'মীচম মীয়ামগী ত্ৰেকাৰদা চঙবীয়ু',
    citizen_loading: 'চঙলি...',
    statutory_footer: 'দিজাস্তর মেনেজমেন্ত এক্ত, ২০০৫ গী সেক্সন ৩৪, ৫১ অমসুং ৫৪ গী মখাদা মথৌ তৌবা।',
    gigw_footer: 'GIGW 3.0 স্তেন্দার্দ • DPDP এক্ত ২০২৩ • হেল্পলাইন: ১১২ / ১০৭০',
  },
}

