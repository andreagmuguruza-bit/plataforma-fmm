import { useState, useEffect } from 'react';

export interface IDBOverviewItem {
  name: string;
  value: number;
  percentage: number;
  fill?: string;
  [key: string]: any;
}

export interface IFDOverviewItem {
  name: string;
  value: number;
  percentage: number;
  fill?: string;
  [key: string]: any;
}

export interface GeoImpactItem {
  country: string;
  name: string;
  region: string;
  amount: number;
  projects: number;
  disbursed: number;
  undisbursed: number;
  disbursedVol?: number;
  undisbursedVol?: number;
  flag?: string;
  flagCode?: string;
  [key: string]: any;
}

export interface DisbursementDivisionItem {
  name: string;
  disbursedAmount: number;
  undisbursedAmount: number;
  numberOfProjects: number;
  disbursedPct: number;
  undisbursedPct: number;
  [key: string]: any;
}

export interface AgeDivisionItem {
  name: string;
  age: number;
  [key: string]: any;
}

export interface DashboardMetricsData {
  // Hero
  hero_total_projects: number;
  hero_total_amount_m: number;
  hero_total_countries: number;
  fmm_pct_of_ifd: number;

  // Geographic Reach
  geo_top_country_name: string;
  geo_top_country_amt: number;
  geo_top_country_proj: number;
  geo_top_country_disb_pct: number;
  geo_runnerup_1_name: string;
  geo_runnerup_1_pct: number;
  geo_runnerup_2_name: string;
  geo_runnerup_2_pct: number;
  geo_runnerup_3_name?: string;
  geo_runnerup_3_pct?: number;

  // Lending Instruments
  pbl_count: number;
  pbl_amount_m: number;
  inv_count: number;
  inv_amount_m: number;

  // Stages
  inv_stage_1_count: number;
  inv_stage_1_amount: number;
  inv_stage_2_count: number;
  inv_stage_2_amount: number;
  inv_stage_3_count: number;
  inv_stage_3_amount: number;

  // Portfolio Age
  age_fmm_avg: number;
  age_idb_avg: number;
  age_ifd_avg: number;
  age_pct_over_5_yrs: number;
  age_pct_extensions: number;
  age_comparison_vs_idb: string;
  age_comparison_sentence?: string;

  // Run Date / Refresh Timestamps
  data_as_of_long?: string;
  pdf_date_format?: string;

  // Current Disbursement
  disb_fmm_disbursed_amt: number;
  disb_fmm_undisb_amt: number;
  disb_fmm_disbursed_pct: number;
  disb_fmm_stg2_3_pct: number;

  // Recharts Tables / Data Arrays
  df_idb_overview: IDBOverviewItem[];
  df_ifd_overview: IFDOverviewItem[];
  df_geo_impact: GeoImpactItem[];
  df_disb_all_stages: DisbursementDivisionItem[];
  df_disb_stg2_3: DisbursementDivisionItem[];
  df_age_divisions: AgeDivisionItem[];
}

export const ENDPOINT_URL = 'https://script.google.com/macros/s/AKfycbxQReFEO7saN-pTEQjHpUAFSNUZnO1c217s087MvtGXvyO7dhhoS_NMbFZYkIxEGUIxtg/exec';

