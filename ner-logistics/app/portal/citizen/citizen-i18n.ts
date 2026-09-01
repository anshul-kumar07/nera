import { LanguageCode } from '@/lib/i18n'

export interface CitizenTranslations {
  portal_title: string
  public_badge: string
  sub_heading: string
  live_status: string
  arriving_title: string
  arriving_sub: string
  safe_routes_title: string
  safe_routes_sub: string
  open_corridor_badge: string
  report_hazard_title: string
  report_hazard_sub: string
  road_label: string
  hazard_type_label: string
  desc_label: string
  desc_placeholder: string
  submit_report_btn: string
  submitting: string
  helpdesk_title: string
  helpdesk_sub: string
  helpline_btn: string
  mark_beacon_btn: string
  mark_beacon_title: string
  mark_beacon_sub: string
  sos_btn: string
  sos_title: string
  sos_sub: string
  payload_breakdown_title: string
  evacuee_count_label: string
  water_label: string
  shelter_label: string
  medical_label: string
  safe_points_title: string
  safe_points_sub: string
}

export const CITIZEN_I18N: Record<LanguageCode, CitizenTranslations> = {
  en: {
    portal_title: 'CITIZEN & ESSENTIAL SUPPLIES BENEFICIARY PORTAL',
    public_badge: 'PUBLIC ACCESS (BENEFICIARY)',
    sub_heading: 'Live Public Tracking for Life-Saving Medicines, Oxygen, Pediatric Vaccines & Food Delivery Convoys',
    live_status: 'Live Disaster Relief Operations In Progress',
    arriving_title: 'Essential Supplies In Transit to Regional Village Access Points (VAP)',
    arriving_sub: 'Real-time arrival forecasts for cold-chain medicines, blood plasma, oxygen and food',
    safe_routes_title: 'Public Open & Monitored Road Corridors',
    safe_routes_sub: 'Current arterial lifelines verified safe by Police Highway Patrol & Border Roads Organisation',
    open_corridor_badge: 'OPEN & SECURED BY POLICE',
    report_hazard_title: 'Report Road Hazard / Obstacle (Crowdsourced)',
    report_hazard_sub: 'Help emergency services and fellow citizens by logging fallen trees, waterlogging or roadblocks',
    road_label: 'Affected Road / Highway Corridor',
    hazard_type_label: 'Observed Hazard Type',
    desc_label: 'Obstacle Details & Landmark',
    desc_placeholder: 'Describe location landmark, water depth, or passable vehicle size...',
    submit_report_btn: 'Submit Community Hazard Report',
    submitting: 'Submitting Report...',
    helpdesk_title: 'Need Immediate Emergency Medical or Relief Assistance?',
    helpdesk_sub: 'Contact the 24x7 State Emergency Operations Centre (SEOC) helpline or call 112 directly.',
    helpline_btn: 'Emergency Helpline: 112 / 1070',
    mark_beacon_btn: 'Mark Safe Relief Point',
    mark_beacon_title: 'Mark Safe Relief Point / Exit Beacon',
    mark_beacon_sub: 'If you have navigated out of a hazard zone, drop a safe haven marker to guide nearby citizens and alert rescue teams.',
    sos_btn: 'One-Tap SOS Distress Ping',
    sos_title: 'One-Tap SOS Distress Signal',
    sos_sub: 'Broadcast immediate GPS distress signal with headcount and life-critical needs directly to State EOC & Police.',
    payload_breakdown_title: 'Verified Relief Cargo Payload Breakdown',
    evacuee_count_label: 'Evacuated Civilians Headcount',
    water_label: 'Clean Drinking Water Available',
    shelter_label: 'Covered Shelter / Dry Ground Available',
    medical_label: 'Urgent Medical Attention Required',
    safe_points_title: 'Crowdsourced Community Safe Havens & Evacuation Zones',
    safe_points_sub: 'Verified relief points established by evacuated citizens and Village Defence Parties',
  },
  hi: {
    portal_title: 'नागरिक एवं आवश्यक आपूर्ति लाभार्थी पोर्टल',
    public_badge: 'सार्वजनिक पहुंच (लाभार्थी)',
    sub_heading: 'जीवनरक्षक दवाओं, ऑक्सीजन, बाल चिकित्सा टीकों एवं खाद्य आपूर्ति काफिलों की लाइव ट्रैकिंग',
    live_status: 'आपदा राहत कार्य वास्तविक समय में जारी',
    arriving_title: 'ग्राम वितरण केंद्रों (VAP) की ओर आ रही आवश्यक आपूर्ति',
    arriving_sub: 'कोल्ड-चेन टीकों, ब्लड प्लाज्मा, ऑक्सीजन और भोजन के आगमन का वास्तविक समय पूर्वानुमान',
    safe_routes_title: 'सार्वजनिक रूप से खुले और सुरक्षित सड़क गलियारे',
    safe_routes_sub: 'पुलिस एवं सीमा सड़क संगठन द्वारा सुरक्षित घोषित किए गए मुख्य मार्ग',
    open_corridor_badge: 'खुला एवं पुलिस द्वारा सुरक्षित',
    report_hazard_title: 'सड़क बाधा / खतरा रिपोर्ट करें (जन-सहयोग)',
    report_hazard_sub: 'गिरे हुए पेड़, जलभराव या सड़क क्षति की रिपोर्ट करके आपातकालीन सेवाओं की सहायता करें',
    road_label: 'प्रभावित सड़क / राजमार्ग',
    hazard_type_label: 'देखा गया खतरे का प्रकार',
    desc_label: 'बाधा का विवरण एवं मुख्य लैंडमार्क',
    desc_placeholder: 'स्थान का लैंडमार्क, पानी का स्तर या गुजरने योग्य वाहन का आकार लिखें...',
    submit_report_btn: 'सामुदायिक खतरा रिपोर्ट दर्ज करें',
    submitting: 'रिपोर्ट भेजी जा रही है...',
    helpdesk_title: 'तत्काल आपातकालीन चिकित्सा या राहत सहायता की आवश्यकता है?',
    helpdesk_sub: '24x7 राज्य आपदा नियंत्रण केंद्र (SEOC) से संपर्क करें या सीधे 112 पर कॉल करें।',
    helpline_btn: 'आपातकालीन हेल्पलाइन: 112 / 1070',
    mark_beacon_btn: 'सुरक्षित राहत स्थल चिन्हित करें',
    mark_beacon_title: 'सुरक्षित राहत स्थल / निकास बिंदु दर्ज करें',
    mark_beacon_sub: 'यदि आप खतरे के क्षेत्र से बाहर निकल चुके हैं, तो सुरक्षित स्थल चिन्हित कर अन्य नागरिकों एवं बचाव दल की सहायता करें।',
    sos_btn: '1-टैप SOS आपातकालीन संदेश',
    sos_title: '1-टैप SOS संकट सिग्नल',
    sos_sub: 'फंसे हुए लोगों की संख्या एवं भोजन, पानी, दवा की आवश्यकता सीधे राज्य नियंत्रण कक्ष को भेजें।',
    payload_breakdown_title: 'आने वाली राहत सामग्री का विस्तृत विवरण',
    evacuee_count_label: 'सुरक्षित नागरिकों की संख्या',
    water_label: 'पीने का स्वच्छ पानी उपलब्ध है',
    shelter_label: 'सुरक्षित आश्रय उपलब्ध है',
    medical_label: 'तत्काल चिकित्सा सहायता की आवश्यकता है',
    safe_points_title: 'सामुदायिक सुरक्षित आश्रय स्थल एवं राहत केंद्र',
    safe_points_sub: 'नागरिकों एवं ग्राम रक्षा दलों द्वारा स्थापित सुरक्षित स्थल',
  },
  as: {
    portal_title: 'নাগৰিক আৰু অত্যাৱশ্যকীয় সামগ্ৰী উপভোক্তা পৰ্টেল',
    public_badge: 'ৰাজহুৱা প্ৰৱেশ (উপভোক্তা)',
    sub_heading: 'জীৱনৰক্ষী দৰব, অক্সিজেন, শিশুৰ ভেকচিন আৰু খাদ্য সাহায্যৰ লাইভ ট্ৰেকিং',
    live_status: 'দুৰ্যোগ সাহায্য অভিযান সক্ৰিয়ভাৱে চলি আছে',
    arriving_title: 'গাঁও বিতৰণ কেন্দ্ৰলৈ (VAP) আহি থকা অত্যাৱশ্যকীয় সামগ্ৰীসমূহ',
    arriving_sub: 'ভেকচিন, তেজ, অক্সিজেন আৰু খাদ্য সামগ্ৰী অহাৰ সঠিক সময়',
    safe_routes_title: 'ৰাজহুৱাভাৱে মুকলি আৰু নিৰাপদ পথসমূহ',
    safe_routes_sub: 'আৰক্ষী আৰু বিআৰঅ’ৰ দ্বাৰা নিৰাপদ বুলি ঘোষিত মূল ঘাইপথসমূহ',
    open_corridor_badge: 'মুকলি আৰু আৰক্ষী দ্বাৰা সুৰক্ষিত',
    report_hazard_title: 'পথৰ বাধা / বিপদৰ তথ্য দিয়ক (ৰাজহুৱা সহায়)',
    report_hazard_sub: 'গছ বাগৰি পৰা, পানী জমা হোৱা বা পথ ভঙাৰ তথ্য দি উদ্ধাৰকাৰীক সহায় কৰক',
    road_label: 'প্ৰভাৱিত পথ / ঘাইপথ খণ্ড',
    hazard_type_label: 'প্ৰত্যক্ষ কৰা বিপদৰ প্ৰকাৰ',
    desc_label: 'বাধাৰ বিৱৰণ আৰু সঠিক চিন',
    desc_placeholder: 'মফমৰ চিন, পানীৰ গভীৰতা বা চলাচল কৰিব পৰা বাহনৰ বিৱৰণ লিখক...',
    submit_report_btn: 'বিপদৰ প্ৰতিবেদন দাখিল কৰক',
    submitting: 'দাখিল কৰা হৈছে...',
    helpdesk_title: 'জৰুৰীকালীন চিকিৎসা বা সাহায্যৰ প্ৰয়োজননে?',
    helpdesk_sub: '২৪x৭ ৰাজ্যিক দুৰ্যোগ নিয়ন্ত্ৰণ কক্ষৰ লগত যোগাযোগ কৰক বা ১১২ নম্বৰত ফোন কৰক।',
    helpline_btn: 'জৰুৰীকালীন হেল্পলাইন: ১১২ / ১০৭০',
    mark_beacon_btn: 'নিৰাপদ আশ্ৰয়স্থল চিহ্নিত কৰক',
    mark_beacon_title: 'নিৰাপদ আশ্ৰয়স্থল / ওলোৱা পথ চিহ্নিত কৰক',
    mark_beacon_sub: 'বিপদৰ পৰা ওলাই আহিলে এই স্থান চিহ্নিত কৰক যাতে আন নাগৰিক আৰু উদ্ধাৰকাৰী দলে সহায় পায়।',
    sos_btn: '১-ক্লিকত জৰুৰী SOS সংকেত',
    sos_title: '১-ক্লিকত SOS সংকেত প্ৰেৰণ',
    sos_sub: 'আৱদ্ধ লোকৰ সংখ্যা আৰু প্ৰয়োজনীয় সামগ্ৰীৰ তথ্য পোনে পোনে কমাণ্ড কেন্দ্ৰলৈ প্ৰেৰণ কৰক।',
    payload_breakdown_title: 'আহি থকা সাহায্য সামগ্ৰীৰ বিৱৰণ',
    evacuee_count_label: 'নিৰাপদ লোকৰ সংখ্যা',
    water_label: 'বিশুদ্ধ খোৱাপানী উপলব্ধ',
    shelter_label: 'আশ্ৰয়স্থল উপলব্ধ',
    medical_label: 'জৰুৰী চিকিৎসাৰ প্ৰয়োজন',
    safe_points_title: 'ৰাজহুৱা নিৰাপদ আশ্ৰয়স্থল আৰু বিতৰণ কেন্দ্ৰ',
    safe_points_sub: 'নাগৰিক আৰু গাঁও সুৰক্ষা বাহিনীয়ে চিনাক্ত কৰা আশ্ৰয়স্থল',
  },
  bn: {
    portal_title: 'নাগরিক এবং প্রয়োজনীয় ত্রাণ সামগ্রী পোর্টাল',
    public_badge: 'পাবলিক অ্যাক্সেস (সুবিধাভোগী)',
    sub_heading: 'জীবন রক্ষাকারী ওষুধ, অক্সিজেন, শিশু ভ্যাকসিন এবং খাদ্য সামগ্রীর লাইভ ট্র্যাকিং',
    live_status: 'ত্রাণ তৎপরতা সরাসরি পরিচালিত হচ্ছে',
    arriving_title: 'গ্রাম বিতরণ কেন্দ্রে (VAP) পৌঁছানো প্রয়োজনীয় সরবরাহ',
    arriving_sub: 'ভ্যাকসিন, রক্ত প্লাজমা, অক্সিজেন ও খাদ্যের রিয়েল-টাইম পূর্বাভাস',
    safe_routes_title: 'জনসাধারণের জন্য উন্মুক্ত ও নিরাপদ সড়ক করিডোর',
    safe_routes_sub: 'পুলিশ ও বিআরও কর্তৃক যাচাইকৃত নিরাপদ প্রধান মহাসড়ক',
    open_corridor_badge: 'উন্মুক্ত এবং পুলিশ দ্বারা সুরক্ষিত',
    report_hazard_title: 'সড়ক বিপত্তি / বাধার অভিযোগ জানান',
    report_hazard_sub: 'গাছ ভেঙে পড়া, জলাবদ্ধতা বা সড়ক ক্ষতির তথ্য জানিয়ে উদ্ধারকাজে সাহায্য করুন',
    road_label: 'ক্ষতিগ্রস্ত সড়ক / মহাসড়ক',
    hazard_type_label: 'দেখা বিপত্তির ধরন',
    desc_label: 'বাধার বিবরণ ও নিকটস্থ ল্যান্ডমার্ক',
    desc_placeholder: 'স্থানের বিবরণ, পানির গভীরতা বা যানবাহনের আকার লিখুন...',
    submit_report_btn: 'কমিউনিটি রিপোর্ট জমা দিন',
    submitting: 'জমা দেওয়া হচ্ছে...',
    helpdesk_title: 'জরুরি চিকিৎসা বা ত্রাণ সহায়তার প্রয়োজন?',
    helpdesk_sub: '২৪x৭ রাজ্য দুর্যোগ নিয়ন্ত্রণ কক্ষে যোগাযোগ করুন বা সরাসরি ১১২ ডায়াল করুন।',
    helpline_btn: 'জরুরি হেল্পলাইন: ১১২ / ১০৭০',
    mark_beacon_btn: 'নিরাপদ আশ্রয়স্থল চিহ্নিত করুন',
    mark_beacon_title: 'নিরাপদ ত্রাণ কেন্দ্র / প্রস্থান বিন্দু চিহ্নিত করুন',
    mark_beacon_sub: 'বিপদ মুক্ত স্থানে পৌঁছানোর পর অন্যদের পথ দেখাতে এবং উদ্ধারকারী দলের জন্য নিরাপদ স্থান চিহ্নিত করুন।',
    sos_btn: '১-ক্লিক এসওএস সংকেত',
    sos_title: '১-ক্লিক এসওএস জরুরি সংকেত',
    sos_sub: 'আটকে পড়া মানুষের সংখ্যা ও ওষুধ, পানির প্রয়োজন সরাসরি কমান্ড সেন্টারে পাঠান।',
    payload_breakdown_title: 'আগত ত্রাণ সামগ্রীর বিস্তারিত তালিকা',
    evacuee_count_label: 'নিরাপদে পৌঁছানো মানুষের সংখ্যা',
    water_label: 'বিশুদ্ধ খাবার পানি বিদ্যমান',
    shelter_label: 'নিরাপদ আশ্রয় বিদ্যমান',
    medical_label: 'জরুরি চিকিৎসা প্রয়োজন',
    safe_points_title: 'কমিউনিটি নিরাপদ আশ্রয় ও ত্রাণ কেন্দ্র',
    safe_points_sub: 'নাগরিক ও গ্রাম প্রতিরক্ষা দল দ্বারা চিহ্নিত নিরাপদ এলাকা',
  },
  mn: {
    portal_title: 'মীচম মীয়াম অমসুং পোৎলম য়েন্থোকপা পোৰ্তেল',
    public_badge: 'মীয়ামগী চঙফম (মীচম মীয়াম)',
    sub_heading: 'হিদাক-লাংথক, ওক্সিজেন অমসুং চিঞ্জাক য়ৌরকপা লাইভ ত্রেক তৌবা',
    live_status: 'খুদোংথিবা মতমগী ত্রাণ থবক চত্থরি',
    arriving_title: 'খুঙ্গংগী য়েন্থোকফম মফম (VAP) দা পুরক্লিবা পোৎলমশিং',
    arriving_sub: 'ভেক্সিন, ওক্সিজেন অমসুং চিঞ্জাক য়ৌরকপগী লাইভ মতম',
    safe_routes_title: 'মীয়ামগীদমক হাংদোক্লবা নিংথিনা চৎপা য়াবা লম্বীশিং',
    safe_routes_sub: 'পুলিস অমসুং BRO না সেফনি হায়না লেপখ্রবা লম্বীশিং',
    open_corridor_badge: 'হাংলে অমসুং পুলিসনা ঙাক্লি',
    report_hazard_title: 'লম্বীদা অপনবা থোকপা ফোঙদোকউ',
    report_hazard_sub: 'উ তুংবা, ঈশিং ইচাও নত্রগা লম্বী কাইবা ফোঙদোক্তুনা মতেং পাংবীয়ু',
    road_label: 'কাইরবা লম্বীগী মমিং',
    hazard_type_label: 'অপনবগী মখল',
    desc_label: 'অপনবগী অকুপ্পা বিৱরন',
    desc_placeholder: 'মফমগী মমিং অমসুং ঈশিং তুংবগী চাং ইবীয়ু...',
    submit_report_btn: 'পাউ থাগৎলু',
    submitting: 'থাগৎলি...',
    helpdesk_title: 'খুদোংথিবা মতমদা লায়েংবগী মতেং মথৌ তারিব্ৰা?',
    helpdesk_sub: '২৪x৭ ষ্টেত কমান্দ সেক্তৰদা পাউ ফাওবীয়ু নত্রগা ১১২ দা কোল তৌবীয়ু।',
    helpline_btn: 'হেল্পলাইন: ১১২ / ১০৭০',
    mark_beacon_btn: 'নিংথিনা লৈফম মফম তাকউ',
    mark_beacon_title: 'সেফ ওইবা মফম মেপতা ফোঙদোকউ',
    mark_beacon_sub: 'খুদোংথিবা মফমদগী থোক্লকপা মতমদা অতোপ্পা মীশিং অমসুং রেস্কিউ তিমগীদমক মফম তাকপীয়ু।',
    sos_btn: '১-ক্লিক SOS সংকেত',
    sos_title: '১-ক্লিক SOS পাউ থাগৎলু',
    sos_sub: 'অৱাবা তারবা মীগী মশিং অমসুং হিদাক, চিঞ্জাক মথৌ তারিবশিং থাগৎলু।',
    payload_breakdown_title: 'য়ৌরক্লিবা ত্রাণ পোৎলমগী অকুপ্পা বিৱরন',
    evacuee_count_label: 'সেফ ওইরবা মীগী মশিং',
    water_label: 'থক্নবা ঈশিং ফংই',
    shelter_label: 'লৈফম মফম লৈ',
    medical_label: 'হিদাক-লাংথক থুনা মথৌ তাই',
    safe_points_title: 'মীয়ামগী নিংথিনা লৈফম অমসুং সেফ জোনশিং',
    safe_points_sub: 'মীচম মীয়ামনা লিংখৎপা সেফ জোনশিং',
  },
}
