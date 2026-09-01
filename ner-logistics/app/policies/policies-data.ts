import { LanguageCode } from '@/lib/i18n'

export interface PolicySection {
  heading: string
  content: string[]
  subsections?: { subheading: string; points: string[] }[]
}

export interface PolicyDefinition {
  id: string
  title: string
  shortTitle: string
  lastUpdated: string
  badge: string
  gazetteRef: string
  metaDescription: string
  sections: PolicySection[]
}

// ── English Policies Database ──
const EN_POLICIES: Record<string, PolicyDefinition> = {
  'website-policies': {
    id: 'website-policies',
    title: 'Website & Digital Infrastructure Policies',
    shortTitle: 'Website Policies',
    lastUpdated: 'August 2026',
    badge: 'GIGW 3.0 Standard',
    gazetteRef: 'MDONER/NERA/2026/WEB-01',
    metaDescription: 'Official operational uptime SLA, multi-agency sensor ingestion, bilingual rendering, and accessibility thresholds for the NERA national platform.',
    sections: [
      {
        heading: '1. Framework & Statutory Mandate',
        content: [
          'The North East Disaster Logistics & Resilient Routing Platform (NERA) is established under the aegis of the Ministry of Development of North Eastern Region (MDoNER), Government of India, in joint coordination with the National Disaster Management Authority (NDMA) and the State Disaster Management Authorities (SDMAs) of Arunachal Pradesh, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura.',
          'These Website Policies govern the operational performance, accessibility thresholds, and technical standards applied across all public citizen-facing endpoints, field mobile simulators, and open telemetry streaming microservices.',
        ],
      },
      {
        heading: '2. Multi-Agency Authoritative Sensor Integration',
        content: [
          'All GIS map vectors, meteorological radar feeds, soil saturation metrics, and river discharge hydrographs rendered in NERA are directly ingested from verified statutory institutions:',
          '• India Meteorological Department (IMD): Doppler radar reflectivity and Quantitative Precipitation Forecasts (QPF).',
          '• Geological Survey of India (GSI): Landslide Early Warning System (LEWS) dynamic hill slope risk polygons.',
          '• Central Water Commission (CWC): River gauge hydrographs and danger flood level telemetry.',
          '• Border Roads Organisation (BRO): Highway status feeds from Projects Swastik, Pushpak, Brahmank, Udayak, and Vartak.',
          '• ISRO Bhuvan & NRSC: High-resolution satellite raster imagery and Digital Elevation Models (DEM).',
        ],
      },
      {
        heading: '3. Accessibility Statement (GIGW 3.0 & WCAG 2.1 AA)',
        content: [
          'NERA is designed and audited to comply with the Guidelines for Indian Government Websites (GIGW 3.0) and Web Content Accessibility Guidelines (WCAG 2.1) Level AA standards.',
          'The platform provides high-contrast emergency mode palettes, full screen-reader semantic markup (ARIA landmarks), and support for 22 scheduled Indian languages via Digital India Bhashini integration.',
        ],
      },
      {
        heading: '4. Service Availability & Redundancy Protocol',
        content: [
          'During active natural disaster declarations and monsoon emergency operations, NERA maintains an operational uptime Service Level Agreement (SLA) target of 99.9% across all national routing microservices.',
          'Local caching via IndexedDB ensures zero data loss during high-altitude VHF mesh failover in deep mountain valleys.',
        ],
      },
    ],
  },
  'terms-of-use': {
    id: 'terms-of-use',
    title: 'Terms of Use & Statutory Compliance',
    shortTitle: 'Terms of Use',
    lastUpdated: 'August 2026',
    badge: 'Statutory DM Act 2005',
    gazetteRef: 'MDONER/NERA/2026/TERMS-02',
    metaDescription: 'Citizen rights, operational responsibilities, AI dynamic routing advisory disclaimers, and statutory penal clauses for NERA.',
    sections: [
      {
        heading: '1. Binding Acceptance of Terms',
        content: [
          'By accessing, authenticating, or logging into the NERA platform (via Admin, Police Officer, or Citizen Beneficiary credentials), you agree to be bound by these Terms of Use and all applicable statutory provisions under the Disaster Management Act, 2005 (Sections 30, 34, 51, and 54) and Section 187 of the Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023.',
        ],
      },
      {
        heading: '2. Law Enforcement & Statutory Field Directives (BNSS Sec 187)',
        content: [
          'Police Officers, Border Roads Organisation (BRO) Engineers, and District Magistrates accessing the Tactical Law Enforcement portal hold statutory authority to broadcast highway severance notices and enforce mandatory traffic diversions.',
          'Under Section 187 of the BNSS, 2023, obstructing authorized disaster relief convoys or failing to comply with police diversion orders on notified arterial corridors (NH-27, NH-10, NH-29, NH-6, NH-102) is a punishable statutory offense.',
        ],
      },
      {
        heading: '3. Predictive AI & Dynamic Routing Disclaimer',
        content: [
          'NERA leverages advanced multi-criteria Dijkstra graph algorithms and predictive AI risk matrices to calculate alternate bypass trajectories, mountain fuel burn models, and bridge load gating ratings.',
          'All dynamic AI routing advisories are decision-support aids designed to assist State Emergency Operations Centres (SEOC) and field incident commanders. Final transit authorization rests with the designated Incident Commander and verified ground reconnaissance units.',
        ],
      },
      {
        heading: '4. Penalties for False Disaster Reporting (DM Act Section 54)',
        content: [
          'Submission of false, malicious, or fabricated hazard reports or bridge collapse claims through the citizen hazard reporting portal is strictly prohibited.',
          'Whoever makes or circulates a false alarm or warning as to disaster or its severity or magnitude, leading to panic, shall on conviction be punishable with imprisonment for a term which may extend to one year or with fine under Section 54 of the Disaster Management Act, 2005.',
        ],
      },
    ],
  },
  'privacy-policy': {
    id: 'privacy-policy',
    title: 'Privacy Statement & Data Protection',
    shortTitle: 'Privacy Statement',
    lastUpdated: 'August 2026',
    badge: 'DPDP Act 2023 Compliant',
    gazetteRef: 'MDONER/NERA/2026/PRIV-03',
    metaDescription: 'Data minimization, AIS-140 GPS fleet tracking confidentiality, telemetry encryption, and citizen privacy protections.',
    sections: [
      {
        heading: '1. Statutory Privacy Mandate',
        content: [
          'NERA operates as a Data Fiduciary under the provisions of the Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023). We are dedicated to safeguarding all personal data and mission telemetry with state-of-the-art cryptographic safeguards and strict purpose limitation.',
        ],
      },
      {
        heading: '2. Scope of Ingested Telemetry Data',
        content: [
          'NERA enforces a strict Data Minimization architecture. The platform processes only operational metrics required for convoy navigation:',
          '• Vehicle Telemetry: AIS-140 standard GPS coordinates, speed, fuel reserves, engine temperature, and cold-chain sensor levels.',
          '• Officer & Pilot Identification: Official departmental service IDs, sector jurisdiction codes, and designated emergency VHF radio callsigns.',
          '• Citizen Reports: Geo-coordinates of reported landslides/waterlogging, timestamp, and optional photographic proof.',
        ],
      },
      {
        heading: '3. Cryptographic Storage & Access Control (RBAC)',
        content: [
          'All mission transit logs, driver personal contacts, and cold-chain vaccine records are encrypted at rest using AES-256-GCM and in transit via TLS 1.3 cryptographic protocols.',
          'Role-Based Access Control (RBAC) enforces strict boundary isolation: Citizen accounts cannot inspect tactical police telemetry or administrative system feeds.',
        ],
      },
    ],
  },
  'hyperlinking-policy': {
    id: 'hyperlinking-policy',
    title: 'Hyperlinking & Inter-Agency Network Policy',
    shortTitle: 'Hyperlinking Policy',
    lastUpdated: 'August 2026',
    badge: 'GIGW 3.0 Compliant',
    gazetteRef: 'MDONER/NERA/2026/LINK-04',
    metaDescription: 'Guidelines regarding inbound hyperlinks to NERA, outbound links to central/state disaster portals, and external verification.',
    sections: [
      {
        heading: '1. Inbound Hyperlinks to NERA',
        content: [
          'Prior formal permission is not required before hyperlinking to the public URLs of NERA from any official Central or State Government portal, accredited emergency service, or academic research platform.',
          'However, pages must load into a full newly opened browser window and must not be framed within external third-party proprietary software wrappers.',
        ],
      },
      {
        heading: '2. Outbound Links to Authoritative Government Domains',
        content: [
          'NERA provides outbound hyperlinks to authoritative external government domains (including imd.gov.in, gsi.gov.in, cwc.gov.in, ndma.gov.in, and bro.gov.in) strictly to facilitate multi-agency coordination.',
          'NERA cannot guarantee the continuous availability of external third-party pages, nor does it control or endorse external non-governmental commercial entities.',
        ],
      },
    ],
  },
  'copyright-policy': {
    id: 'copyright-policy',
    title: 'Copyright & Open Data Governance Policy',
    shortTitle: 'Copyright Policy',
    lastUpdated: 'August 2026',
    badge: 'National Open Data',
    gazetteRef: 'MDONER/NERA/2026/COPY-05',
    metaDescription: 'Government copyright ownership, Open Data sharing protocols, and attribution standards for research and emergency services.',
    sections: [
      {
        heading: '1. Proprietary Government Ownership',
        content: [
          'The NERA platform architecture, Government of India seal, and UI system designs are proprietary assets of MDoNER and NDMA.',
          'Material featured on this site may be reproduced free of charge in any format or media without requiring specific prior permission for non-commercial disaster risk reduction (DRR) planning, humanitarian logistics research, or academic inquiry.',
        ],
      },
      {
        heading: '2. Mandatory Source Attribution Standard',
        content: [
          'Any reproduction, quoting, or mapping citation must ensure that material is reproduced accurately, without misleading distortion, and with prominent attribution:',
          '  "Source: NERA Platform (https://nera.gov.in), Ministry of Development of North Eastern Region, Government of India."',
        ],
      },
    ],
  },
  'rti': {
    id: 'rti',
    title: 'Right to Information (RTI) Statutory Disclosures',
    shortTitle: 'RTI Section 4(1)(b)',
    lastUpdated: 'August 2026',
    badge: 'RTI Act 2005 Compliance',
    gazetteRef: 'MDONER/NERA/2026/RTI-06',
    metaDescription: 'Proactive suo motu disclosures under Section 4(1)(b) of the Right to Information Act, 2005, CPIO rosters, appellate authorities, and 48-hour life-safety emergency protocols.',
    sections: [
      {
        heading: '1. Proactive Suo Motu Disclosure Mandate (Section 4(1)(b))',
        content: [
          'In compliance with Section 4(1)(b) of the Right to Information Act, 2005 (Act No. 22 of 2005), the Ministry of Development of North Eastern Region (MDoNER) and the NERA Mission Directorate publish proactive suo motu disclosures regarding emergency supply depot inventory levels, disaster corridor restoration expenditures, telemetry algorithm audits, and relief convoy schedules across all 8 North Eastern States (Arunachal Pradesh, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura).',
          'Citizens may inspect real-time logistics logs, bridge clearance threshold datasets, and statutory detour notices without requiring formal information filing, fostering maximum transparency and institutional accountability in humanitarian operations.',
        ],
      },
      {
        heading: '2. Particulars of Organisation, Functions & Duties',
        content: [
          '• Primary Mandate: AI-assisted multi-modal logistics intelligence, real-time arterial accessibility monitoring, and emergency supply chain optimization across difficult mountain terrain in the North Eastern Region.',
          '• Governing Ministry: Ministry of Development of North Eastern Region (MDoNER), Government of India, in joint collaboration with the National Disaster Management Authority (NDMA) and North Eastern Council (NEC).',
          '• Operational Headquarters: NERA Central Logistics Command Cell, Vigyan Bhawan Annexe, Maulana Azad Road, New Delhi – 110011.',
          '• Regional Field Node: North Eastern Regional Command & Logistics Center, NEC Secretariat Complex, Nongrim Hills, Shillong, Meghalaya – 793003.',
        ],
      },
      {
        heading: '3. Designated Central Public Information Officers (CPIO) & Appellate Authority',
        content: [
          '• Central Public Information Officer (CPIO - Logistics & Operations): Director (Logistics & Relief Infrastructure), MDoNER, Room 214, Vigyan Bhawan Annexe, New Delhi – 110011. Email: cpio-logistics@mdoner.gov.in | Phone: 011-23022400.',
          '• Central Public Information Officer (CPIO - GIS Data & Telemetry): Joint Director (Technical Intelligence), North Eastern Council Secretariat, Shillong – 793003. Email: cpio-gis@nec.gov.in | Phone: 0364-2522660.',
          '• First Appellate Authority (FAA): Joint Secretary (Infrastructure & Disaster Response), MDoNER, Vigyan Bhawan Annexe, New Delhi – 110011. Email: faa-nera@mdoner.gov.in | Phone: 011-23022415.',
        ],
      },
      {
        heading: '4. Procedure for Filing RTI Applications & Fee Structure',
        content: [
          '• Online Submissions: Citizens can submit online RTI applications and first appeals through the central RTI Online portal at https://rtionline.gov.in by selecting "Ministry of Development of North Eastern Region" as the parent public authority.',
          '• Offline Applications: Physical RTI applications written in English, Hindi, or any official state language of the North Eastern Region may be submitted by speed post accompanied by a non-judicial stamp / Indian Postal Order / Demand Draft of ₹10 (Rupees Ten only) drawn in favor of "Accounts Officer, MDoNER, New Delhi".',
          '• Below Poverty Line (BPL) Exemption: Applicants holding valid BPL cards issued by State/UT administrations are 100% exempt from paying application and document reproduction fees under Rule 5 of the RTI Rules, 2012.',
        ],
      },
      {
        heading: '5. Fast-Track Disposal for Life or Liberty Emergencies (Section 7(1))',
        content: [
          '• Under the proviso to Section 7(1) of the RTI Act, 2005, any information request concerning life or liberty of stranded citizens, immediate medical supply delivery status, or critical disaster access routes during active flood/landslide crises will be processed and provided within forty-eight (48) hours of receipt.',
          '• Emergency Life-Safety RTI requests can be flagged directly with the 24x7 State Emergency Operations Centre (SEOC) Control Room at Toll-Free 1070 / 112.',
        ],
      },
      {
        heading: '6. Directory of Strategic Depots & Proactive Inventory Schedules',
        content: [
          '• Guwahati Apex Central Depot: 12,000 Tonnes essential grain buffer, 4,500 units anti-venom & cold-chain pediatric vaccines, 240T emergency bridge structural components.',
          '• Siliguri Railhead Trans-Shipment Gateway: 8,000 Tonnes dry food rations, 120,000 liters bottled potable water, mobile water purification plants.',
          '• Silchar Barak Valley Depot: 3,500 Tonnes medical and food rations for Dima Hasao, Mizoram, and Tripura hill sectors.',
          '• Forward High-Altitude Depots: Tawang, Gangtok, Aizawl, Imphal, and Dimapur strategic fuel and grain reserves inspected fortnightly under statutory guidelines.',
        ],
      },
    ],
  },
}

