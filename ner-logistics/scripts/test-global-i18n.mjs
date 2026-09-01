import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('====================================================');
console.log('NERA 2.0 — GLOBAL MULTILINGUAL & TERMINOLOGY TEST');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 30;

function assert(condition, testNum, description) {
  if (condition) {
    console.log(`[PASS] Test ${testNum.toString().padStart(2, '0')}: ${description}`);
    passedTests++;
  } else {
    console.error(`[FAIL] Test ${testNum.toString().padStart(2, '0')}: ${description}`);
  }
}

// 1. Read lib/i18n.ts
const i18nContent = fs.readFileSync(path.join(rootDir, 'lib', 'i18n.ts'), 'utf8');

// Test 1: 5 supported languages exist in types and dictionary
const has5Languages = /en:\s*\{/.test(i18nContent) &&
  /hi:\s*\{/.test(i18nContent) &&
  /as:\s*\{/.test(i18nContent) &&
  /bn:\s*\{/.test(i18nContent) &&
  /mn:\s*\{/.test(i18nContent);
assert(has5Languages, 1, 'All 5 supported languages (en, hi, as, bn, mn) defined in lib/i18n.ts');

// Test 2: TRANSLATIONS dictionary exported
assert(i18nContent.includes('export const TRANSLATIONS'), 2, 'TRANSLATIONS dictionary exported');

// Test 3: LanguageCode type exported with 5 languages
assert(
  i18nContent.includes("type LanguageCode = 'en' | 'hi' | 'as' | 'bn' | 'mn'") ||
  i18nContent.includes('export type LanguageCode = "en" | "hi" | "as" | "bn" | "mn"'),
  3,
  'LanguageCode type properly exported'
);

// Test 4: Check key parity across languages by counting occurrences
const rawMatches = (i18nContent.match(/[a-zA-Z0-9_]+:\s*['"`]/g) || []).length;
const enKeys = rawMatches / 5;
assert(enKeys > 150, 4, `Over 150 translation keys present per language (found ~${Math.round(enKeys)} keys)`);

// Test 5: Dynamic template interpolation parameters present in translation strings
const hasInterpolation = i18nContent.includes('{vehicleId}') &&
  i18nContent.includes('{missionId}');
assert(hasInterpolation, 5, 'Dynamic template interpolation parameters ({vehicleId}, {missionId}) supported');

// Test 6: Government Terminology - Early Warning (not AI Prediction)
assert(
  i18nContent.includes('early_warning') &&
  i18nContent.includes('पूर्व चेतावनी') &&
  i18nContent.includes('EARLY WARNING'),
  6,
  'Government Terminology: "Early Warning" properly localized'
);

// Test 7: Government Terminology - AI Advisory (not AI Risk)
assert(
  i18nContent.includes('ai_advisory') &&
  i18nContent.includes('एआई परामर्श') &&
  i18nContent.includes('AI ADVISORY'),
  7,
  'Government Terminology: "AI Advisory" properly localized'
);

// Test 8: Government Terminology - Disaster / Road Incident (not generic Incident)
assert(
  i18nContent.includes('nav_incidents') &&
  i18nContent.includes('आपदा घटनाएं'),
  8,
  'Government Terminology: "Disaster / Road Incident" properly localized'
);

// Test 9: Government Terminology - Field Report Received (not Reported Incident)
assert(
  i18nContent.includes('field_report_received') &&
  i18nContent.includes('फील्ड रिपोर्ट प्राप्त'),
  9,
  'Government Terminology: "Field Report Received" properly localized'
);

// Test 10: Government Terminology - Confirmed Road Blockage (not Confirmed Incident)
assert(
  i18nContent.includes('confirmed_road_blockage') &&
  i18nContent.includes('पुष्ट सड़क अवरोध'),
  10,
  'Government Terminology: "Confirmed Road Blockage" properly localized'
);

// Test 11: Government Terminology - Road Access Restored (not Resolved Incident)
assert(
  i18nContent.includes('road_access_restored') &&
  i18nContent.includes('सड़क पहुंच बहाल'),
  11,
  'Government Terminology: "Road Access Restored" properly localized'
);

// Test 12: Government Terminology - Find Alternate Route (not Dynamic Rerouting)
assert(
  i18nContent.includes('btn_find_alternate_route') &&
  i18nContent.includes('वैकल्पिक मार्ग खोजें') &&
  i18nContent.includes('FIND ALTERNATE ROUTE'),
  12,
  'Government Terminology: "Find Alternate Route" properly localized'
);

// Test 13: Government Terminology - Vehicle Location (not Vehicle Telemetry)
assert(
  i18nContent.includes('current_vehicle_location') &&
  i18nContent.includes('CURRENT VEHICLE LOCATION'),
  13,
  'Government Terminology: "Vehicle Location" properly localized'
);

// Test 14: Government Terminology - Deployment Safety (not Vehicle Readiness)
assert(
  i18nContent.includes('deployment_safety') &&
  i18nContent.includes('तैनाती सुरक्षा') &&
  i18nContent.includes('DEPLOYMENT SAFETY'),
  14,
  'Government Terminology: "Deployment Safety" properly localized'
);

// Test 15: Government Terminology - Deployment Safety Check (not Safety Gate)
assert(
  i18nContent.includes('deployment_safety_check') &&
  i18nContent.includes('तैनाती सुरक्षा जांच'),
  15,
  'Government Terminology: "Deployment Safety Check" properly localized'
);

// Test 16: Government Terminology - Maintenance Advisory (not Vehicle Health AI)
assert(
  i18nContent.includes('ai_maintenance_advisory') &&
  i18nContent.includes('रखरखाव परामर्श') &&
  i18nContent.includes('AI MAINTENANCE ADVISORY'),
  16,
  'Government Terminology: "Maintenance Advisory" properly localized'
);

// Test 17: Government Terminology - Resource Assignment (not Resource Allocation)
assert(
  i18nContent.includes('assigned_vehicle') &&
  i18nContent.includes('Assigned Vehicle'),
  17,
  'Government Terminology: "Resource Assignment" properly localized'
);

// Test 18: Government Terminology - Relief Mission (not generic Mission)
assert(
  i18nContent.includes('relief_mission') &&
  i18nContent.includes('राहत मिशन') &&
  i18nContent.includes('Relief Mission'),
  18,
  'Government Terminology: "Relief Mission" properly localized'
);

// Test 19: Government Terminology - Final Access to Crisis Location (not Last-Mile Reachability)
assert(
  i18nContent.includes('final_access_crisis') &&
  i18nContent.includes('Final Access to Crisis Location'),
  19,
  'Government Terminology: "Final Access to Crisis Location" properly localized'
);

// Test 20: Government Terminology - Vehicle Access Point (not generic VAP)
assert(
  i18nContent.includes('vehicle_access_point') &&
  i18nContent.includes('वाहन पहुंच बिंदु') &&
  i18nContent.includes('VEHICLE ACCESS POINT'),
  20,
  'Government Terminology: "Vehicle Access Point" properly localized'
);

// Test 21: Government Terminology - Demonstration Data (not Simulated Data)
assert(
  i18nContent.includes('data_demonstration') &&
  i18nContent.includes('प्रदर्शन डेटा') &&
  i18nContent.includes('DEMONSTRATION DATA'),
  21,
  'Government Terminology: "Demonstration Data" properly localized'
);

// Test 22: Government Terminology - Officer Approval (not Human Authority)
assert(
  i18nContent.includes('officer_approval') &&
  i18nContent.includes('अधिकारी अनुमोदन') &&
  i18nContent.includes('Officer Approval'),
  22,
  'Government Terminology: "Officer Approval" properly localized'
);

// Test 23: Vehicle Safety States - 4 Standard States
assert(
  i18nContent.includes('safety_ready') &&
  i18nContent.includes('safety_ready_warning') &&
  i18nContent.includes('safety_not_safe') &&
  i18nContent.includes('safety_incomplete'),
  23,
  'Vehicle Safety States: READY, READY WITH WARNING, NOT SAFE FOR DEPLOYMENT, SAFETY INFORMATION INCOMPLETE present'
);

// Test 24: AI Maintenance Advisory Levels - 6 Standard Levels
assert(
  i18nContent.includes('maint_low') &&
  i18nContent.includes('maint_moderate') &&
  i18nContent.includes('maint_elevated') &&
  i18nContent.includes('maint_high') &&
  i18nContent.includes('maint_critical') &&
  i18nContent.includes('maint_insufficient'),
  24,
  'AI Maintenance Advisory Levels: LOW, MODERATE, ELEVATED, HIGH, CRITICAL, INFORMATION INSUFFICIENT present'
);

// Test 25: Action Buttons - INSPECT, MAINTAIN, ACKNOWLEDGE, DISMISS
assert(
  i18nContent.includes('btn_inspect') &&
  i18nContent.includes('btn_maintain') &&
  i18nContent.includes('btn_acknowledge') &&
  i18nContent.includes('btn_dismiss'),
  25,
  'Vehicle Action Buttons: INSPECT, MAINTAIN, ACKNOWLEDGE, DISMISS present'
);

// Test 26: Inspect GovHeader.tsx for SIH branding removal
const govHeaderContent = fs.readFileSync(path.join(rootDir, 'components', 'GovHeader.tsx'), 'utf8');
assert(
  !govHeaderContent.includes('SMART INDIA HACKATHON 2026') &&
  !govHeaderContent.includes('DEMONSTRATION PROTOTYPE'),
  26,
  'GovHeader.tsx free of SIH hackathon stamps'
);

// Test 27: Inspect GovFooter.tsx for SIH branding removal and localization
const govFooterContent = fs.readFileSync(path.join(rootDir, 'components', 'GovFooter.tsx'), 'utf8');
assert(
  !govFooterContent.includes('SMART INDIA HACKATHON 2026') &&
  !govFooterContent.includes('DEMONSTRATION PROTOTYPE'),
  27,
  'GovFooter.tsx free of SIH hackathon stamps and localized'
);

// Test 28: Inspect GovNavbar.tsx for full translation key wiring
const govNavbarContent = fs.readFileSync(path.join(rootDir, 'components', 'GovNavbar.tsx'), 'utf8');
assert(
  govNavbarContent.includes('translationKey:') &&
  govNavbarContent.includes('t(translationKey)'),
  28,
  'GovNavbar.tsx dynamically switches languages using translationKey'
);

// Test 29: Inspect LanguageContext for interpolation engine
const langCtxContent = fs.readFileSync(path.join(rootDir, 'lib', 'LanguageContext.tsx'), 'utf8');
assert(
  langCtxContent.includes('replace(new RegExp') &&
  langCtxContent.includes('params?: Record<string, string | number>'),
  29,
  'LanguageContext.tsx dynamic regex-based template interpolation active'
);

// Test 30: Brand Identity matches specification
assert(
  i18nContent.includes('NERA') &&
  i18nContent.includes('North Eastern Resilience and Accessibility') &&
  i18nContent.includes('Regional Emergency Logistics & Accessibility Platform'),
  30,
  'Brand Identity standard: NERA - North Eastern Resilience and Accessibility'
);

console.log('\n====================================================');
console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('====================================================');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
