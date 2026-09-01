// Phase 7: Multilingual Operational & Notification Verification Suite

import fs from 'fs'
import path from 'path'

function runI18nTests() {
  console.log('========================================================================')
  console.log('   PHASE 7: MULTILINGUAL NOTIFICATIONS & UI VERIFICATION SUITE           ')
  console.log('========================================================================\n')

  let passedTests = 0
  let totalTests = 0

  function assert(condition, testName, details = '') {
    totalTests++
    if (condition) {
      passedTests++
      console.log(`✅ [PASS] ${testName}`)
      if (details) console.log(`   └─ ${details}`)
    } else {
      console.error(`❌ [FAIL] ${testName}`)
      if (details) console.error(`   └─ ${details}`)
    }
  }

  // Load i18n file contents
  const i18nFilePath = path.join(process.cwd(), 'lib', 'i18n.ts')
  const i18nContent = fs.readFileSync(i18nFilePath, 'utf8')

  // TEST 1: English dictionary exists and is defined
  assert(
    i18nContent.includes('export const TRANSLATIONS') && i18nContent.includes('en: {'),
    'TEST 1: English (en) translation dictionary is defined',
    'Found standard English dictionary definitions'
  )

  // TEST 2: Hindi dictionary exists and is defined
  assert(
    i18nContent.includes('hi: {'),
    'TEST 2: Hindi (hi) translation dictionary is defined',
    'Found Hindi translation mapping'
  )

  // TEST 3: Essential operational terms are present
  const requiredOperationalKeys = [
    'brand_title',
    'system_online',
    'system_offline',
    'nav_dashboard',
    'nav_map',
    'nav_vehicles',
    'nav_incidents',
    'nav_report',
    'report_incident_btn',
    'status_open',
    'status_blocked',
    'status_at_risk',
  ]

  let missingKeysCount = 0
  for (const key of requiredOperationalKeys) {
    if (!i18nContent.includes(`${key}:`)) {
      missingKeysCount++
    }
  }
  assert(
    missingKeysCount === 0,
    'TEST 3: Required operational translation keys exist in dictionary',
    `Checked ${requiredOperationalKeys.length} operational keys`
  )

  // TEST 4: Hindi translations contain native Devanagari script strings
  assert(
    i18nContent.includes('डैशबोर्ड') || i18nContent.includes('मानचित्र') || i18nContent.includes('सक्रिय'),
    'TEST 4: Hindi translations contain authentic Devanagari operational terms',
    'Verified native Devanagari vocabulary'
  )

  // TEST 5: Assamese regional language support exists
  assert(
    i18nContent.includes('as: {'),
    'TEST 5: Assamese (as) regional language dictionary exists for North East India',
    'Verified Assamese language support'
  )

  console.log('\n========================================================================')
  console.log(`           SUMMARY: ${passedTests}/${totalTests} TESTS PASSED CLEANLY             `)
  console.log('========================================================================\n')

  if (passedTests !== totalTests) {
    process.exit(1)
  }
}

runI18nTests()