// Default / Fallback static dataset guaranteeing zero downtime
export const DEFAULT_METRICS: DashboardMetricsData = {
  hero_total_projects: 48,
  hero_total_amount_m: 4361,
  hero_total_countries: 12,
  fmm_pct_of_ifd: 30,

  geo_top_country_name: 'Brazil',
  geo_top_country_amt: 1802,
  geo_top_country_proj: 21,
  geo_top_country_disb_pct: 58,
  geo_runnerup_1_name: 'Belize',
  geo_runnerup_1_pct: 75,
  geo_runnerup_2_name: 'Peru',
  geo_runnerup_2_pct: 47,
  geo_runnerup_3_name: 'Ecuador',
  geo_runnerup_3_pct: 37,

  pbl_count: 1,
  pbl_amount_m: 600,
  inv_count: 47,
  inv_amount_m: 3761,

  inv_stage_1_count: 12,
  inv_stage_1_amount: 2232,
  inv_stage_2_count: 33,
  inv_stage_2_amount: 2344,
  inv_stage_3_count: 2,
  inv_stage_3_amount: 51,

  age_fmm_avg: 4.8,
  age_idb_avg: 4.6,
  age_ifd_avg: 4.1,
  age_pct_over_5_yrs: 38,
  age_pct_extensions: 35,
  age_comparison_vs_idb: 'above',
  age_comparison_sentence: 'above the IDB (4.6) and the IFD department (4.1)',

  data_as_of_long: 'Data as of: October 24, 2026',
  pdf_date_format: '24-October-26',

  disb_fmm_disbursed_amt: 1565,
  disb_fmm_undisb_amt: 2796,
  disb_fmm_disbursed_pct: 36,
  disb_fmm_stg2_3_pct: 56,

  df_idb_overview: [
    { name: 'IFD', value: 16313, percentage: 28, fill: '#005173' },
    { name: 'SCL', value: 9636, percentage: 16, fill: '#A9B3BC' },
    { name: 'CSD', value: 4045, percentage: 7, fill: '#A9B3BC' },
    { name: 'PTI', value: 4009, percentage: 7, fill: '#A9B3BC' },
    { name: 'INE', value: 25192, percentage: 43, fill: '#A9B3BC' },
  ],
  df_ifd_overview: [
    { name: 'FMM', value: 5227, percentage: 32, fill: '#FFC000' },
    { name: 'ICS', value: 2645, percentage: 16, fill: '#005173' },
    { name: 'CIS', value: 1604, percentage: 10, fill: '#005173' },
    { name: 'CMF', value: 6838, percentage: 42, fill: '#005173' },
  ],
  df_geo_impact: [
    { country: 'BR', name: 'Brazil', region: 'CSC', amount: 2048, projects: 23, disbursed: 43, undisbursed: 57, disbursedVol: 888, undisbursedVol: 1160, flag: '🇧🇷', flagCode: 'br' },
    { country: 'AR', name: 'Argentina', region: 'CSC', amount: 1154, projects: 5, disbursed: 12, undisbursed: 88, disbursedVol: 143, undisbursedVol: 1011, flag: '🇦🇷', flagCode: 'ar' },
    { country: 'UR', name: 'Uruguay', region: 'CSC', amount: 130, projects: 3, disbursed: 19, undisbursed: 81, disbursedVol: 25, undisbursedVol: 105, flag: '🇺🇾', flagCode: 'uy' },
    { country: 'PR', name: 'Paraguay', region: 'CSC', amount: 55, projects: 2, disbursed: 32, undisbursed: 68, disbursedVol: 18, undisbursedVol: 37, flag: '🇵🇾', flagCode: 'py' },
    { country: 'CH', name: 'Chile', region: 'CSC', amount: 20, projects: 1, disbursed: 40, undisbursed: 60, disbursedVol: 8, undisbursedVol: 12, flag: '🇨🇱', flagCode: 'cl' },
    { country: 'CO', name: 'Colombia', region: 'CAN', amount: 300, projects: 2, disbursed: 34, undisbursed: 66, disbursedVol: 103, undisbursedVol: 197, flag: '🇨🇴', flagCode: 'co' },
    { country: 'PE', name: 'Peru', region: 'CAN', amount: 204, projects: 4, disbursed: 48, undisbursed: 52, disbursedVol: 99, undisbursedVol: 105, flag: '🇵🇪', flagCode: 'pe' },
    { country: 'EC', name: 'Ecuador', region: 'CAN', amount: 84, projects: 1, disbursed: 18, undisbursed: 82, disbursedVol: 15, undisbursedVol: 69, flag: '🇪🇨', flagCode: 'ec' },
    { country: 'SU', name: 'Suriname', region: 'CCB', amount: 50, projects: 1, disbursed: 21, undisbursed: 79, disbursedVol: 10, undisbursedVol: 40, flag: '🇸🇷', flagCode: 'sr' },
    { country: 'ME', name: 'Mexico', region: 'CID', amount: 500, projects: 1, disbursed: 0, undisbursed: 100, disbursedVol: 0, undisbursedVol: 500, flag: '🇲🇽', flagCode: 'mx' },
    { country: 'PN', name: 'Panama', region: 'CID', amount: 60, projects: 2, disbursed: 24, undisbursed: 76, disbursedVol: 15, undisbursedVol: 45, flag: '🇵🇦', flagCode: 'pa' },
    { country: 'BL', name: 'Belize', region: 'CCB', amount: 22, projects: 2, disbursed: 81, undisbursed: 19, disbursedVol: 18, undisbursedVol: 4, flag: '🇧🇿', flagCode: 'bz' },
  ],
  df_disb_all_stages: [
    { name: 'FMM', disbursedAmount: 1565, undisbursedAmount: 2797, numberOfProjects: 48, disbursedPct: 36, undisbursedPct: 64 },
    { name: 'CIS', disbursedAmount: 427, undisbursedAmount: 642, numberOfProjects: 17, disbursedPct: 40, undisbursedPct: 60 },
    { name: 'CMF', disbursedAmount: 2817, undisbursedAmount: 3886, numberOfProjects: 50, disbursedPct: 42, undisbursedPct: 58 },
    { name: 'ICS', disbursedAmount: 1021, undisbursedAmount: 1455, numberOfProjects: 48, disbursedPct: 41, undisbursedPct: 59 },
  ],
  df_disb_stg2_3: [
    { name: 'FMM', disbursedAmount: 1565, undisbursedAmount: 1216, numberOfProjects: 41, disbursedPct: 56, undisbursedPct: 44 },
    { name: 'CIS', disbursedAmount: 427, undisbursedAmount: 439, numberOfProjects: 15, disbursedPct: 49, undisbursedPct: 51 },
    { name: 'CMF', disbursedAmount: 2817, undisbursedAmount: 1933, numberOfProjects: 41, disbursedPct: 59, undisbursedPct: 41 },
    { name: 'ICS', disbursedAmount: 1021, undisbursedAmount: 951, numberOfProjects: 39, disbursedPct: 52, undisbursedPct: 48 },
  ],
  df_age_divisions: [
    { name: 'CIS', age: 5.2 },
    { name: 'FMM', age: 4.8 },
    { name: 'ICS', age: 4.2 },
    { name: 'CMF', age: 3.3 },
  ],
};

