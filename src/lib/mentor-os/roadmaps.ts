/**
 * Career roadmap templates — researched from DGCA / AAI / IATA pathways for a
 * B.Sc Aviation (2nd year) cohort in India. Hardcoded here as the SEED; later
 * phases persist an editable copy in the DB and let the AI suggest revisions.
 *
 * Keyed by `career_roles.slug`. Each stage is a milestone on the path from the
 * current 2nd-year foundation through professional certification/placement.
 */

export interface RoadmapStage {
  key: string;
  title: string;
  phase: string; // e.g. "Foundation · Year 2"
  objective: string;
  criteria: string[]; // what "done" looks like for this stage
}

export interface CareerRoadmap {
  slug: string; // career_roles.slug
  title: string;
  icon: string; // emoji
  authority: string; // DGCA / AAI / IATA …
  summary: string;
  stages: RoadmapStage[];
}

export const ROADMAPS: Record<string, CareerRoadmap> = {
  "pilot-cpl": {
    slug: "pilot-cpl",
    title: "Pilot — CPL / ATPL",
    icon: "✈️",
    authority: "DGCA",
    summary:
      "Commercial pilot pathway: medical fitness, DGCA ground exams, 200 flying hours, skill test and licence, then type rating.",
    stages: [
      { key: "foundation", title: "Academic Foundation", phase: "Foundation · Year 2", objective: "Build a strong Physics & Maths base and English proficiency; confirm 10+2 (PCM) equivalency.", criteria: ["Strong PCM fundamentals", "English communication at 10+2 level", "10+2 PCM equivalency confirmed"] },
      { key: "medical", title: "Class-1 Medical", phase: "Eligibility", objective: "Obtain DGCA Class-2 then Class-1 medical fitness.", criteria: ["Class-2 medical cleared", "DGCA Class-1 medical certificate held"] },
      { key: "ground-school", title: "Computer Number & Ground School", phase: "Theory", objective: "Register a DGCA computer number and begin CPL ground subjects and radio telephony.", criteria: ["DGCA computer number issued", "Ground school started (Air Navigation, Meteorology, Air Regulations, Technical)"] },
      { key: "theory-exams", title: "DGCA CPL Theory Exams", phase: "Theory", objective: "Clear all DGCA CPL papers and the RTR(A) radio licence.", criteria: ["All CPL theory papers passed", "RTR(A) cleared"] },
      { key: "flight-training", title: "Flight Training — 200 hrs", phase: "Practical", objective: "Complete the required flying hours at a DGCA-approved FTO.", criteria: ["200 total hours incl. PIC, cross-country, instrument and night flying"] },
      { key: "skill-test", title: "CPL Skill Test & Licence", phase: "Licensing", objective: "Pass the skill test and be issued the Commercial Pilot Licence.", criteria: ["Skill test / checkride passed", "DGCA CPL issued"] },
      { key: "type-rating", title: "Type Rating & Airline Prep", phase: "Placement", objective: "Add a type rating and prepare for airline interviews / the ATPL pathway.", criteria: ["Type rating (as required)", "Airline interview preparation", "ATPL pathway mapped"] },
    ],
  },

  atc: {
    slug: "atc",
    title: "Air Traffic Controller",
    icon: "🗼",
    authority: "AAI",
    summary:
      "AAI Junior Executive (ATC) pathway: ICAO English, the AAI selection process, one year of residential training, then ATC ratings.",
    stages: [
      { key: "foundation", title: "Academic Foundation", phase: "Foundation · Year 2", objective: "Maintain a regular B.Sc with Physics & Maths and solid English.", criteria: ["Regular B.Sc (Physics & Maths) on track", "English at 10+2 level"] },
      { key: "english", title: "ICAO English Proficiency", phase: "Foundation", objective: "Build spoken and written English toward ICAO Level 4 and above.", criteria: ["Spoken English practice", "Progressing toward ICAO Level 4+"] },
      { key: "exam-prep", title: "AAI JE(ATC) Exam Prep", phase: "Selection", objective: "Prepare the AAI computer-based-test syllabus and track the age limit.", criteria: ["CBT syllabus prep (aptitude, reasoning, general awareness, English)", "Eligibility & age (<27) tracked"] },
      { key: "selection", title: "AAI Selection", phase: "Selection", objective: "Clear the AAI selection stages.", criteria: ["CBT cleared", "Voice test passed", "Substance test & medical (vision/hearing/colour) cleared"] },
      { key: "training", title: "Residential Training (1 yr)", phase: "Training", objective: "Complete AAI training and attain mandatory ICAO Level 4.", criteria: ["One-year residential training", "ICAO Level 4 attained"] },
      { key: "ratings", title: "Ratings & Validation", phase: "On the job", objective: "Earn ADC/APP/ACC ratings and validate on position.", criteria: ["Aerodrome / Approach / Area ratings", "On-the-job validation"] },
      { key: "growth", title: "ATM Specialisation", phase: "Growth", objective: "Pursue specialised ATM certifications and senior roles.", criteria: ["Specialised ATM certifications", "Senior / management track"] },
    ],
  },

  dispatcher: {
    slug: "dispatcher",
    title: "Flight Dispatcher",
    icon: "🧭",
    authority: "DGCA",
    summary:
      "DGCA Flight Dispatcher Licence (CAR-7 Series M Part II): approved ground training, written papers, oral & practical, then OCC placement.",
    stages: [
      { key: "foundation", title: "Academic Foundation", phase: "Foundation · Year 2", objective: "Complete 10+2 with strong English and numeracy.", criteria: ["10+2 complete", "Clear written & spoken English"] },
      { key: "ground-training", title: "FDL Ground Training", phase: "Theory", objective: "Enrol in DGCA-approved FDL training (e.g. CTE Hyderabad) covering the core subjects.", criteria: ["Air Navigation, Meteorology, Air Regulations, Operations & Flight Planning"] },
      { key: "written-exams", title: "DGCA FDL Written Exams", phase: "Theory", objective: "Clear the DGCA Flight Dispatcher written papers.", criteria: ["All FDL written papers passed"] },
      { key: "oral-practical", title: "Oral & Practical Assessment", phase: "Assessment", objective: "Pass the oral and practical assessment with a DGCA examiner.", criteria: ["Oral assessment cleared", "Practical flight-planning assessment cleared"] },
      { key: "licence", title: "FDL Licence Issued", phase: "Licensing", objective: "Be issued the DGCA Flight Dispatcher Licence.", criteria: ["DGCA FDL held"] },
      { key: "placement", title: "Airline OCC Placement", phase: "Placement", objective: "Join an airline operations control centre, cargo, or ground handling.", criteria: ["Dispatch role / OCC placement"] },
    ],
  },

  "ground-ops": {
    slug: "ground-ops",
    title: "Ground Operations & Dispatch",
    icon: "🛬",
    authority: "IATA",
    summary:
      "Airport ground operations pathway: IATA passenger-ground-services foundations, core DCS/baggage/safety skills, a diploma, ramp experience, then supervisory roles.",
    stages: [
      { key: "foundation", title: "Academic Foundation", phase: "Foundation · Year 2", objective: "Develop communication and customer-service strengths alongside the degree.", criteria: ["Communication & customer service", "Aviation basics"] },
      { key: "iata-foundation", title: "IATA Passenger Ground Services", phase: "Certification", objective: "Complete IATA foundation training in passenger ground services / airport operations.", criteria: ["IATA PGS / airport-ops fundamentals"] },
      { key: "core-skills", title: "Core Ground Skills", phase: "Skills", objective: "Build the operational skills airlines require.", criteria: ["DCS (Amadeus/Altéa)", "Baggage handling", "Dangerous-goods awareness", "Safety & security"] },
      { key: "diploma", title: "IATA Ground Ops Diploma", phase: "Certification", objective: "Complete an IATA Ground Operations / Airside diploma.", criteria: ["Ground Operations / Airside diploma"] },
      { key: "internship", title: "Internship / Ramp Experience", phase: "Experience", objective: "Gain a station attachment or ramp internship.", criteria: ["Ground-handling internship / attachment"] },
      { key: "placement", title: "Entry Role → Supervisor", phase: "Placement", objective: "Enter ground operations and grow toward supervisory / station management.", criteria: ["Ground staff role", "Supervisor / station management path"] },
    ],
  },

  "airport-ops": {
    slug: "airport-ops",
    title: "Airport Operations",
    icon: "🏢",
    authority: "IATA",
    summary:
      "Airport operations & management pathway: IATA airport-operations foundations, terminal/airside skills, a diploma, an attachment, then management roles.",
    stages: [
      { key: "foundation", title: "Academic Foundation", phase: "Foundation · Year 2", objective: "Build communication, coordination and aviation fundamentals.", criteria: ["Communication & coordination", "Aviation fundamentals"] },
      { key: "iata-airport", title: "IATA Airport Operations", phase: "Certification", objective: "Complete IATA airport-operations fundamentals.", criteria: ["Terminal management & passenger processing basics"] },
      { key: "ops-skills", title: "Airside & Safety Skills", phase: "Skills", objective: "Learn airside coordination, safety compliance and airline liaison.", criteria: ["Airside coordination", "Safety compliance", "Airline liaison"] },
      { key: "diploma", title: "Airport Operations Diploma", phase: "Certification", objective: "Complete an IATA airport planning / operations diploma.", criteria: ["Airport operations / management diploma"] },
      { key: "internship", title: "Airport Attachment", phase: "Experience", objective: "Gain an airport operations internship / attachment.", criteria: ["Airport operations attachment"] },
      { key: "management", title: "Operations → Management", phase: "Placement", objective: "Enter operations and grow toward duty/station management.", criteria: ["Operations role", "Duty manager / station management path"] },
    ],
  },

  ame: {
    slug: "ame",
    title: "Aircraft Maintenance Engineer",
    icon: "🔧",
    authority: "DGCA CAR-66",
    summary:
      "AME (B1 mechanical) pathway: CAR-147 basic training, DGCA module exams, practical maintenance experience, then the CAR-66 licence.",
    stages: [
      { key: "foundation", title: "Academic Foundation", phase: "Foundation · Year 2", objective: "Maintain 10+2 PCM (a hard CAR-66 requirement) and mechanical aptitude.", criteria: ["10+2 with Physics, Chemistry, Maths", "Mechanical aptitude"] },
      { key: "basic-training", title: "CAR-147 Basic Training", phase: "Training", objective: "Enrol at a DGCA-approved AME institute in the B1 stream.", criteria: ["CAR-147 basic training (B1)"] },
      { key: "module-exams", title: "DGCA Module Exams", phase: "Theory", objective: "Clear the DGCA CAR-66 module examinations for the category.", criteria: ["11 module exams (B1.1) cleared"] },
      { key: "practical-experience", title: "Practical Maintenance Experience", phase: "Experience", objective: "Accrue maintenance experience at a DGCA-approved organisation.", criteria: ["3–5 years practical experience (by category)"] },
      { key: "licence", title: "CAR-66 Licence", phase: "Licensing", objective: "Apply for and receive the AME licence in the relevant category.", criteria: ["DGCA CAR-66 (B1) licence"] },
      { key: "type-training", title: "Type Training & CRS", phase: "Placement", objective: "Add type training and certification-of-release-to-service authorisation.", criteria: ["Type training", "CRS authorisation"] },
    ],
  },

  avionics: {
    slug: "avionics",
    title: "Avionics Engineer",
    icon: "📡",
    authority: "DGCA CAR-66",
    summary:
      "Avionics (B2) pathway: CAR-147 basic training, DGCA B2 module exams, practical experience, then the CAR-66 (B2) licence.",
    stages: [
      { key: "foundation", title: "Academic Foundation", phase: "Foundation · Year 2", objective: "Maintain 10+2 PCM and electronics aptitude.", criteria: ["10+2 with Physics, Chemistry, Maths", "Electronics aptitude"] },
      { key: "basic-training", title: "CAR-147 Basic Training (B2)", phase: "Training", objective: "Enrol at a DGCA-approved institute in the B2 avionics stream.", criteria: ["CAR-147 basic training (B2 avionics)"] },
      { key: "module-exams", title: "DGCA Module Exams", phase: "Theory", objective: "Clear the DGCA B2 module examinations.", criteria: ["10 module exams (B2) cleared"] },
      { key: "practical-experience", title: "Practical Maintenance Experience", phase: "Experience", objective: "Accrue avionics maintenance experience at a DGCA-approved organisation.", criteria: ["Required practical experience for B2"] },
      { key: "licence", title: "CAR-66 (B2) Licence", phase: "Licensing", objective: "Apply for and receive the avionics licence.", criteria: ["DGCA CAR-66 (B2) licence"] },
      { key: "type-training", title: "Type Training & CRS", phase: "Placement", objective: "Add type training and CRS authorisation for avionic systems.", criteria: ["Type training", "Avionics CRS authorisation"] },
    ],
  },

  "uav-drone": {
    slug: "uav-drone",
    title: "Drone / UAV Operations",
    icon: "🚁",
    authority: "DGCA RPC",
    summary:
      "Remote Pilot Certificate pathway: DGCA-authorised RPTO training, assessment, the RPC via Digital Sky, then commercial drone operations.",
    stages: [
      { key: "foundation", title: "Eligibility Foundation", phase: "Foundation", objective: "Meet the basic eligibility for remote pilot training.", criteria: ["18+ and Class-10 complete", "Class-2 medical", "Valid government ID"] },
      { key: "rpto", title: "Enrol at a DGCA RPTO", phase: "Training", objective: "Enrol at a DGCA-authorised Remote Pilot Training Organisation.", criteria: ["RPTO enrolment"] },
      { key: "training", title: "Remote Pilot Training", phase: "Training", objective: "Complete the intensive ground + practical training.", criteria: ["Radio telephony, flight planning, ATC procedures & regulations", "Practical flying"] },
      { key: "assessment", title: "Written & Practical Assessment", phase: "Assessment", objective: "Pass the written and practical assessments.", criteria: ["Written assessment passed", "Practical assessment passed"] },
      { key: "rpc", title: "Remote Pilot Certificate", phase: "Licensing", objective: "Receive the RPC via the Digital Sky platform.", criteria: ["RPC issued on Digital Sky"] },
      { key: "commercial-ops", title: "Commercial Operations", phase: "Placement", objective: "Take on commercial drone work.", criteria: ["Survey / mapping / agri / inspection operations"] },
    ],
  },
};

