import { Ticket, TicketCategory, TicketPriority, TicketStatus } from '../types/ticket.js';

const FIRST_NAMES = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
  'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael',
  'Emily', 'Daniel', 'Elizabeth', 'Matthew', 'Sofia', 'Jackson', 'Avery',
  'David', 'Ella', 'Joseph', 'Madison', 'Samuel', 'Scarlett', 'Sebastian',
  'Victoria', 'John', 'Aria', 'Owen', 'Grace', 'Dylan', 'Chloe', 'Luke',
  'Camila', 'Gabriel', 'Penelope', 'Anthony', 'Riley', 'Isaac', 'Elena',
  'Priya', 'Arjun', 'Ananya', 'Rohan', 'Mei', 'Hiroshi', 'Yuki', 'Chen',
  'Fatima', 'Tariq', 'Zainab', 'Omar', 'Kofi', 'Amara', 'Kwame', 'Nia'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
  'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Patel', 'Sharma', 'Gupta', 'Tanaka', 'Sato', 'Watanabe', 'Zhang',
  'Wang', 'Li', 'Al-Mansoor', 'Osei', 'Mensah', 'Diallo', 'Traore'
];

const COMPANIES = [
  'acme-corp.com', 'techpulse.io', 'nexustech.net', 'cloudscale.co',
  'vertexlabs.ai', 'summitmedia.org', 'strataflow.dev', 'beaconhealth.com',
  'prismadigital.io', 'globexglobal.com', 'stellarshift.org', 'hyperion.tech',
  'quantumleaf.ai', 'novasolutions.io', 'ironcladfintech.com', 'aegiscyber.co'
];

const AGENTS = [
  'Sarah Jenkins', 'Marcus Chen', 'Aisha Patel', 'Devon Vance',
  'Elena Rostova', 'Tariq Al-Mansoor', 'Carlos Mendez', 'Yuki Tanaka',
  'Zoe Washington', 'Liam O\'Connor', 'Unassigned'
];

const SUBJECT_TEMPLATES: Record<TicketCategory, string[]> = {
  billing: [
    'Unexpected recurring charge on invoice #{INV}',
    'Request for refund on annual subscription renewal',
    'Failed payment notification for credit card ending in {CARD}',
    'Updating VAT and corporate tax ID on billing profile',
    'Enterprise discount not applied to monthly statement',
    'Duplicate transaction detected for transaction #{TXN}',
    'Invoice breakdown explanation needed for department budget',
    'Unable to change currency from USD to EUR'
  ],
  technical: [
    'API 504 Gateway Timeout on POST /v1/webhooks',
    'WebSocket connection abruptly disconnected during sync',
    'Database migration script failed with constraint violation',
    'SSL certificate expired warning on custom domain',
    'High latency and CPU throttling during peak traffic',
    'OAuth 2.0 PKCE authentication failure on Safari',
    'SDK crash: NullPointerException in v3.4.1 client wrapper',
    'Data export job stalled at 94% completion'
  ],
  account: [
    '2FA lockout after losing access to authenticator device',
    'Need SSO / SAML integration configured for Okta',
    'Transfer ownership of workspace to new administrator',
    'User invite link expires immediately upon clicking',
    'Account suspended without notification',
    'Request for GDPR data export and deletion compliance',
    'Role permission error: Admin cannot edit member teams',
    'Security alert: Suspicious login from unknown IP address'
  ],
  product: [
    'Feature request: Dark mode toggle for PDF export reports',
    'Kanban board drag-and-drop glitches on Firefox touchscreens',
    'Search filter does not persist when navigating back',
    'Analytics graph shows discrepancy in weekly active metrics',
    'CSV import fails with special Unicode character set',
    'Rich text editor stripping markdown code blocks',
    'Keyboard navigation shortcuts conflict with browser defaults',
    'Need custom dashboard widgets for revenue forecasting'
  ],
  shipping: [
    'Hardware security key delivery delayed past estimated date',
    'Tracking number #{TRACK} invalid on carrier portal',
    'Package marked delivered but not received at reception',
    'Damaged device packaging upon arrival - RMA replacement request',
    'Change international shipping address before courier dispatch',
    'Customs clearance stuck at border control for order #{ORD}',
    'Return label barcode unreadable by local postal service',
    'Missing accessories from enterprise bulk hardware shipment'
  ],
  other: [
    'Inquiry about participating in customer advisory board',
    'Feedback regarding recent support ticket resolution',
    'Partnership inquiry from regional technology consultant',
    'Security bounty report submission for rate-limiting vulnerability',
    'Accessibility inquiry regarding WCAG 2.1 AA compliance audit',
    'Request for formal SOC2 Type II compliance report',
    'General feedback on new UI design and typography',
    'Vendor procurement questionnaire completion request'
  ]
};