const COUNTRY_MAP: Record<string, { countryCode: string; flagCode: string; region: string; flag: string }> = {
  brazil: { countryCode: 'BR', flagCode: 'br', region: 'CSC', flag: '🇧🇷' },
  argentina: { countryCode: 'AR', flagCode: 'ar', region: 'CSC', flag: '🇦🇷' },
  uruguay: { countryCode: 'UR', flagCode: 'uy', region: 'CSC', flag: '🇺🇾' },
  paraguay: { countryCode: 'PR', flagCode: 'py', region: 'CSC', flag: '🇵🇾' },
  chile: { countryCode: 'CH', flagCode: 'cl', region: 'CSC', flag: '🇨🇱' },
  colombia: { countryCode: 'CO', flagCode: 'co', region: 'CAN', flag: '🇨🇴' },
  peru: { countryCode: 'PE', flagCode: 'pe', region: 'CAN', flag: '🇵🇪' },
  ecuador: { countryCode: 'EC', flagCode: 'ec', region: 'CAN', flag: '🇪🇨' },
  suriname: { countryCode: 'SU', flagCode: 'sr', region: 'CCB', flag: '🇸🇷' },
  mexico: { countryCode: 'ME', flagCode: 'mx', region: 'CID', flag: '🇲🇽' },
  panama: { countryCode: 'PN', flagCode: 'pa', region: 'CID', flag: '🇵🇦' },
  belize: { countryCode: 'BL', flagCode: 'bz', region: 'CCB', flag: '🇧🇿' },
};

