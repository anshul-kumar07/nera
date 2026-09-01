import { LanguageCode } from '@/lib/i18n'

export interface PoliceTranslations {
  portal_title: string
  rank_badge: string
  jurisdiction_sub: string
  launch_map: string
  vhf_label: string
  vhf_val: string
  mandate_label: string
  mandate_val: string
  convoys_label: string
  convoys_val: string
  active_missions_title: string
  active_missions_sub: string
  report_disruption_title: string
  report_disruption_sub: string
  corridor_label: string
  hazard_type_label: string
  severity_label: string
  desc_label: string
  desc_placeholder: string
  submit_btn: string
  submitting: string
  radio_checkpoints_title: string
  radio_checkpoints_sub: string
  vehicle_recommendation_label: string
  equipment_needs_label: string
  passability_label: string
  corridor_execution_title: string
  corridor_execution_sub: string
  rescue_queue_title: string
  rescue_queue_sub: string
  dispatch_rescue_btn: string
}

export const POLICE_I18N: Record<LanguageCode, PoliceTranslations> = {
  en: {
    portal_title: 'POLICE & HIGHWAY PATROL SECTOR COMMAND PORTAL',
    rank_badge: 'STATUTORY RANK (9.5)',
    jurisdiction_sub: 'Jurisdiction: Dima Hasao & Barak Valley Highway Sectors • Traffic Regulation under Section 187 Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023',
    launch_map: 'Launch Tactical Map',
    vhf_label: 'VHF Emergency Channel',
    vhf_val: 'CH-14 (156.700 MHz) ACTIVE',
    mandate_label: 'Statutory Mandate',
    mandate_val: 'BNSS 2023 Sec 187 & DM Act 2005',
    convoys_label: 'Active Escort Convoys',
    convoys_val: '3 Relinquished / 1 En Route',
    active_missions_title: 'Sector Active Relief Convoys & Patrol Escorts',
    active_missions_sub: 'Real-time convoy telemetry across regional highway arterial lifelines',
    report_disruption_title: 'Transmit Sector Passability & Vehicle Feasibility to Admin',
    report_disruption_sub: 'Submit verified road passability, recommended vehicle classes, and equipment needs to State EOC',
    corridor_label: 'Highway Corridor / Sector',
    hazard_type_label: 'Severance / Disruption Type',
    severity_label: 'Statutory Severity Level',
    desc_label: 'Field Observations / Ground Situation',
    desc_placeholder: 'Describe blockage extent, slope mud depth, or bridge rating...',
    submit_btn: 'Transmit Route Feasibility & Vehicle Needs to Admin',
    submitting: 'Transmitting Directive...',
    radio_checkpoints_title: 'Active VHF Repeater & Highway Patrol Checkpoints',
    radio_checkpoints_sub: 'Designated relay towers maintaining voice and telemetry in cellular blackout sectors',
    vehicle_recommendation_label: 'Recommended Transport Class (Ground Reality)',
    equipment_needs_label: 'Required Clearance & Logistics Equipment',
    passability_label: 'Sector Motorable Passability',
    corridor_execution_title: 'Admin Chosen Corridor Directives & Convoy Telemetry',
    corridor_execution_sub: 'Statutory corridor approved by State EOC Admin with designated transport mode and along-route escorts',
    rescue_queue_title: 'Civilian Rescue & Evacuation Queue (Crowdsourced Beacons)',
    rescue_queue_sub: 'Safe spots marked by evacuated citizens requiring SDRF/police extraction and transport',
    dispatch_rescue_btn: 'Dispatch SDRF Evacuation Unit',
  },
  hi: {
    portal_title: 'पुलिस एवं राजमार्ग गश्ती सेक्टर कमान पोर्टल',
    rank_badge: 'वैधानिक रैंक (9.5)',
    jurisdiction_sub: 'अधिकार क्षेत्र: दीमा हसाओ एवं बराक घाटी सेक्टर • भारतीय नागरिक सुरक्षा संहिता (BNSS) 2023 की धारा 187 के तहत यातायात विनियमन',
    launch_map: 'रणनीतिक मानचित्र खोलें',
    vhf_label: 'VHF आपातकालीन चैनल',
    vhf_val: 'चैनल 14 (156.700 MHz) सक्रिय',
    mandate_label: 'वैधानिक अधिदेश',
    mandate_val: 'BNSS 2023 धारा 187 एवं DM अधिनियम 2005',
    convoys_label: 'सक्रिय एस्कॉर्ट काफिले',
    convoys_val: '3 सुरक्षित / 1 मार्ग में',
    active_missions_title: 'सेक्टर में सक्रिय राहत काफिले एवं पुलिस एस्कॉर्ट',
    active_missions_sub: 'क्षेत्रीय राजमार्गों पर वास्तविक समय काफिला निगरानी',
    report_disruption_title: 'सेक्टर सुगम्यता एवं वाहन उपयुक्तता रिपोर्ट एडमिन को भेजें',
    report_disruption_sub: 'सत्यापित सड़क स्थिति, अनुशंसित वाहन श्रेणी एवं आवश्यक उपकरण सीधे राज्य EOC को भेजें',
    corridor_label: 'राजमार्ग गलियारा / सेक्टर',
    hazard_type_label: 'अवरोध / खतरा प्रकार',
    severity_label: 'गंभीरता का स्तर',
    desc_label: 'फील्ड अवलोकन / जमीनी स्थिति',
    desc_placeholder: 'अवरोध का विस्तार, कीचड़ की गहराई या पुल की स्थिति का विवरण लिखें...',
    submit_btn: 'मार्ग सुगम्यता एवं वाहन आवश्यकता एडमिन को भेजें',
    submitting: 'रिपोर्ट भेजी जा रही है...',
    radio_checkpoints_title: 'सक्रिय VHF रिपीटर एवं पुलिस चेकपॉइंट',
    radio_checkpoints_sub: 'मोबाइल नेटवर्क विहीन क्षेत्रों में संपर्क बनाए रखने वाले रिले टॉवर',
    vehicle_recommendation_label: 'अनुशंसित वाहन श्रेणी (जमीनी वास्तविकता अनुसार)',
    equipment_needs_label: 'आवश्यक उपकरण (JCB / बेली ब्रिज)',
    passability_label: 'मार्ग पर मोटर वाहन आवागमन स्थिति',
    corridor_execution_title: 'एडमिन द्वारा चयनित अंतिम गलियारा निर्देश एवं टेलीमेट्री',
    corridor_execution_sub: 'राज्य EOC एडमिन द्वारा स्वीकृत मार्ग, आवंटित वाहन प्रकार एवं पुलिस एस्कॉर्ट',
    rescue_queue_title: 'नागरिक बचाव एवं निकासी कतार (चिन्हित सुरक्षित स्थल)',
    rescue_queue_sub: 'सुरक्षित बाहर निकले नागरिकों द्वारा चिन्हित स्थल जहां SDRF बचाव दल भेजना आवश्यक है',
    dispatch_rescue_btn: 'SDRF बचाव दल रवाना करें',
  },
  as: {
    portal_title: 'আৰক্ষী আৰু ঘাইপথ টহলদাৰী খণ্ড কমাণ্ড পৰ্টেল',
    rank_badge: 'বিধিবদ্ধ অগ্ৰাধিকাৰ (৯.৫)',
    jurisdiction_sub: 'অধিকাৰক্ষেত্ৰ: ডিমা হাছাও আৰু বৰাক উপত্যকা খণ্ড • BNSS ২০২৩ ৰ ধাৰা ১৮৭ ৰ অধীনত যান-বাহন নিয়ন্ত্ৰণ',
    launch_map: 'ৰণনীতিমূলক মেপ খোলক',
    vhf_label: 'VHF জৰুৰীকালীন চেনেল',
    vhf_val: 'চেনেল ১৪ (১৫৬.৭০০ MHz) সক্ৰিয়',
    mandate_label: 'বিধিবদ্ধ আদেশ',
    mandate_val: 'BNSS ২০২৩ ধাৰা ১৮৭ আৰু DM আইন ২০০৫',
    convoys_label: 'সক্ৰিয় সুৰক্ষা কনভয়',
    convoys_val: '৩ সুৰক্ষিত / ১ পথত আছে',
    active_missions_title: 'খণ্ডত সক্ৰিয় সাহায্য কনভয় আৰু আৰক্ষী সুৰক্ষা',
    active_missions_sub: 'আঞ্চলিক ঘাইপথত সাহায্য কনভয়ৰ লাইভ নিৰীক্ষণ',
    report_disruption_title: 'পথৰ অৱস্থা আৰু উপযুক্ত বাহনৰ প্ৰতিবেদন এডমিনলৈ প্ৰেৰণ',
    report_disruption_sub: 'প্ৰাকৃতিক অৱস্থা, উপযুক্ত বাহনৰ প্ৰকাৰ আৰু প্ৰয়োজনীয় সামগ্ৰী ৰাজ্যিক EOC লৈ প্ৰেৰণ কৰক',
    corridor_label: 'ঘাইপথ খণ্ড / কৰিডৰ',
    hazard_type_label: 'বিপদ / বাধাৰ প্ৰকাৰ',
    severity_label: 'বিপদৰ মাত্ৰা',
    desc_label: 'প্ৰত্যক্ষদৰ্শীৰ বিৱৰণ / প্ৰাকৃতিক অৱস্থা',
    desc_placeholder: 'পথৰ অৱস্থা, পলসৰ গভীৰতা আৰু ক্ষয়-ক্ষতিৰ বিৱৰণ লিখক...',
    submit_btn: 'উপযুক্ত পথ আৰু বাহনৰ প্ৰতিবেদন এডমিনলৈ প্ৰেৰণ কৰক',
    submitting: 'প্ৰেৰণ কৰা হৈছে...',
    radio_checkpoints_title: 'সক্ৰিয় VHF ৰিপিটাৰ আৰু আৰক্ষী চকীবোৰ',
    radio_checkpoints_sub: 'মবাইল নেটৱৰ্ক নথকা ঠাইত যোগাযোগৰ বাবে ৰিলে টাৱাৰ',
    vehicle_recommendation_label: 'উপযুক্ত বাহনৰ শ্ৰেণী (মাটিৰ অৱস্থা অনুসৰি)',
    equipment_needs_label: 'প্ৰয়োজনীয় উদ্ধাৰ আৰু নিৰ্মাণ সঁজুলি',
    passability_label: 'যান-বাহন চলাচলৰ সামৰ্থ্য',
    corridor_execution_title: 'এডমিনে বাছনি কৰা চূড়ান্ত পথ আৰু নিৰ্দেশনা',
    corridor_execution_sub: 'ৰাজ্যিক EOC এডমিনৰ দ্বাৰা নিৰ্ধাৰিত পথ আৰু বাহনৰ নিৰ্দেশনা',
    rescue_queue_title: 'নাগৰিক উদ্ধাৰ আৰু নিৰাপদ আশ্ৰয়স্থলৰ তালিকা',
    rescue_queue_sub: 'আৱদ্ধ নাগৰিকে চিহ্নিত কৰা স্থানসমূহলৈ SDRF দল প্ৰেৰণ কৰক',
    dispatch_rescue_btn: 'SDRF উদ্ধাৰকাৰী দল প্ৰেৰণ কৰক',
  },
  bn: {
    portal_title: 'পুলিশ ও হাইওয়ে পেট্রোল সেক্টর কমান্ড পোর্টাল',
    rank_badge: 'আইনি পদমর্যাদা (৯.৫)',
    jurisdiction_sub: 'এখতিয়ার: ডিমা হাসাও ও বরাক উপত্যকা সেক্টর • BNSS ২০২৩ ধারা ১৮৭ এর অধীনে যানবাহন নিয়ন্ত্রণ',
    launch_map: 'কমান্ড ম্যাপ খুলুন',
    vhf_label: 'VHF জরুরি চ্যানেল',
    vhf_val: 'চ্যানেল ১৪ (১৫৬.৭০০ MHz) সক্রিয়',
    mandate_label: 'আইনি আদেশ',
    mandate_val: 'BNSS ২০২৩ ধারা ১৮৭ ও DM আইন ২০০৫',
    convoys_label: 'সক্রিয় এস্কর্ট কনভয়',
    convoys_val: '৩ নিরাপদ / ১ পথে আছে',
    active_missions_title: 'সেক্টরে সক্রিয় ত্রাণ কনভয় ও পুলিশ এস্কর্ট',
    active_missions_sub: 'আঞ্চলিক মহাসড়কে লাইভ কনভয় ট্র্যাকিং',
    report_disruption_title: 'সড়ক পরিস্থিতি ও উপযুক্ত যানবাহনের রিপোর্ট অ্যাডমিনকে পাঠান',
    report_disruption_sub: 'যাচাইকৃত সড়ক অবস্থা, উপযুক্ত যানবাহনের ধরন ও প্রয়োজনীয় সরঞ্জাম স্টেট EOC-তে পাঠান',
    corridor_label: 'মহাসড়ক করিডোর / সেক্টর',
    hazard_type_label: 'বাধার ধরন',
    severity_label: 'তীব্রতার মাত্রা',
    desc_label: 'মাঠ পর্যায়ের পর্যবেক্ষণ ও পরিস্থিতি',
    desc_placeholder: 'রাস্তার ক্ষতি, কাদার গভীরতা বা ব্রিজের অবস্থা লিখুন...',
    submit_btn: 'উপযুক্ত রুট ও যানবাহনের সুপারিশ অ্যাডমিনকে পাঠান',
    submitting: 'পাঠানো হচ্ছে...',
    radio_checkpoints_title: 'সক্রিয় VHF রিপিটার ও পুলিশ চেকপয়েন্ট',
    radio_checkpoints_sub: 'মোবাইল নেটওয়ার্কহীন এলাকায় যোগাযোগের জন্য রিলে টাওয়ার',
    vehicle_recommendation_label: 'উপযুক্ত যানবাহন শ্রেণি (মাঠের বাস্তবতা অনুযায়ী)',
    equipment_needs_label: 'প্রয়োজনীয় সরঞ্জাম (JCB / বেইলি ব্রিজ)',
    passability_label: 'যানবাহন চলাচলের উপযোগিতা',
    corridor_execution_title: 'অ্যাডমিন কর্তৃক নির্বাচিত চূড়ান্ত রুট ও নির্দেশিকা',
    corridor_execution_sub: 'স্টেট EOC অ্যাডমিন কর্তৃক অনুমোদিত করিডোর ও পুলিশ এস্কর্ট নির্দেশ',
    rescue_queue_title: 'নাগরিক উদ্ধার ও নিরাপদ আশ্রয়স্থলের তালিকা',
    rescue_queue_sub: 'নাগরিকদের চিহ্নিত নিরাপদ স্থানে SDRF টিম পাঠান',
    dispatch_rescue_btn: 'SDRF উদ্ধারকারী দল পাঠান',
  },
  mn: {
    portal_title: 'পুলিস অমসুং হাইৱে পেত্রোল সেক্তৰ কমান্দ পোৰ্তেল',
    rank_badge: 'আইনগী পদম (৯.৫)',
    jurisdiction_sub: 'দিমা হসাও অমসুং বরাক তম্পাক সেক্তৰ • BNSS ২০২৩ গী সেক্সন ১৮৭ গী মখাদা ত্রাফিক কন্ত্রোল',
    launch_map: 'কমান্দ মেপ হাংদোকউ',
    vhf_label: 'VHF জৰুৰী চেনেল',
    vhf_val: 'চেনেল ১৪ (১৫৬.৭০০ MHz) হিংলি',
    mandate_label: 'আইনগী রুল',
    mandate_val: 'BNSS ২০২৩ সেক্সন ১৮৭ অমসুং DM এক্ত ২০০৫',
    convoys_label: 'এস্কোর্ত কনভোই',
    convoys_val: '৩ সেফ / ১ লম্বীদা',
    active_missions_title: 'সেক্তরদা চত্থরিবা ত্রাণ কনভোই অমসুং পুলিস ঙাকশেল',
    active_missions_sub: 'হাইৱে লম্বীদা লাইভ কনভোই ত্রেক তৌবা',
    report_disruption_title: 'লম্বীগী ফিভম অমসুং গারীগী মখল এদমিনদা পাউ পীবা',
    report_disruption_sub: 'লম্বীগী ফিভম, চৎপা য়াবা গারীগী মখল অমসুং মথৌ তাবা পোৎলম এদমিনদা থাগৎলু',
    corridor_label: 'হাইৱে সেক্তৰ',
    hazard_type_label: 'অপনবগী মখল',
    severity_label: 'অকুপ্পা চাং',
    desc_label: 'গ্রাউন্দদা থোক্লিবা ফিভম',
    desc_placeholder: 'লম্বী কাইবা অমসুং থোক্লিবা ফিবম ইবীয়ু...',
    submit_btn: 'ফিভম অমসুং গারীগী পাউ এদমিনদা থাগৎলু',
    submitting: 'থাগৎলি...',
    radio_checkpoints_title: 'হিংলিবা VHF রিপিতর অমসুং পুলিস চেকপোইন্ত',
    radio_checkpoints_sub: 'মোবাইল নেতৱর্ক লৈতবা মফমদা ৱারী শানবগী টাৱার',
    vehicle_recommendation_label: 'চৎপা য়াবা গারীগী মখল (গ্রাউন্দদা য়েংলগা)',
    equipment_needs_label: 'মথৌ তাবা খুৎশু-খুৎলাই (JCB / বেলি ব্রিজ)',
    passability_label: 'গারী চৎপা য়াবগী ফিভম',
    corridor_execution_title: 'এদমিননা খনবা অরোইবা লম্বী অমসুং পাউতাক',
    corridor_execution_sub: 'স্তেত EOC এদমিননা অয়াবা পীবা লম্বী অমসুং পুলিস এস্কোর্ত',
    rescue_queue_title: 'মী য়োকখৎপগী অমসুং সেফ জোনগী পাউ',
    rescue_queue_sub: 'নাগরিকশিংনা তাকপা সেফ মফমশিংদা SDRF তিম থাগৎলু',
    dispatch_rescue_btn: 'SDRF রেস্কিউ তিম থাগৎলু',
  },
}
