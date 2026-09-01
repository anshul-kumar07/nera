import { LanguageCode } from '@/lib/i18n'

export interface MissionsTranslations {
  title: string
  subtitle: string
  btn_new_mission: string
  kpi_total: string
  kpi_total_sub: string
  kpi_pending: string
  kpi_pending_sub: string
  kpi_transit: string
  kpi_transit_sub: string
  kpi_completed: string
  kpi_completed_sub: string
  filter_all_statuses: string
  filter_all_priorities: string
  no_missions: string
  tab_route: string
  tab_vehicle: string
  tab_cargo: string
  tab_readiness: string
  tab_failure: string
  btn_approve: string
  btn_reject: string
  btn_dispatch: string
  btn_arrived: string
  btn_complete: string
  btn_report_failure: string
}

export const MISSIONS_I18N: Record<LanguageCode, MissionsTranslations> = {
  en: {
    title: 'MISSION LOGISTICS DISPATCH & ESCORT COMMAND',
    subtitle: 'End-to-End Multi-Modal Relief Operations across North Eastern States',
    btn_new_mission: 'NEW MISSION',
    kpi_total: 'Total Missions',
    kpi_total_sub: 'Disaster response initiatives',
    kpi_pending: 'Pending Review',
    kpi_pending_sub: 'Awaiting authority signoff',
    kpi_transit: 'In Transit / Dispatched',
    kpi_transit_sub: 'En-route live convoy tracking',
    kpi_completed: 'Completed',
    kpi_completed_sub: 'Signed-off & delivered',
    filter_all_statuses: 'All Statuses',
    filter_all_priorities: 'All Priorities',
    no_missions: 'No operational missions match the active filter criteria.',
    tab_route: 'Route Geometry & Bypasses',
    tab_vehicle: 'Assigned Vehicle & Pilot',
    tab_cargo: 'Cargo Manifest & Temp',
    tab_readiness: 'Resource Readiness Checklist',
    tab_failure: 'Failure Recovery & Handover',
    btn_approve: 'Approve Mission',
    btn_reject: 'Reject Mission',
    btn_dispatch: 'Dispatch Convoy',
    btn_arrived: 'Mark Arrived at VAP',
    btn_complete: 'Complete Mission',
    btn_report_failure: 'Report Vehicle Breakdown',
  },
  hi: {
    title: 'राहत मिशन प्रेषण एवं एस्कॉर्ट कमान',
    subtitle: 'पूर्वोत्तर राज्यों में एंड-टू-एंड मल्टी-मॉडल आपदा राहत संचालन',
    btn_new_mission: 'नया मिशन बनाएं',
    kpi_total: 'कुल मिशन',
    kpi_total_sub: 'आपदा प्रतिक्रिया पहल',
    kpi_pending: 'समीक्षा हेतु लंबित',
    kpi_pending_sub: 'प्राधिकरण स्वीकृति की प्रतीक्षा',
    kpi_transit: 'मार्ग में / प्रेषित',
    kpi_transit_sub: 'लाइव काफिला ट्रैकिंग जारी',
    kpi_completed: 'सफलतापूर्वक पूर्ण',
    kpi_completed_sub: 'सत्यापित एवं वितरित',
    filter_all_statuses: 'सभी स्थितियां',
    filter_all_priorities: 'सभी प्राथमिकताएं',
    no_missions: 'सक्रिय फ़िल्टर मानदंडों से कोई मिशन मेल नहीं खाता।',
    tab_route: 'मार्ग एवं बाईपास विवरण',
    tab_vehicle: 'आवंटित वाहन एवं चालक',
    tab_cargo: 'सामग्री सूची एवं तापमान',
    tab_readiness: 'संसाधन तैयारी चेकलिस्ट',
    tab_failure: 'विफलता प्रबंधन एवं हैंडओवर',
    btn_approve: 'मिशन स्वीकृत करें',
    btn_reject: 'मिशन अस्वीकार करें',
    btn_dispatch: 'काफिला प्रेषित करें',
    btn_arrived: 'VAP पर आगमन दर्ज करें',
    btn_complete: 'मिशन पूर्ण करें',
    btn_report_failure: 'वाहन खराबी दर्ज करें',
  },
  as: {
    title: 'সাহায্য অভিযান প্ৰেৰণ আৰু সুৰক্ষা কমাণ্ড',
    subtitle: 'উত্তৰ-পূৰ্বাঞ্চলৰ ৰাজ্যসমূহত সাহায্য যোগান অভিযান',
    btn_new_mission: 'নতুন অভিযান সৃষ্টি',
    kpi_total: 'মুঠ অভিযান',
    kpi_total_sub: 'দুৰ্যোগ সাহায্য পদক্ষেপ',
    kpi_pending: 'অনুমোদনৰ বাবে বাকী',
    kpi_pending_sub: 'কৰ্তৃপক্ষৰ অনুমোদন বাকী',
    kpi_transit: 'পথত / প্ৰেৰিত',
    kpi_transit_sub: 'লাইভ কনভয় নিৰীক্ষণ',
    kpi_completed: 'সম্পূৰ্ণ হ’ল',
    kpi_completed_sub: 'বিতৰণ সম্পন্ন হ’ল',
    filter_all_statuses: 'সকলো স্থিতি',
    filter_all_priorities: 'সকলো অগ্ৰাধিকাৰ',
    no_missions: 'এই ফিল্টাৰত কোনো অভিযান পোৱা নগ’ল।',
    tab_route: 'পথ আৰু বৈকল্পিক মেপ',
    tab_vehicle: 'নিৰ্ধাৰিত বাহন আৰু চালক',
    tab_cargo: 'সামগ্ৰীৰ তালিকা আৰু উষ্ণতা',
    tab_readiness: 'সাজু অৱস্থা পৰীক্ষা',
    tab_failure: 'যান্ত্ৰিক বিজুতি আৰু হস্তান্তৰ',
    btn_approve: 'অভিযান অনুমোদন কৰক',
    btn_reject: 'অভিযান বাতিল কৰক',
    btn_dispatch: 'কনভয় প্ৰেৰণ কৰক',
    btn_arrived: 'VAP ত উপস্থিত হ’ল',
    btn_complete: 'অভিযান সমাপ্ত কৰক',
    btn_report_failure: 'বাহনৰ বিজুতি দাখিল কৰক',
  },
  bn: {
    title: 'ত্রাণ অভিযান প্রেরণ ও নিরাপত্তা কমান্ড',
    subtitle: 'উত্তর-পূর্ব রাজ্যসমূহে বহু-মাধ্যম ত্রাণ কার্যক্রম',
    btn_new_mission: 'নতুন মিশন',
    kpi_total: 'মোট মিশন',
    kpi_total_sub: 'জরুরি ত্রাণ কার্যক্রম',
    kpi_pending: 'অনুমোদনের অপেক্ষায়',
    kpi_pending_sub: 'কর্তৃপক্ষের স্বাক্ষর প্রয়োজন',
    kpi_transit: 'পথে রয়েছে / প্রেরিত',
    kpi_transit_sub: 'লাইভ কনভয় ট্র্যাকিং',
    kpi_completed: 'সম্পন্ন হয়েছে',
    kpi_completed_sub: 'ডেলিভারি সম্পন্ন',
    filter_all_statuses: 'সকল অবস্থা',
    filter_all_priorities: 'সকল অগ্রাধিকার',
    no_missions: 'কোনো সক্রিয় মিশন পাওয়া যায়নি।',
    tab_route: 'রুট ও বিকল্প পথ',
    tab_vehicle: 'বরাদ্দকৃত যান ও চালক',
    tab_cargo: 'পণ্য তালিকা ও তাপমাত্রা',
    tab_readiness: 'প্রস্তুতি চেকলিস্ট',
    tab_failure: 'ত্রুটি ব্যবস্থাপনা ও হ্যান্ডওভার',
    btn_approve: 'মিশন অনুমোদন করুন',
    btn_reject: 'মিশন প্রত্যাখ্যান করুন',
    btn_dispatch: 'কনভয় প্রেরণ করুন',
    btn_arrived: 'VAP তে পৌঁছানোর নিশ্চিতকরণ',
    btn_complete: 'মিশন সমাপ্ত করুন',
    btn_report_failure: 'যানবাহন বিকল রিপোর্ট',
  },
  mn: {
    title: 'ত্রাণ মিসন থাদোকপা অমসুং ঙাকশেন কমান্দ',
    subtitle: 'অৱাং নোংপোক রাজ্যশিংদা ত্রাণ মিসন চত্থবা',
    btn_new_mission: 'অনৌবা মিসন',
    kpi_total: 'অপুনবা মিসন',
    kpi_total_sub: 'খুদোংথিবা মতমগী থবক',
    kpi_pending: 'অয়াবা পীবগীদমক লৈরিবা',
    kpi_pending_sub: 'ওফিসারগী অয়াবা মথৌ তাই',
    kpi_transit: 'লম্বীদা চৎলিবা',
    kpi_transit_sub: 'লাইভ গারি ত্রেক তৌবা',
    kpi_completed: 'লোইশিনখ্রবা',
    kpi_completed_sub: 'পোৎলম য়েন্থোকপা লোইরে',
    filter_all_statuses: 'ফিভম পুম্নমক',
    filter_all_priorities: 'প্রায়োরিতি পুম্নমক',
    no_missions: 'মিসন অমত্তা ফংদে।',
    tab_route: 'লম্বী অমসুং মেপ',
    tab_vehicle: 'গারি অমসুং দ্রাইভর',
    tab_cargo: 'পোৎলমগী পরিং',
    tab_readiness: 'সেফতি চেক',
    tab_failure: 'গারি কাইবা অমসুং খুৎশিন্নবা',
    btn_approve: 'মিসন অয়াবা পীবীয়ু',
    btn_reject: 'মিসন য়াদবা ফোঙদোকউ',
    btn_dispatch: 'গারি থাদোকউ',
    btn_arrived: 'VAP দা য়ৌরে',
    btn_complete: 'মিসন লোইশিল্লু',
    btn_report_failure: 'গারি কাইবা ফোঙদোকউ',
  },
}