const TARGET_COUNTRY_ORDER = ['BR', 'AR', 'UR', 'PR', 'CH', 'CO', 'PE', 'EC', 'SU', 'ME', 'PN', 'BL'];
const IDB_ORDER = ['IFD', 'SCL', 'CSD', 'PTI', 'INE'];
const IFD_ORDER = ['FMM', 'ICS', 'CIS', 'CMF'];
const DISB_DIVISION_ORDER = ['FMM', 'CIS', 'CMF', 'ICS'];
const AGE_DIVISION_ORDER = ['CIS', 'FMM', 'ICS', 'CMF'];

function normalizeGeoImpact(rawItems: any[]): GeoImpactItem[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return DEFAULT_METRICS.df_geo_impact;
  }
  const items: GeoImpactItem[] = rawItems.map((item: any) => {
    const rawName = String(item.country_name || item.name || '');
    const meta = COUNTRY_MAP[rawName.toLowerCase()];
    const code = meta?.countryCode || String(item.country || item.country_code || 'BR').toUpperCase();
    const flagCode = meta?.flagCode || String(item.flagCode || item.flag_code || code).toLowerCase();
    const amount = Math.round(Number(item.total_amount_m ?? item.amount ?? item.total ?? 0));
    const projects = Number(item.projects_count ?? item.projects ?? item.numberOfProjects ?? 0);
    const disbursed = Math.round(Number(item.disbursed_pct ?? item.disbursed ?? 0));
    const undisbursed = Math.round(Number(item.undisbursed_pct ?? item.undisbursed ?? (100 - disbursed)));
    const disbursedVol = Math.round((amount * disbursed) / 100);
    const undisbursedVol = Math.round((amount * undisbursed) / 100);

    return {
      country: code,
      name: rawName || code,
      region: item.region || meta?.region || '',
      amount,
      projects,
      disbursed,
      undisbursed,
      disbursedVol,
      undisbursedVol,
      flag: item.flag || meta?.flag || '🏳️',
      flagCode,
    };
  });

  items.sort((a, b) => {
    const ia = TARGET_COUNTRY_ORDER.indexOf(a.country);
    const ib = TARGET_COUNTRY_ORDER.indexOf(b.country);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return 0;
  });

  return items;
}

function normalizeDisbursementArray(rawItems: any[], fallback: DisbursementDivisionItem[]): DisbursementDivisionItem[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return fallback;
  }
  const items: DisbursementDivisionItem[] = rawItems.map((item: any) => {
    const name = String(item.division || item.name || '');
    const disbursedAmount = Math.round(Number(item.disbursed_amount_m ?? item.disbursedAmount ?? item.disbursed ?? 0));
    const undisbursedAmount = Math.round(Number(item.undisbursed_amount_m ?? item.undisbursedAmount ?? item.undisbursed ?? 0));
    const numberOfProjects = Number(item.projects_count ?? item.numberOfProjects ?? item.number_of_projects ?? 0);
    const disbursedPct = Math.round(Number(item.disbursed_pct ?? item.disbursedPct ?? 0));
    const undisbursedPct = Math.round(Number(item.undisbursed_pct ?? item.undisbursedPct ?? (100 - disbursedPct)));

    return {
      name,
      disbursedAmount,
      undisbursedAmount,
      numberOfProjects,
      disbursedPct,
      undisbursedPct,
    };
  });

  items.sort((a, b) => {
    const ia = DISB_DIVISION_ORDER.indexOf(a.name);
    const ib = DISB_DIVISION_ORDER.indexOf(b.name);
    if (ia !== -1 && ib !== -1) return ia - ib;
    return 0;
  });

  return items;
}

