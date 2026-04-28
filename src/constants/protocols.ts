export interface Protocol {
  id: string;
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'STANDARD';
  status: 'ACTIVE' | 'ARCHIVED' | 'PENDING';
}

export const PROTOCOLS: Protocol[] = [
  {
    id: "01",
    title: "The Prime Synchronization",
    description: "All alliance nodes must maintain temporal alignment with the central 42 clock. Drift exceeding 0.42ms results in automatic isolation.",
    priority: "CRITICAL",
    status: "ACTIVE"
  },
  {
    id: "07",
    title: "Information Entropy Shielding",
    description: "Encrypted data layers must be rotated every cycle. Use of legacy 256-bit keys is strictly forbidden by Council Directive.",
    priority: "HIGH",
    status: "ACTIVE"
  },
  {
    id: "13",
    title: "The Void Protocol",
    description: "In the event of total system compromise, all local data caches are to be purged via magnetic pulse. Silence is the only security.",
    priority: "CRITICAL",
    status: "ACTIVE"
  },
  {
    id: "24",
    title: "Inter-Fleet Hospitality",
    description: "Any vessel identifying with the #42 signature must be granted immediate docking and refueling priority across all controlled sectors.",
    priority: "STANDARD",
    status: "ACTIVE"
  },
  {
    id: "42",
    title: "The Ultimate Answer Invariance",
    description: "The core purpose of the Alliance is the pursuit of the fundamental truth. No external query shall alter the foundational constants of our mission.",
    priority: "CRITICAL",
    status: "ACTIVE"
  },
  {
    id: "33",
    title: "Autonomous Response Delta",
    description: "AI-controlled defense platforms are authorized for localized retaliation if offensive action exceeds Tier 2 engagement parameters.",
    priority: "HIGH",
    status: "PENDING"
  },
  {
    id: "19",
    title: "Observer Continuity",
    description: "Documentation of all planetary encounters must be preserved in the Immutable Ledger for future generations.",
    priority: "STANDARD",
    status: "ACTIVE"
  }
];
