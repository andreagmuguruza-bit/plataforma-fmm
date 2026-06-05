export type UserRole = 'TTL' | 'EFFECTIVENESS_TEAM' | 'DIVISION_CHIEF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Project {
  index?: number;
  id: string;
  operationNumber?: string;
  name: string;
  country: string;
  countryCode?: string;
  countryName?: string;
  ttl: string;
  status: string;
  isPrefilledByTeam: boolean;
  validatedByTTLDate: string | null;
  metadata: {
    investmentAmount: string;
    disbursementPercent: number;
    elapsedYears: number;
    siScore: number;
    pmr2025?: {
      status: 'Satisfactory' | 'Alert' | 'Problem' | 'N/A';
      score: number;
    };
    pmr2026?: {
      status: 'Satisfactory' | 'Alert' | 'Problem' | 'N/A';
      score: number;
    };
  };
  history?: string;
  transcription?: string;
  binnacle?: string;
  qa?: {
    implementationStatus: string;
    risks: string;
    innovations: string;
    outcomes: string;
    actions: string;
  };
  evaluation?: {
    score: number;
    feedback: string;
    dimensions?: {
      implementationStatus: { score: number; reasoning: string; enhancements: string[] };
      risks: { score: number; reasoning: string; enhancements: string[] };
      innovations: { score: number; reasoning: string; enhancements: string[] };
      outcomes: { score: number; reasoning: string; enhancements: string[] };
      actions: { score: number; reasoning: string; enhancements: string[] };
    };
  };
  exportData?: string;
  submissionStatus?: 'pending' | 'validated';
  validationDate?: string;
  qualitativeData?: {
    estadoImplementacion: string[];
    productosDestacados: string[];
    probabilidadObjetivos: string[];
    accionesSugeridas: string[];
    fechaEvaluacionIntermedia?: string;
    fechaTalleresArranque?: string;
    temasCriticosSimulador?: string;
    verificadorContenidos?: string;
  };
}