// ── Hindi (हिंदी) Policies Database ──
const HI_POLICIES: Record<string, PolicyDefinition> = {
  'website-policies': {
    id: 'website-policies',
    title: 'वेबसाइट एवं डिजिटल अवसंरचना नीतियां',
    shortTitle: 'वेबसाइट नीतियां',
    lastUpdated: 'अगस्त 2026',
    badge: 'GIGW 3.0 मानक',
    gazetteRef: 'MDONER/NERA/2026/WEB-01',
    metaDescription: 'NERA राष्ट्रीय मंच के लिए आधिकारिक परिचालन अपटाइम SLA, बहु-एजेंसी सेंसर अंतर्ग्रहण और सुगमता मानक।',
    sections: [
      {
        heading: '1. कानूनी ढांचा और वैधानिक अधिदेश',
        content: [
          'उत्तर पूर्व आपदा रसद एवं सुदृढ़ मार्ग मंच (NERA) पूर्वोत्तर क्षेत्र विकास मंत्रालय (MDoNER), भारत सरकार, राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDMA) और अरुणाचल प्रदेश, असम, मणिपुर, मेघालय, मिजोरम, नागालैंड, सिक्किम और त्रिपुरा के राज्य आपदा प्रबंधन प्राधिकरणों (SDMAs) के संयुक्त तत्वावधान में स्थापित किया गया है।',
          'यह वेबसाइट नीतियां सार्वजनिक नागरिकों, फील्ड ऑपरेटरों और स्वचालित टेलीमेट्री सेवाओं के तकनीकी मानकों को नियंत्रित करती हैं।',
        ],
      },
      {
        heading: '2. बहु-एजेंसी आधिकारिक सेंसर एकीकरण',
        content: [
          'NERA में प्रदर्शित सभी जीआईएस मानचित्र वेक्टर, मौसम रडार और नदी जल स्तर सीधे सत्यापित सरकारी संस्थानों से प्राप्त किए जाते हैं:',
          '• भारत मौसम विज्ञान विभाग (IMD): डॉपलर रडार और वर्षा पूर्वानुमान।',
          '• भारतीय भूवैज्ञानिक सर्वेक्षण (GSI): भूस्खलन पूर्व चेतावनी प्रणाली (LEWS)।',
          '• केंद्रीय जल आयोग (CWC): नदी गेज हाइड्रोग्राफ और बाढ़ स्तर डेटा।',
          '• सीमा सड़क संगठन (BRO): प्रोजेक्ट स्वास्तिक, पुष्पक, ब्रह्मांक, उदयन और वर्तक से राजमार्ग स्थिति।',
          '• इसरो भुवन और एनआरएससी: उच्च-रिज़ॉल्यूशन उपग्रह इमेजरी और डिजिटल एलिवेशन मॉडल (DEM)।',
        ],
      },
      {
        heading: '3. सुगमता वक्तव्य (GIGW 3.0 एवं WCAG 2.1 AA)',
        content: [
          'NERA भारतीय सरकारी वेबसाइटों के दिशानिर्देशों (GIGW 3.0) और वेब सामग्री सुगमता दिशानिर्देशों (WCAG 2.1) लेवल AA मानकों के अनुरूप तैयार किया गया है।',
          'मंच आपातकालीन उच्च-कंट्रास्ट पैलेट, स्क्रीन-रीडर समर्थन और डिजिटल इंडिया भाषिणी के माध्यम से 22 भारतीय भाषाओं का समर्थन करता है।',
        ],
      },
    ],
  },
  'terms-of-use': {
    id: 'terms-of-use',
    title: 'उपयोग की शर्तें एवं वैधानिक अनुपालन',
    shortTitle: 'उपयोग की शर्तें',
    lastUpdated: 'अगस्त 2026',
    badge: 'आपदा प्रबंधन अधिनियम 2005',
    gazetteRef: 'MDONER/NERA/2026/TERMS-02',
    metaDescription: 'NERA के लिए नागरिक अधिकार, परिचालन जिम्मेदारियां, एआई रूटिंग अस्वीकरण और वैधानिक दंडात्मक धाराएं।',
    sections: [
      {
        heading: '1. शर्तों की बाध्यकारी स्वीकृति',
        content: [
          'NERA प्लेटफॉर्म पर लॉग इन करके (एडमिन, पुलिस अधिकारी, या नागरिक लाभार्थी के रूप में), आप आपदा प्रबंधन अधिनियम, 2005 (धारा 30, 34, 51, और 54) और भारतीय नागरिक सुरक्षा संहिता (BNSS), 2023 की धारा 187 के तहत बाध्य होने के लिए सहमत हैं।',
        ],
      },
      {
        heading: '2. कानून प्रवर्तन एवं वैधानिक निर्देश (BNSS धारा 187)',
        content: [
          'पुलिस अधिकारियों, बीआरओ इंजीनियरों और जिला मजिस्ट्रेटों के पास राजमार्ग विच्छेद नोटिस प्रसारित करने और अनिवार्य यातायात डायवर्जन लागू करने का वैधानिक अधिकार है।',
          'बीएनएसएस 2023 की धारा 187 के तहत, अधिकृत राहत काफिलों में बाधा डालना या पुलिस डायवर्जन आदेशों की अवहेलना करना एक दंडनीय अपराध है।',
        ],
      },
      {
        heading: '3. गलत आपदा रिपोर्टिंग पर दंड (DM अधिनियम धारा 54)',
        content: [
          'नागरिक पोर्टल के माध्यम से झूठी या मनगढ़ंत आपदा रिपोर्ट दर्ज करना सख्त वर्जित है।',
          'आपदा प्रबंधन अधिनियम, 2005 की धारा 54 के तहत झूठी चेतावनी या अफवाह फैलाने पर 1 वर्ष तक के कारावास या जुर्माने की सजा हो सकती है।',
        ],
      },
    ],
  },
  'privacy-policy': {
    id: 'privacy-policy',
    title: 'गोपनीयता नीति एवं डेटा संरक्षण',
    shortTitle: 'गोपनीयता नीति',
    lastUpdated: 'अगस्त 2026',
    badge: 'DPDP अधिनियम 2023 अनुपालित',
    gazetteRef: 'MDONER/NERA/2026/PRIV-03',
    metaDescription: 'डेटा न्यूनीकरण, AIS-140 जीपीएस बेड़ा ट्रैकिंग गोपनीयता, टेलीमेट्री एन्क्रिप्शन और नागरिक सुरक्षा।',
    sections: [
      {
        heading: '1. वैधानिक गोपनीयता अधिदेश',
        content: [
          'NERA डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 (DPDP Act 2023) के प्रावधानों के तहत एक डेटा प्रत्ययी के रूप में कार्य करता है। हम सभी डेटा और मिशन टेलीमेट्री को अत्याधुनिक एन्क्रिप्शन के साथ सुरक्षित रखते हैं।',
        ],
      },
      {
        heading: '2. डेटा सुरक्षा और भूमिका-आधारित पहुंच (RBAC)',
        content: [
          'सभी मिशन ट्रांजिट लॉग और ड्राइवर संपर्क AES-256-GCM और TLS 1.3 प्रोटोकॉल द्वारा एन्क्रिप्टेड हैं।',
          'भूमिका-आधारित अभिगम नियंत्रण (RBAC) के तहत नागरिक खाते पुलिस टेलीमेट्री या प्रशासनिक सिस्टम फ़ीड का निरीक्षण नहीं कर सकते।',
        ],
      },
    ],
  },
  'hyperlinking-policy': {
    id: 'hyperlinking-policy',
    title: 'हाइपरलिंकिंग नीति',
    shortTitle: 'हाइपरलिंकिंग नीति',
    lastUpdated: 'अगस्त 2026',
    badge: 'GIGW 3.0 अनुपालित',
    gazetteRef: 'MDONER/NERA/2026/LINK-04',
    metaDescription: 'NERA के लिए इनबाउंड और आउटबाउंड हाइपरलिंक दिशानिर्देश।',
    sections: [
      {
        heading: '1. NERA के लिए इनबाउंड हाइपरलिंक',
        content: [
          'किसी भी आधिकारिक सरकारी पोर्टल से NERA के सार्वजनिक वेब पतों पर हाइपरलिंक करने के लिए पूर्व अनुमति की आवश्यकता नहीं है। पृष्ठ एक नई ब्राउज़र विंडो में लोड होने चाहिए।',
        ],
      },
    ],
  },
  'copyright-policy': {
    id: 'copyright-policy',
    title: 'कॉपीराइट नीति',
    shortTitle: 'कॉपीराइट नीति',
    lastUpdated: 'अगस्त 2026',
    badge: 'ओपन डेटा नीति',
    gazetteRef: 'MDONER/NERA/2026/COPY-05',
    metaDescription: 'सरकारी स्वामित्व और गैर-व्यावसायिक अनुसंधान के लिए सामग्री का पुनरुत्पादन।',
    sections: [
      {
        heading: '1. सरकारी स्वामित्व और उपयोग',
        content: [
          'NERA प्लेटफॉर्म डिजाइन और भारत सरकार का प्रतीक MDoNER और NDMA की संपत्ति हैं। आपदा प्रबंधन अनुसंधान और योजना के लिए सामग्री का निःशुल्क उपयोग किया जा सकता है।',
        ],
      },
    ],
  },
  'rti': {
    id: 'rti',
    title: 'सूचना का अधिकार (RTI) वैधानिक प्रकटीकरण',
    shortTitle: 'आरटीआई धारा 4(1)(b)',
    lastUpdated: 'अगस्त 2026',
    badge: 'आरटीआई अधिनियम 2005',
    gazetteRef: 'MDONER/NERA/2026/RTI-06',
    metaDescription: 'सूचना का अधिकार अधिनियम, 2005 की धारा 4(1)(b) के तहत सक्रिय खुलासे और सीपीआईओ संपर्क।',
    sections: [
      {
        heading: '1. सक्रिय प्रकटीकरण अधिदेश',
        content: [
          'सूचना का अधिकार अधिनियम, 2005 की धारा 4(1)(b) के अनुपालन में, NERA सभी 8 पूर्वोत्तर राज्यों में राहत आपूर्ति और आपदा बजट का सक्रिय प्रकटीकरण करता है।',
        ],
      },
    ],
  },
}