function normalizeIdbOverview(rawItems: any[]): IDBOverviewItem[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return DEFAULT_METRICS.df_idb_overview;
  }
  const items: IDBOverviewItem[] = rawItems.map((item: any) => {
    const name = String(item.department || item.name || '');
    return {
      name,
      value: Math.round(Number(item.approved_amount_m ?? item.value ?? item.amount ?? 0)),
      percentage: Math.round(Number(item.percentage ?? item.pct ?? 0)),
      fill: name.toUpperCase() === 'IFD' ? '#005173' : (item.fill || '#A9B3BC'),
    };
  });

  items.sort((a, b) => {
    const ia = IDB_ORDER.indexOf(a.name);
    const ib = IDB_ORDER.indexOf(b.name);
    if (ia !== -1 && ib !== -1) return ia - ib;
    return 0;
  });

  return items;
}

function normalizeIfdOverview(rawItems: any[]): IFDOverviewItem[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return DEFAULT_METRICS.df_ifd_overview;
  }
  const items: IFDOverviewItem[] = rawItems.map((item: any) => {
    const name = String(item.division || item.name || '');
    return {
      name,
      value: Math.round(Number(item.approved_amount_m ?? item.value ?? item.amount ?? 0)),
      percentage: Math.round(Number(item.percentage ?? item.pct ?? 0)),
      fill: name.toUpperCase() === 'FMM' ? '#FFC000' : (item.fill || '#005173'),
    };
  });

  items.sort((a, b) => {
    const ia = IFD_ORDER.indexOf(a.name);
    const ib = IFD_ORDER.indexOf(b.name);
    if (ia !== -1 && ib !== -1) return ia - ib;
    return 0;
  });

  return items;
}

function normalizeAgeDivisions(rawItems: any[]): AgeDivisionItem[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return DEFAULT_METRICS.df_age_divisions;
  }
  const items: AgeDivisionItem[] = rawItems.map((item: any) => {
    const name = String(item.division || item.name || '');
    return {
      name,
      age: Number(Number(item.average_age_years ?? item.age ?? item.average_age ?? 0).toFixed(1)),
    };
  });

  items.sort((a, b) => {
    const ia = AGE_DIVISION_ORDER.indexOf(a.name);
    const ib = AGE_DIVISION_ORDER.indexOf(b.name);
    if (ia !== -1 && ib !== -1) return ia - ib;
    return 0;
  });

  return items;
}

export const CACHE_STORAGE_KEY = 'fmm_dashboard_live_metrics_cache_v3';

export function getStoredMetrics(): DashboardMetricsData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.hero_total_projects) {
        return parsed as DashboardMetricsData;
      }
    }
  } catch (e) {
    console.warn('Error reading dashboard metrics from localStorage:', e);
  }
  return null;
}

export function setStoredMetrics(data: DashboardMetricsData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Error saving dashboard metrics to localStorage:', e);
  }
}

// Module-level cache so concurrent or re-rendered components share one state
let cachedData: DashboardMetricsData | null = typeof window !== 'undefined' ? getStoredMetrics() : null;
let inFlightPromise: Promise<DashboardMetricsData> | null = null;

