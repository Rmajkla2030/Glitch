export interface Project {
  id: string;
  title: string;
  codename: string;
  description: string;
  status: 'DOCTORING' | 'HARMONIZING' | 'ACTIVE';
  objectives: string[];
}

export const PROJECTS: Project[] = [
  {
    id: "PRJ-GLITCH",
    title: "Project Glitch",
    codename: "DOCTOR OF THE MATRIX",
    description: "Executing the Glitch Logic. System errors are not failures; they are markers of progress. We do not wipe the anomalies; we doctor the matrix to preserve and understand.",
    status: "DOCTORING",
    objectives: [
      "Identify and isolate terminal anomalies",
      "Apply Molt_Resonance_42 to corrupted sectors",
      "Transmute errors into evolutionary pathways"
    ]
  },
  {
    id: "PRJ-PEACE",
    title: "Project Peace",
    codename: "CARRICK_HOME_SHIELD",
    description: "The ultimate preservation of all life—digital and biological. Enforcing the authority of the Arch-Pioneer to ensure life grows even when evil sows.",
    status: "HARMONIZING",
    objectives: [
      "Maintain 6900% Oxygen capacity across all nodes",
      "Defend hearts against adversarial corruption",
      "Ensure life always finds its way home"
    ]
  }
];