// ── Assamese (অসমীয়া) Policies Database ──
const AS_POLICIES: Record<string, PolicyDefinition> = {
  'website-policies': {
    id: 'website-policies',
    title: 'ৱেবচাইট আৰু ডিজিটেল আন্তঃগাঁথনি নীতিসমূহ',
    shortTitle: 'ৱেবচাইট নীতিসমূহ',
    lastUpdated: 'আগষ্ট ২০২৬',
    badge: 'GIGW 3.0 মানদণ্ড',
    gazetteRef: 'MDONER/NERA/2026/WEB-01',
    metaDescription: 'NERA ৰাষ্ট্ৰীয় প্লেটফৰ্মৰ বাবে কাৰ্যক্ষম আপটাইম SLA, বহু-সংস্থাৰ চেন্সৰ সংমিশ্ৰণ আৰু সুলভতা মানদণ্ড।',
    sections: [
      {
        heading: '১. আইনী কাঠামো আৰু বিধিবদ্ধ আদেশ',
        content: [
          'উত্তৰ পূব দুৰ্যোগ যোগান আৰু স্থিতিস্থাপক পথ প্লেটফৰ্ম (NERA) উত্তৰ পূব অঞ্চল উন্নয়ন মন্ত্ৰালয় (MDoNER), ভাৰত চৰকাৰ আৰু ৰাষ্ট্ৰীয় দুৰ্যোগ ব্যৱস্থাপনা প্ৰাধিকৰণৰ (NDMA) যুটীয়া সহযোগিতাত স্থাপন কৰা হৈছে।',
          'এই নীতিসমূহে অসম, অৰুণাচল, মেঘালয়, মণিপুৰ, মিজোৰাম, নাগালেণ্ড, ছিকিম আৰু ত্ৰিপুৰাৰ বাবে কাৰিকৰী মানদণ্ড নিয়ন্ত্ৰণ কৰে।',
        ],
      },
      {
        heading: '২. বহু-সংস্থাৰ নিৰ্ভৰযোগ্য চেন্সৰ একত্ৰীকৰণ',
        content: [
          'NERA ত প্ৰদৰ্শিত সকলো GIS মেপ, বতৰ ৰাডাৰ আৰু নদীৰ পানীৰ স্তৰ প্ৰত্যক্ষভাৱে IMD, GSI, CWC আৰু BRO ৰ পৰা সংগ্ৰহ কৰা হয়।',
        ],
      },
    ],
  },
  'terms-of-use': {
    id: 'terms-of-use',
    title: 'ব্যৱহাৰৰ নিয়ম আৰু বিধিবদ্ধ সন্মতি',
    shortTitle: 'ব্যৱহাৰৰ নিয়ম',
    lastUpdated: 'আগষ্ট ২০২৬',
    badge: 'দুৰ্যোগ ব্যৱস্থাপনা আইন ২০০৫',
    gazetteRef: 'MDONER/NERA/2026/TERMS-02',
    metaDescription: 'নাগৰিক অধিকাৰ, পৰিচালন দায়িত্ব আৰু বিধিবদ্ধ দণ্ডৰ ধাৰাসমূহ।',
    sections: [
      {
        heading: '১. নিয়মসমূহৰ মান্যতা',
        content: [
          'NERA প্লেটফৰ্মত প্ৰৱেশ কৰি, আপুনি দুৰ্যোগ ব্যৱস্থাপনা আইন, ২০০৫ আৰু ভাৰতীয় নাগৰিক সুৰক্ষা সংহিতা (BNSS), ২০২৩ ৰ অধীনত বাধ্য থাকিবলৈ সন্মত হয়।',
        ],
      },
      {
        heading: '২. ভুৱা দুৰ্যোগ প্ৰতিবেদনৰ বাবে দণ্ড (DM আইন ধাৰা ৫৪)',
        content: [
          'ভুৱা বা অপপ্ৰচাৰমূলক দুৰ্যোগৰ তথ্য প্ৰেৰণ কৰিলে দুৰ্যোগ ব্যৱস্থাপনা আইন, ২০০৫ ৰ ধাৰা ৫৪ ৰ অধীনত ১ বছৰ পৰ্যন্ত কাৰাদণ্ড বা জৰিমনা হ’ব পাৰে।',
        ],
      },
    ],
  },
  'privacy-policy': {
    id: 'privacy-policy',
    title: 'গোপনীয়তা নীতি আৰু তথ্য সুৰক্ষা',
    shortTitle: 'গোপনীয়তা নীতি',
    lastUpdated: 'আগষ্ট ২০২৬',
    badge: 'DPDP আইন ২০২৩ অনুপালিত',
    gazetteRef: 'MDONER/NERA/2026/PRIV-03',
    metaDescription: 'তথ্যৰ সংৰক্ষণ, AIS-140 GPS নিৰীক্ষণ আৰু নাগৰিকৰ গোপনীয়তা সুৰক্ষা।',
    sections: [
      {
        heading: '১. গোপনীয়তাৰ সাংবিধানিক সুৰক্ষা',
        content: [
          'NERA ডিজিটেল ব্যক্তিগত তথ্য সুৰক্ষা আইন, ২০২৩ (DPDP Act 2023) ৰ অধীনত সকলো ব্যক্তিগত তথ্য আৰু মিছন টেলিমেট্ৰি সুৰক্ষিত ৰাখে।',
        ],
      },
    ],
  },
  'hyperlinking-policy': {
    id: 'hyperlinking-policy',
    title: 'হাইপাৰলিংক নীতি',
    shortTitle: 'হাইপাৰলিংক নীতি',
    lastUpdated: 'আগষ্ট ২০২৬',
    badge: 'GIGW 3.0',
    gazetteRef: 'MDONER/NERA/2026/LINK-04',
    metaDescription: 'NERA ৰ বাবে হাইপাৰলিংক নীতি।',
    sections: [
      {
        heading: '১. হাইপাৰলিংক ব্যৱহাৰৰ নিয়ম',
        content: ['চৰকাৰী পৰ্টেলসমূহৰ পৰা NERA লৈ লিংক কৰিবলৈ পূৰ্বানুমতিৰ প্ৰয়োজন নাই।'],
      },
    ],
  },
  'copyright-policy': {
    id: 'copyright-policy',
    title: 'কপিৰাইট নীতি',
    shortTitle: 'কপিৰাইট নীতি',
    lastUpdated: 'আগষ্ট ২০২৬',
    badge: 'মুক্ত তথ্য নীতি',
    gazetteRef: 'MDONER/NERA/2026/COPY-05',
    metaDescription: 'তথ্যৰ বিনামূলীয়া ব্যৱহাৰ আৰু কৃতজ্ঞতা স্বীকাৰ।',
    sections: [
      {
        heading: '১. চৰকাৰী স্বত্ব আৰু মুক্ত ব্যৱহাৰ',
        content: ['দুৰ্যোগ প্ৰশমন আৰু গৱেষণাৰ বাবে NERA ৰ তথ্য সঠিক উৎস উল্লেখ কৰি ব্যৱহাৰ কৰিব পাৰি।'],
      },
    ],
  },
  'rti': {
    id: 'rti',
    title: 'তথ্য জনাৰ অধিকাৰ (RTI)',
    shortTitle: 'RTI ধাৰা ৪(১)(b)',
    lastUpdated: 'আগষ্ট ২০২৬',
    badge: 'RTI আইন ২০০৫',
    gazetteRef: 'MDONER/NERA/2026/RTI-06',
    metaDescription: 'তথ্য জনাৰ অধিকাৰ আইন, ২০০৫ ৰ অধীনত প্ৰকাশিত তথ্য।',
    sections: [
      {
        heading: '১. স্বতঃপ্ৰণোদিত তথ্য প্ৰকাশ',
        content: ['RTI আইন ২০০৫ ৰ অধীনত উত্তৰ পূৰ্বাঞ্চলৰ সাহায্য যোগান আৰু বাজেটৰ তথ্য নিয়মীয়াকৈ প্ৰকাশ কৰা হয়।'],
      },
    ],
  },
}