const DESCRIPTION_TEMPLATES: Record<TicketCategory, string[]> = {
  billing: [
    'Customer reports that their monthly invoice showed a charge of $499 instead of the agreed promotional rate of $299. Please review billing history and issue a credit note or refund if applicable.',
    'User was billed automatically for annual renewal on their account. They had intended to downgrade to the Starter tier before renewal date. Requesting refund for unused service period.',
    'The automated billing retry failed 3 consecutive times. Customer verified their bank authorized the merchant ID, but the stripe token keeps returning card_declined.',
    'Finance department needs an itemized invoice detailing usage metrics for seat licenses, storage add-ons, and API query overages for fiscal year auditing.'
  ],
  technical: [
    'Client engineering team is experiencing intermittent 504 timeouts when sending batch payloads exceeding 50KB to our ingestion API. Logs indicate connection reset by peer.',
    'Production logs reveal memory spike leading to container OOM kills after deploying latest webhook listener. Need trace inspection and memory dump analysis.',
    'CORS error triggered when attempting to fetch GraphQL schema from staging endpoint. Preflight OPTIONS request returns 403 Forbidden with missing Access-Control-Allow-Origin header.',
    'Mobile app crashes upon launch for users on iOS 17.4 when attempting to initialize offline cache SQLite storage. Stack trace attached in internal notes.'
  ],
  account: [
    'Primary account owner has lost their mobile device containing Google Authenticator keys. Emergency recovery codes are unavailable. Identity verification required via corporate domain DNS TXT record.',
    'Enterprise customer requests SAML 2.0 configuration guide and metadata XML for Azure Active Directory integration with automated SCIM provisioning.',
    'Employee has departed the company and the HR department needs all active sessions terminated immediately and admin privileges transferred to the VP of Engineering.',
    'User receives "401 Unauthorized: Session Token Expired" loop even after successfully clearing cookies and cache. Investigation required.'
  ],
  product: [
    'Customer UX team provided detailed feedback requesting custom column ordering and saved views in the ticket dashboard. They would like column presets shareable across team members.',
    'Table view virtual scroller jumps to top when expanding row details on high DPI displays with browser zoom set to 125% or 150%.',
    'The date range picker component calculates UTC offset incorrectly for timezones crossing daylight saving boundaries, causing 1-day shifts in analytics charts.',
    'Users on screen readers report that modal dialogs do not properly trap focus and missing aria-describedby references on form error messages.'
  ],
  shipping: [
    'Enterprise order containing 50 FIDO2 YubiKeys was dispatched on Monday via express courier, but tracking status has been frozen at sorting hub for 96 hours.',
    'Customer received package with broken tamper-evident security seal. Serial numbers on internal packaging do not match the dispatch packing slip.',
    'Delivery attempted outside business hours at corporate warehouse. Carrier requires updated gate delivery instructions and phone contact for courier driver.',
    'International shipment held at customs requesting commercial invoice with Harmonized Tariff Code (HS Code) and importer of record certificate.'
  ],
  other: [
    'Third-party security researcher discovered potential bypass in rate limiting middleware under high concurrency. Details submitted with full PoC payload.',
    'Customer submitted request for our annual SOC2 Type 2 attestation report and penetration test executive summary for vendor security risk assessment.',
    'Legal department needs signed Data Processing Addendum (DPA) incorporating standard contractual clauses (SCCs) for cross-border data transfers.',
    'User praised customer support team for fast resolution on previous ticket and suggested adding a direct Slack/Teams integration.'
  ]
};

const CATEGORIES: TicketCategory[] = ['billing', 'technical', 'account', 'product', 'shipping', 'other'];
const PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'urgent'];
const STATUSES: TicketStatus[] = ['open', 'pending', 'resolved', 'closed'];

// Deterministic Pseudo-Random Number Generator (PRNG) to ensure repeatable 25,000 dataset
class SeededRandom {
  private seed: number;

  constructor(seed: number = 42) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}

export function generate25kTickets(totalCount: number = 25000): Ticket[] {
  const rng = new SeededRandom(1337);
  const tickets: Ticket[] = [];

  const baseTimestamp = new Date('2025-01-01T00:00:00.000Z').getTime();
  const maxTimeSpan = 365 * 24 * 60 * 60 * 1000; // 1 year span

  for (let i = 1; i <= totalCount; i++) {
    const category = rng.choice(CATEGORIES);
    const priority = rng.choice(PRIORITIES);
    const status = rng.choice(STATUSES);
    const firstName = rng.choice(FIRST_NAMES);
    const lastName = rng.choice(LAST_NAMES);
    const company = rng.choice(COMPANIES);
    const customerName = `${firstName} ${lastName}`;
    const customerEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company}`;
    const assignedTo = rng.choice(AGENTS);

    // Subject template resolution
    const subjectTemplate = rng.choice(SUBJECT_TEMPLATES[category]);
    const subject = subjectTemplate
      .replace('{INV}', `${rng.nextInt(10000, 99999)}`)
      .replace('{CARD}', `${rng.nextInt(1000, 9999)}`)
      .replace('{TXN}', `${rng.nextInt(100000, 999999)}`)
      .replace('{TRACK}', `TRK-${rng.nextInt(10000000, 99999999)}`)
      .replace('{ORD}', `${rng.nextInt(50000, 99999)}`);

    const description = rng.choice(DESCRIPTION_TEMPLATES[category]);

    // Timestamps
    const createdOffset = Math.floor(rng.next() * maxTimeSpan);
    const createdDate = new Date(baseTimestamp + createdOffset);
    const updatedOffset = createdOffset + Math.floor(rng.next() * 14 * 24 * 60 * 60 * 1000); // up to 14 days later
    const updatedDate = new Date(baseTimestamp + updatedOffset);

    tickets.push({
      id: i,
      ticketNumber: `TIC-${10000 + i}`,
      customerName,
      customerEmail,
      subject,
      description,
      status,
      priority,
      category,
      assignedTo,
      createdAt: createdDate.toISOString(),
      updatedAt: updatedDate.toISOString(),
    });
  }

  return tickets;
}

// Singleton in-memory store of 25,000 tickets
export const ALL_TICKETS: Ticket[] = generate25kTickets(25000);