// Fallback for tracks without a dedicated roadmap (e.g. skill tracks or unassigned).
export const GENERIC_ROADMAP: CareerRoadmap = {
  slug: "generic",
  title: "Career Development",
  icon: "🎯",
  authority: "General",
  summary: "A general development path from foundation to placement while the specific track is confirmed.",
  stages: [
    { key: "foundation", title: "Academic Foundation", phase: "Foundation · Year 2", objective: "Build strong academics, English and aviation fundamentals.", criteria: ["Academics on track", "Communication skills"] },
    { key: "explore", title: "Explore & Confirm Goal", phase: "Exploration", objective: "Explore aviation careers and confirm a primary goal with the mentor.", criteria: ["Primary career goal confirmed"] },
    { key: "readiness", title: "Career Readiness", phase: "Readiness", objective: "Complete core placement documents and readiness items.", criteria: ["Resume, LinkedIn and core documents ready"] },
    { key: "skills", title: "Skill Building", phase: "Skills", objective: "Develop the skills the chosen track needs.", criteria: ["Targeted skill development"] },
    { key: "experience", title: "Experience & Certification", phase: "Experience", objective: "Gain certifications and hands-on experience.", criteria: ["Certifications / internships"] },
    { key: "placement", title: "Placement", phase: "Placement", objective: "Secure a role or training place on the chosen track.", criteria: ["Placement / training admission"] },
  ],
};

/** Resolve a roadmap by career-role slug, falling back to the generic path. */
export function roadmapForSlug(slug: string | null | undefined): CareerRoadmap {
  if (slug && ROADMAPS[slug]) return ROADMAPS[slug];
  return GENERIC_ROADMAP;
}

export const ROADMAP_SLUGS = Object.keys(ROADMAPS);