// ── Bengali (বাংলা) Policies Database ──
const BN_POLICIES: Record<string, PolicyDefinition> = {
  'website-policies': {
    id: 'website-policies',
    title: 'ওয়েবসাইট এবং ডিজিটাল পরিকাঠামো নীতিমালা',
    shortTitle: 'ওয়েবসাইট নীতিমালা',
    lastUpdated: 'আগস্ট ২০২৬',
    badge: 'GIGW 3.0 মানদণ্ড',
    gazetteRef: 'MDONER/NERA/2026/WEB-01',
    metaDescription: 'NERA জাতীয় প্ল্যাটফর্মের কার্যকরী আপটাইম SLA, বহু-সংস্থার সেন্সর গ্রহণ এবং অ্যাক্সেসিবিলিটি মান।',
    sections: [
      {
        heading: '১. আইনি কাঠামো এবং বৈধানিক আদেশ',
        content: [
          'উত্তর পূর্ব দুর্যোগ রসদ ও স্থিতিস্থাপক রুট প্ল্যাটফর্ম (NERA) উত্তর পূর্ব অঞ্চল উন্নয়ন মন্ত্রক (MDoNER), ভারত সরকার এবং জাতীয় দুর্যোগ ব্যবস্থাপনা কর্তৃপক্ষের (NDMA) যৌথ উদ্যোগে পরিচালিত হয়।',
        ],
      },
    ],
  },
  'terms-of-use': {
    id: 'terms-of-use',
    title: 'ব্যবহারের শর্তাবলী এবং আইনি সম্মতি',
    shortTitle: 'ব্যবহারের শর্তাবলী',
    lastUpdated: 'আগস্ট ২০২৬',
    badge: 'দুর্যোগ ব্যবস্থাপনা আইন ২০০৫',
    gazetteRef: 'MDONER/NERA/2026/TERMS-02',
    metaDescription: 'নাগরিক অধিকার, অপারেশনাল দায়িত্ব এবং বৈধানিক বিধান।',
    sections: [
      {
        heading: '১. শর্তাবলীর বাধ্যতামূলক গ্রহণযোগ্যতা',
        content: [
          'NERA প্ল্যাটফর্মে প্রবেশ করে, আপনি দুর্যোগ ব্যবস্থাপনা আইন, ২০০৫ এবং ভারতীয় নাগরিক সুরক্ষা সংহিতা (BNSS), ২০২৩ এর বিধান দ্বারা আবদ্ধ হতে সম্মত হন।',
        ],
      },
    ],
  },
  'privacy-policy': {
    id: 'privacy-policy',
    title: 'গোপনীয়তা বিবৃতি এবং ডেটা সুরক্ষা',
    shortTitle: 'গোপনীয়তা বিবৃতি',
    lastUpdated: 'আগস্ট ২০২৬',
    badge: 'DPDP আইন ২০২৩ অনুগত',
    gazetteRef: 'MDONER/NERA/2026/PRIV-03',
    metaDescription: 'ডেটা ন্যূনতমকরণ, AIS-140 GPS পর্যবেক্ষণ এবং নাগরিকের গোপনীয়তা সুরক্ষা।',
    sections: [
      {
        heading: '১. ডেটা সুরক্ষা নীতি',
        content: [
          'NERA ডিজিটাল ব্যক্তিগত তথ্য সুরক্ষা আইন, ২০২৩ (DPDP Act 2023) অনুসারে সমস্ত ট্রানজিট লগ এবং ব্যক্তিগত ডেটা নিরাপদে সংরক্ষণ করে।',
        ],
      },
    ],
  },
  'hyperlinking-policy': {
    id: 'hyperlinking-policy',
    title: 'হাইপারলিঙ্কিং নীতি',
    shortTitle: 'হাইপারলিঙ্কিং নীতি',
    lastUpdated: 'আগস্ট ২০২৬',
    badge: 'GIGW 3.0',
    gazetteRef: 'MDONER/NERA/2026/LINK-04',
    metaDescription: 'হাইপারলিঙ্কিং সংক্রান্ত সরকারি নির্দেশিকা।',
    sections: [
      {
        heading: '১. হাইপারলিঙ্কের নিয়মাবলী',
        content: ['সরকারি ওয়েবসাইট থেকে NERA তে লিঙ্ক করার জন্য কোনও পূর্বানুমতির প্রয়োজন নেই।'],
      },
    ],
  },
  'copyright-policy': {
    id: 'copyright-policy',
    title: 'কপিরাইট নীতি',
    shortTitle: 'কপিরাইট নীতি',
    lastUpdated: 'আগস্ট ২০২৬',
    badge: 'উন্মুক্ত তথ্য নীতি',
    gazetteRef: 'MDONER/NERA/2026/COPY-05',
    metaDescription: 'সরকারি মালিকানা এবং অ-বাণিজ্যিক গবেষণার জন্য তথ্যের পুনরুত্পাদন।',
    sections: [
      {
        heading: '১. তথ্য ব্যবহারের নিয়ম',
        content: ['দুর্যোগ ব্যবস্থাপনা গবেষণার জন্য NERA এর তথ্য যথাযথ উৎস উল্লেখ করে ব্যবহার করা যেতে পারে।'],
      },
    ],
  },
  'rti': {
    id: 'rti',
    title: 'তথ্যের অধিকার (RTI)',
    shortTitle: 'RTI ধারা ৪(১)(b)',
    lastUpdated: 'আগস্ট ২০২৬',
    badge: 'RTI আইন ২০০৫',
    gazetteRef: 'MDONER/NERA/2026/RTI-06',
    metaDescription: 'তথ্যের অধিকার আইন, ২০০৫ এর অধীনে তথ্য প্রকাশ।',
    sections: [
      {
        heading: '১. স্বতঃপ্রণোদিত তথ্য প্রকাশ',
        content: ['RTI আইন ২০০৫ এর ধারা ৪(১)(b) অনুসারে ত্রাণ সরবরাহ এবং বাজেট বিবরণী উন্মুক্ত রাখা হয়।'],
      },
    ],
  },
}