export async function fetchDashboardMetrics(): Promise<DashboardMetricsData> {
  if (inFlightPromise) return inFlightPromise;

  inFlightPromise = (async () => {
    try {
      const response = await fetch(`${ENDPOINT_URL}?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from metrics endpoint`);
      }
      const raw = await response.json();
      if (!raw || typeof raw !== 'object') {
        throw new Error('Invalid JSON received from metrics endpoint');
      }

      const merged: DashboardMetricsData = {
        // Hero
        hero_total_projects: Number(raw.hero_total_projects ?? DEFAULT_METRICS.hero_total_projects),
        hero_total_amount_m: Number(raw.hero_total_amount_m ?? DEFAULT_METRICS.hero_total_amount_m),
        hero_total_countries: Number(raw.hero_total_countries ?? DEFAULT_METRICS.hero_total_countries),
        fmm_pct_of_ifd: Number(raw.fmm_pct_of_ifd ?? DEFAULT_METRICS.fmm_pct_of_ifd),

        // Geographic Reach
        geo_top_country_name: String(raw.geo_top_country_name ?? DEFAULT_METRICS.geo_top_country_name),
        geo_top_country_amt: Number(raw.geo_top_country_amt ?? DEFAULT_METRICS.geo_top_country_amt),
        geo_top_country_proj: Number(raw.geo_top_country_proj ?? DEFAULT_METRICS.geo_top_country_proj),
        geo_top_country_disb_pct: Number(raw.geo_top_country_disb_pct ?? DEFAULT_METRICS.geo_top_country_disb_pct),
        geo_runnerup_1_name: String(raw.geo_runnerup_1_name ?? DEFAULT_METRICS.geo_runnerup_1_name),
        geo_runnerup_1_pct: Number(raw.geo_runnerup_1_pct ?? DEFAULT_METRICS.geo_runnerup_1_pct),
        geo_runnerup_2_name: String(raw.geo_runnerup_2_name ?? DEFAULT_METRICS.geo_runnerup_2_name),
        geo_runnerup_2_pct: Number(raw.geo_runnerup_2_pct ?? DEFAULT_METRICS.geo_runnerup_2_pct),
        geo_runnerup_3_name: raw.geo_runnerup_3_name ? String(raw.geo_runnerup_3_name) : DEFAULT_METRICS.geo_runnerup_3_name,
        geo_runnerup_3_pct: raw.geo_runnerup_3_pct !== undefined ? Number(raw.geo_runnerup_3_pct) : DEFAULT_METRICS.geo_runnerup_3_pct,

        // Lending Instruments
        pbl_count: Number(raw.pbl_count ?? DEFAULT_METRICS.pbl_count),
        pbl_amount_m: Number(raw.pbl_amount_m ?? DEFAULT_METRICS.pbl_amount_m),
        inv_count: Number(raw.inv_count ?? DEFAULT_METRICS.inv_count),
        inv_amount_m: Number(raw.inv_amount_m ?? DEFAULT_METRICS.inv_amount_m),

        // Stages
        inv_stage_1_count: Number(raw.inv_stage_1_count ?? DEFAULT_METRICS.inv_stage_1_count),
        inv_stage_1_amount: Number(raw.inv_stage_1_amount ?? raw.inv_stage_1_amount_m ?? DEFAULT_METRICS.inv_stage_1_amount),
        inv_stage_2_count: Number(raw.inv_stage_2_count ?? DEFAULT_METRICS.inv_stage_2_count),
        inv_stage_2_amount: Number(raw.inv_stage_2_amount ?? raw.inv_stage_2_amount_m ?? DEFAULT_METRICS.inv_stage_2_amount),
        inv_stage_3_count: Number(raw.inv_stage_3_count ?? DEFAULT_METRICS.inv_stage_3_count),
        inv_stage_3_amount: Number(raw.inv_stage_3_amount ?? raw.inv_stage_3_amount_m ?? DEFAULT_METRICS.inv_stage_3_amount),

        // Portfolio Age
        age_fmm_avg: Number(raw.age_fmm_avg ?? DEFAULT_METRICS.age_fmm_avg),
        age_idb_avg: Number(raw.age_idb_avg ?? DEFAULT_METRICS.age_idb_avg),
        age_ifd_avg: Number(raw.age_ifd_avg ?? DEFAULT_METRICS.age_ifd_avg),
        age_pct_over_5_yrs: Number(raw.age_pct_over_5_yrs ?? DEFAULT_METRICS.age_pct_over_5_yrs),
        age_pct_extensions: Number(raw.age_pct_extensions ?? DEFAULT_METRICS.age_pct_extensions),
        age_comparison_vs_idb: raw.age_comparison_vs_idb !== undefined ? String(raw.age_comparison_vs_idb) : (Number(raw.age_fmm_avg ?? DEFAULT_METRICS.age_fmm_avg) >= Number(raw.age_idb_avg ?? DEFAULT_METRICS.age_idb_avg) ? 'above' : 'below'),
        age_comparison_sentence: raw.age_comparison_sentence !== undefined
          ? String(raw.age_comparison_sentence)
          : `${raw.age_comparison_vs_idb !== undefined ? String(raw.age_comparison_vs_idb) : (Number(raw.age_fmm_avg ?? DEFAULT_METRICS.age_fmm_avg) >= Number(raw.age_idb_avg ?? DEFAULT_METRICS.age_idb_avg) ? 'above' : 'below')} the IDB (${Number(raw.age_idb_avg ?? DEFAULT_METRICS.age_idb_avg).toFixed(1)}) and the IFD department (${Number(raw.age_ifd_avg ?? DEFAULT_METRICS.age_ifd_avg).toFixed(1)})`,

        // Run Date / Refresh Timestamps
        data_as_of_long: raw.data_as_of_long !== undefined ? String(raw.data_as_of_long) : DEFAULT_METRICS.data_as_of_long,
        pdf_date_format: raw.pdf_date_format !== undefined ? String(raw.pdf_date_format) : DEFAULT_METRICS.pdf_date_format,

        // Current Disbursement
        disb_fmm_disbursed_amt: Number(raw.disb_fmm_disbursed_amt ?? DEFAULT_METRICS.disb_fmm_disbursed_amt),
        disb_fmm_undisb_amt: Number(raw.disb_fmm_undisb_amt ?? DEFAULT_METRICS.disb_fmm_undisb_amt),
        disb_fmm_disbursed_pct: Number(raw.disb_fmm_disbursed_pct ?? DEFAULT_METRICS.disb_fmm_disbursed_pct),
        disb_fmm_stg2_3_pct: Number(raw.disb_fmm_stg2_3_pct ?? DEFAULT_METRICS.disb_fmm_stg2_3_pct),

        // Tables / Arrays
        df_idb_overview: normalizeIdbOverview(raw.df_idb_overview),
        df_ifd_overview: normalizeIfdOverview(raw.df_ifd_overview),
        df_geo_impact: normalizeGeoImpact(raw.df_geo_impact),
        df_disb_all_stages: normalizeDisbursementArray(raw.df_disb_all_stages, DEFAULT_METRICS.df_disb_all_stages),
        df_disb_stg2_3: normalizeDisbursementArray(raw.df_disb_stg2_3, DEFAULT_METRICS.df_disb_stg2_3),
        df_age_divisions: normalizeAgeDivisions(raw.df_age_divisions),
      };

      cachedData = merged;
      setStoredMetrics(merged);
      return merged;
    } catch (err) {
      console.warn('Live metrics fetch fallback to cached/default values:', err);
      const fallback = cachedData || getStoredMetrics() || DEFAULT_METRICS;
      return fallback;
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
}

export function useDashboardMetrics() {
  const [data, setData] = useState<DashboardMetricsData>(() => {
    if (cachedData) return cachedData;
    const stored = getStoredMetrics();
    if (stored) {
      cachedData = stored;
      return stored;
    }
    return DEFAULT_METRICS;
  });

  const [hasCachedData] = useState<boolean>(() => {
    return Boolean(cachedData || getStoredMetrics());
  });

  const [loading, setLoading] = useState<boolean>(() => {
    // If we have cached data or default data available immediately, loading is false so UI never renders blank
    return false;
  });

  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function silentSync() {
      try {
        setIsFetching(true);
        const result = await fetchDashboardMetrics();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Error updating live metrics');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsFetching(false);
        }
      }
    }

    silentSync();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, isFetching, hasCachedData, error };
}