// ── Manipuri (মৈতৈলোন্) Policies Database ──
const MN_POLICIES: Record<string, PolicyDefinition> = {
  'website-policies': {
    id: 'website-policies',
    title: 'ৱেবসাইত অমসুং দিজিতেল থবক-থৌরমগী নীতিশিং',
    shortTitle: 'ৱেবসাইত নীতিশিং',
    lastUpdated: 'ওগস্ত ২০২৬',
    badge: 'GIGW 3.0 স্তেন্দার্দ',
    gazetteRef: 'MDONER/NERA/2026/WEB-01',
    metaDescription: 'NERA লৈবাক পুম্বগী প্লেতফোৰ্মগী অপতাইম SLA অমসুং চেন্সৰ দেতা পুনশিনবগী নীতি।',
    sections: [
      {
        heading: '১. আইনগী নীতি অমসুং সরকারগী নির্দেশ',
        content: [
          'নোংপোক-চিংশাং লমদমগী খুদোংথিবা মতমদা পোৎলম য়েন্থোকপা অমসুং লম্বী য়েংশিনবা প্লেতফোৰ্ম (NERA) অসিনা MDoNER অমসুং NDMA গী মখাদা মথৌ তৌরি।',
        ],
      },
    ],
  },
  'terms-of-use': {
    id: 'terms-of-use',
    title: 'শীজিন্নবগী নিয়ম অমসুং আইনগী য়ানবা',
    shortTitle: 'শীজিন্নবগী নিয়ম',
    lastUpdated: 'ওগস্ত ২০২৬',
    badge: 'দিজাস্তর মেনেজমেন্ত এক্ত ২০০৫',
    gazetteRef: 'MDONER/NERA/2026/TERMS-02',
    metaDescription: 'মীয়ামগী হক, থবক তৌবগী থৌদাং অমসুং আইনগী চৈরাকশিং।',
    sections: [
      {
        heading: '১. নিয়মশিং য়ানবগী ৱাফম',
        content: [
          'NERA প্লেতফোৰ্মদা চঙলকপদা, নহাক্না দিজাস্তর মেনেজমেন্ত এক্ত, ২০০৫ অমসুং BNSS ২০২৩ গী মখাদা চৎনবা নিয়মশিং য়ানরে হায়না লৌই।',
        ],
      },
    ],
  },
  'privacy-policy': {
    id: 'privacy-policy',
    title: 'গোপনীয়তা অমসুং দেতা ঙাক-শেনবগী নিয়ম',
    shortTitle: 'গোপনীয়তা নিয়ম',
    lastUpdated: 'ওগস্ত ২০২৬',
    badge: 'DPDP এক্ত ২০২৩ য়ানবা',
    gazetteRef: 'MDONER/NERA/2026/PRIV-03',
    metaDescription: 'দেতা ঙাক-শেনবা, AIS-140 GPS য়েংশিনবা অমসুং মীয়ামগী গোপনীয়তা।',
    sections: [
      {
        heading: '১. দেতা সুৰক্ষা',
        content: [
          'NERA অসিনা DPDP এক্ত ২০২৩ গী মখাদা মীচম মীয়ামগী অমসুং গারি চৎথোক-চৎশিনগী দেতা পুম্নমক ক্ৰিপ্তোগ্রাফিক ঙাক-শেনগা লোয়ননা থম্মি।',
        ],
      },
    ],
  },
  'hyperlinking-policy': {
    id: 'hyperlinking-policy',
    title: 'হাইপৰলিঙ্কিং নীতি',
    shortTitle: 'হাইপৰলিঙ্কিং নীতি',
    lastUpdated: 'ওগস্ত ২০২৬',
    badge: 'GIGW 3.0',
    gazetteRef: 'MDONER/NERA/2026/LINK-04',
    metaDescription: 'হাইপৰলিঙ্ক তৌবগী নিয়মশিং।',
    sections: [
      {
        heading: '১. হাইপৰলিঙ্ক শীজিন্নবগী ৱাফম',
        content: ['সৰকারগী ৱেবসাইতশিংদগী NERA দা লিঙ্ক তৌবদা অহানবা অয়াবা লৌবা তঙাইফদদে।'],
      },
    ],
  },
  'copyright-policy': {
    id: 'copyright-policy',
    title: 'কপিরাইত নীতি',
    shortTitle: 'কপিরাইত নীতি',
    lastUpdated: 'ওগস্ত ২০২৬',
    badge: 'হংদোক্লবা দেতা নীতি',
    gazetteRef: 'MDONER/NERA/2026/COPY-05',
    metaDescription: 'সৰকারগী লন অমসুং কান্নবা থবকশিংগীদমক দেতা শীজিন্নবা।',
    sections: [
      {
        heading: '১. সৰকারগী হক অমসুং দেতা শীজিন্নবা',
        content: ['খুদোংথিবা মতমগী থবক অমসুং ৰিসৰ্চগীদমক NERA গী দেতা অসিবু মফম অচুম্বা পল্লগা শীজিন্নবা য়াই।'],
      },
    ],
  },
  'rti': {
    id: 'rti',
    title: 'পাউ খঙবগী হক (RTI)',
    shortTitle: 'RTI সেক্সন ৪(১)(b)',
    lastUpdated: 'ওগস্ত ২০২৬',
    badge: 'RTI এক্ত ২০০৫',
    gazetteRef: 'MDONER/NERA/2026/RTI-06',
    metaDescription: 'RTI এক্ত ২০০৫ গী মখাদা সৰকারনা ফোঙদোক্লিবা দেতা।',
    sections: [
      {
        heading: '১. মীয়ামগীদমক দেতা ফোঙদোকপা',
        content: ['RTI এক্ত ২০০৫ গী সেক্সন ৪(১)(b) গী মখাদা নোংপোক-চিংশাং লমদমগী ত্রাণ পোৎলম অমসুং বজেতকী দেতা ফোঙদোকই।'],
      },
    ],
  },
}

export function getPoliciesDatabase(lang: LanguageCode): Record<string, PolicyDefinition> {
  switch (lang) {
    case 'hi':
      return HI_POLICIES
    case 'as':
      return AS_POLICIES
    case 'bn':
      return BN_POLICIES
    case 'mn':
      return MN_POLICIES
    case 'en':
    default:
      return EN_POLICIES
  }
}

