import { useState, useEffect } from 'react';
import { ENDPOINT_URL } from './useDashboardMetrics';
import { setGlobalGasAlerts } from '../utils/alertUtils';

export interface GASMetrics {
  hero_total_projects: number;
  hero_total_amount_m: number;
  hero_total_countries: number;
  s1_count: number;
  s2_count: number;
  s3_count: number;
  disbursed_fmm_disbursed_amt?: number;
  disbursed_fmm_disbursed_pct?: number;
  disbursement_2026_baseline?: number;
  disbursement_2026_actual?: number;
}

export interface GASProjectRow {
  N_Index: number;
  projectNumber: string;
  operationNumber: string;
  title: string;
  countryName: string;
  countryCode: string;
  ttl: string;
  stage: string;
  currentApprovedAmount: number;
  disbursedLifeAmount: number;
  disbursedLifePercent: number;
  lendingInstrumentId: string;
  operationStatus?: string;
  executingAgency?: string;
  localContribution?: number;
  undisbursedAmount?: number;
  monthsOfExtensions?: number;
  lastDisbursementDate?: string;
  monthsWithoutDisbursement?: number;
  yearsInExecution?: number;
  objective?: string;
  originalApprovedAmount?: number;
  canceledAmount?: number;
  approvalDate?: string;
  effectiveDate?: string;
  eligibilityDate?: string;
  firstDisbursementDate?: string;
  totallyDisbursedDate?: string;
  closureDate?: string;
  deadlineCurrentDisbursement?: string;
  [key: string]: any;
}

export interface GASChart1Item {
  project_number: string;
  year: number | string;
  bar_historical_baseline: number | string;
  line_actual_disbursed: number | string | null;
  [key: string]: any;
}

export interface GASChart2Item {
  project_number: string;
  month: number | string;
  cumulative_disbursed: number | string | null;
  cumulative_current_projection: number | string | null;
  [key: string]: any;
}

export interface GASHistoricalPmrItem {
  project_number: string;
  display_year: number;
  tooltip: string;
  validated_classification: string;
  auto_classification: string;
  [key: string]: any;
}

export interface GASHistoricalProjectionBar {
  project_number: string;
  yr?: string;
  transaction_year?: string;
  baseline_projection_amnt_useq?: string | number;
  is_agreed_projection?: string;
  [key: string]: any;
}

export interface GASHistoricalActualLine {
  project_number: string;
  transaction_year?: string;
  transaction_month?: string;
  disbursed_amount_useq?: string | number;
  [key: string]: any;
}

export interface GASAlertRow {
  N?: number;
  projectNumber: string;
  project_name?: string;
  country?: string;
  ttl?: string;
  current_approved_amount?: string | number;
  status_of_indicator: string;
  [key: string]: any;
}

export interface GASAlertSummaryRow {
  alert: string;
  status_of_indicator: string;
  count: number;
}

export const DEFAULT_ALERTS_SUMMARY: GASAlertSummaryRow[] = [
  { alert: "Alert 1", status_of_indicator: "Within the deadline (OA-420/423)", count: 8 },
  { alert: "Alert 1", status_of_indicator: "Extended months", count: 4 },
  { alert: "Alert 1", status_of_indicator: "+1 year extension", count: 0 },
  { alert: "Alert 2", status_of_indicator: "Within the deadline (OA-420/423)", count: 0 },
  { alert: "Alert 2", status_of_indicator: "Extension of 6 months", count: 0 },
  { alert: "Alert 2", status_of_indicator: "Extension of +6 months", count: 1 },
  { alert: "Alert 3", status_of_indicator: "Less than 1 month", count: 0 },
  { alert: "Alert 3", status_of_indicator: "1-6 months", count: 0 },
  { alert: "Alert 3", status_of_indicator: "+6 months", count: 0 },
  { alert: "Alert 4", status_of_indicator: "6 months", count: 0 },
  { alert: "Alert 4", status_of_indicator: "7-12 months", count: 4 },
  { alert: "Alert 4", status_of_indicator: "+12 months", count: 3 },
  { alert: "Alert 5", status_of_indicator: ">25% disbursed", count: 26 },
  { alert: "Alert 5", status_of_indicator: "10%-25%", count: 7 },
  { alert: "Alert 5", status_of_indicator: "0%-10%", count: 3 },
  { alert: "Alert 6", status_of_indicator: "No alert or problem", count: 23 },
  { alert: "Alert 6", status_of_indicator: "With alert or problem: 1-2", count: 9 },
  { alert: "Alert 6", status_of_indicator: "With alert or problem: 3", count: 0 },
  { alert: "Alert 7", status_of_indicator: "No partial cancellations", count: 45 },
  { alert: "Alert 7", status_of_indicator: "Less than 15%", count: 1 },
  { alert: "Alert 7", status_of_indicator: "+15%", count: 2 },
  { alert: "Alert 8", status_of_indicator: "0-4 months", count: 2 },
  { alert: "Alert 8", status_of_indicator: "5-12 months", count: 1 },
  { alert: "Alert 8", status_of_indicator: "+12 months", count: 0 },
];

export interface GASPortfolioState {
  metrics: GASMetrics[];
  active_portfolio_table: GASProjectRow[];
  chart1_yearly_performance: GASChart1Item[];
  chart2_monthly_cumulative: GASChart2Item[];
  historical_pmr: GASHistoricalPmrItem[];
  historical_projections_bars: GASHistoricalProjectionBar[];
  historical_actuals_lines: GASHistoricalActualLine[];
  inactive_pmr_table: GASProjectRow[];
  inactive_chart1_yearly_performance: GASChart1Item[];
  inactive_chart2_monthly_cumulative: GASChart2Item[];
  inactive_historical_pmr: GASHistoricalPmrItem[];
  alert_1_pending_legal: GASAlertRow[];
  alert_2_pending_eligibility: GASAlertRow[];
  alert_3_pending_first_disb: GASAlertRow[];
  alert_4_without_disb: GASAlertRow[];
  alert_5_disbursed_life: GASAlertRow[];
  alert_6_pmr_performance: GASAlertRow[];
  alert_7_partial_cancellations: GASAlertRow[];
  alert_8_expired_deadline: GASAlertRow[];
  alerts_summary: GASAlertSummaryRow[];
  data_as_of?: string;
  data_as_of_long?: string;
  loading: boolean;
  error: Error | null;
}

// Global in-memory cache to prevent re-fetching between route transitions
let globalCache: GASPortfolioState | null = null;
let globalFetchPromise: Promise<GASPortfolioState> | null = null;
const listeners = new Set<(state: GASPortfolioState) => void>();

const notifyListeners = (state: GASPortfolioState) => {
  setGlobalGasAlerts(state);
  listeners.forEach(cb => cb(state));
};

const DEFAULT_GAS_METRICS: GASMetrics = {
  hero_total_projects: 48,
  hero_total_amount_m: 5227,
  hero_total_countries: 12,
  s1_count: 13,
  s2_count: 33,
  s3_count: 2,
  disbursed_fmm_disbursed_amt: 1342.67,
  disbursed_fmm_disbursed_pct: 25.69,
  disbursement_2026_baseline: 409.61,
  disbursement_2026_actual: 216.63
};

const parseGASResponse = (data: any): GASPortfolioState => {
  let metricsArray: GASMetrics[] = [];
  const rawMetric = (Array.isArray(data.metrics) && data.metrics.length > 0)
    ? { ...data, ...data.metrics[0] }
    : data;

  metricsArray = [{
    hero_total_projects: Number(rawMetric.hero_total_projects) || DEFAULT_GAS_METRICS.hero_total_projects,
    hero_total_amount_m: Number(rawMetric.hero_total_amount_m) || DEFAULT_GAS_METRICS.hero_total_amount_m,
    hero_total_countries: Number(rawMetric.hero_total_countries) || DEFAULT_GAS_METRICS.hero_total_countries,
    s1_count: rawMetric.s1_count !== undefined ? Number(rawMetric.s1_count) : DEFAULT_GAS_METRICS.s1_count,
    s2_count: rawMetric.s2_count !== undefined ? Number(rawMetric.s2_count) : DEFAULT_GAS_METRICS.s2_count,
    s3_count: rawMetric.s3_count !== undefined ? Number(rawMetric.s3_count) : DEFAULT_GAS_METRICS.s3_count,
    disbursed_fmm_disbursed_amt: rawMetric.disbursed_fmm_disbursed_amt !== undefined ? Number(rawMetric.disbursed_fmm_disbursed_amt) : DEFAULT_GAS_METRICS.disbursed_fmm_disbursed_amt,
    disbursed_fmm_disbursed_pct: rawMetric.disbursed_fmm_disbursed_pct !== undefined ? Number(rawMetric.disbursed_fmm_disbursed_pct) : DEFAULT_GAS_METRICS.disbursed_fmm_disbursed_pct,
    disbursement_2026_baseline: rawMetric.disbursement_2026_baseline !== undefined ? Number(rawMetric.disbursement_2026_baseline) : DEFAULT_GAS_METRICS.disbursement_2026_baseline,
    disbursement_2026_actual: rawMetric.disbursement_2026_actual !== undefined ? Number(rawMetric.disbursement_2026_actual) : DEFAULT_GAS_METRICS.disbursement_2026_actual
  }];

  const firstRow = Array.isArray(data.active_portfolio_table) && data.active_portfolio_table.length > 0
    ? data.active_portfolio_table[0]
    : null;

  const dataAsOf = data.data_as_of || firstRow?.data_as_of || 'October 24, 2026';
  const dataAsOfLong = data.data_as_of_long || firstRow?.data_as_of_long || (dataAsOf ? `Data as of: ${dataAsOf}` : 'Data as of: October 24, 2026');

  return {
    metrics: metricsArray,
    active_portfolio_table: Array.isArray(data.active_portfolio_table) ? data.active_portfolio_table : [],
    chart1_yearly_performance: Array.isArray(data.chart1_yearly_performance) ? data.chart1_yearly_performance : [],
    chart2_monthly_cumulative: Array.isArray(data.chart2_monthly_cumulative) ? data.chart2_monthly_cumulative : [],
    historical_pmr: Array.isArray(data.historical_pmr) ? data.historical_pmr : [],
    historical_projections_bars: Array.isArray(data.historical_projections_bars) ? data.historical_projections_bars : [],
    historical_actuals_lines: Array.isArray(data.historical_actuals_lines) ? data.historical_actuals_lines : [],
    inactive_pmr_table: Array.isArray(data.inactive_pmr_table) ? data.inactive_pmr_table : [],
    inactive_chart1_yearly_performance: Array.isArray(data.inactive_chart1_yearly_performance) ? data.inactive_chart1_yearly_performance : [],
    inactive_chart2_monthly_cumulative: Array.isArray(data.inactive_chart2_monthly_cumulative) ? data.inactive_chart2_monthly_cumulative : [],
    inactive_historical_pmr: Array.isArray(data.inactive_historical_pmr) ? data.inactive_historical_pmr : [],
    alert_1_pending_legal: Array.isArray(data.alert_1_pending_legal) ? data.alert_1_pending_legal : [],
    alert_2_pending_eligibility: Array.isArray(data.alert_2_pending_eligibility) ? data.alert_2_pending_eligibility : [],
    alert_3_pending_first_disb: Array.isArray(data.alert_3_pending_first_disb)
      ? data.alert_3_pending_first_disb
      : Array.isArray(data.alert_3_pending_first_disbursement)
        ? data.alert_3_pending_first_disbursement
        : [],
    alert_4_without_disb: Array.isArray(data.alert_4_without_disb) ? data.alert_4_without_disb : [],
    alert_5_disbursed_life: Array.isArray(data.alert_5_disbursed_life) ? data.alert_5_disbursed_life : [],
    alert_6_pmr_performance: Array.isArray(data.alert_6_pmr_performance) ? data.alert_6_pmr_performance : [],
    alert_7_partial_cancellations: Array.isArray(data.alert_7_partial_cancellations) ? data.alert_7_partial_cancellations : [],
    alert_8_expired_deadline: Array.isArray(data.alert_8_expired_deadline) ? data.alert_8_expired_deadline : [],
    alerts_summary: Array.isArray(data.alerts_summary) && data.alerts_summary.length > 0
      ? data.alerts_summary.map((r: any) => ({
          alert: String(r.alert || '').trim(),
          status_of_indicator: String(r.status_of_indicator || '').trim(),
          count: Number(r.count) || 0
        }))
      : DEFAULT_ALERTS_SUMMARY,
    data_as_of: dataAsOf,
    data_as_of_long: dataAsOfLong,
    loading: false,
    error: null
  };
};

// Immediate pre-warm from local cache
const loadLocalCacheFirst = async () => {
  try {
    const res = await fetch('/gas_portfolio_cache.json');
    if (res.ok) {
      const data = await res.json();
      if (!globalCache || globalCache.active_portfolio_table.length === 0) {
        const state = parseGASResponse(data);
        globalCache = state;
        notifyListeners(state);
      }
    }
  } catch (err) {
    // ignore
  }
};
loadLocalCacheFirst();

export const fetchGASPortfolioData = async (): Promise<GASPortfolioState> => {
  if (globalCache && !globalCache.loading && globalCache.active_portfolio_table.length > 0) {
    // If we have cache, start background refresh without blocking
    if (!globalFetchPromise) {
      globalFetchPromise = (async () => {
        try {
          const res = await fetch(`${ENDPOINT_URL}?t=${Date.now()}`);
          if (res.ok) {
            const data = await res.json();
            const state = parseGASResponse(data);
            globalCache = state;
            notifyListeners(state);
            return state;
          }
        } catch (err) {
          console.warn('Background GAS refresh error:', err);
        } finally {
          globalFetchPromise = null;
        }
        return globalCache!;
      })();
    }
    return globalCache;
  }

  if (globalFetchPromise) {
    return globalFetchPromise;
  }

  globalFetchPromise = (async () => {
    // Try local cache first in case of network latency
    await loadLocalCacheFirst();
    if (globalCache && globalCache.active_portfolio_table.length > 0) {
      // Trigger background update
      fetch(`${ENDPOINT_URL}?t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          const state = parseGASResponse(data);
          globalCache = state;
          notifyListeners(state);
        })
        .catch(err => console.warn('Background GAS refresh error:', err));
      return globalCache;
    }

    try {
      const res = await fetch(`${ENDPOINT_URL}?t=${Date.now()}`);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();
      const state = parseGASResponse(data);

      globalCache = state;
      notifyListeners(state);
      return state;
    } catch (err: any) {
      console.error('Failed to fetch GAS portfolio data:', err);
      const fallbackState: GASPortfolioState = {
        metrics: [DEFAULT_GAS_METRICS],
        active_portfolio_table: globalCache?.active_portfolio_table || [],
        chart1_yearly_performance: globalCache?.chart1_yearly_performance || [],
        chart2_monthly_cumulative: globalCache?.chart2_monthly_cumulative || [],
        historical_pmr: globalCache?.historical_pmr || [],
        historical_projections_bars: globalCache?.historical_projections_bars || [],
        historical_actuals_lines: globalCache?.historical_actuals_lines || [],
        inactive_pmr_table: globalCache?.inactive_pmr_table || [],
        inactive_chart1_yearly_performance: globalCache?.inactive_chart1_yearly_performance || [],
        inactive_chart2_monthly_cumulative: globalCache?.inactive_chart2_monthly_cumulative || [],
        inactive_historical_pmr: globalCache?.inactive_historical_pmr || [],
        alert_1_pending_legal: globalCache?.alert_1_pending_legal || [],
        alert_2_pending_eligibility: globalCache?.alert_2_pending_eligibility || [],
        alert_3_pending_first_disb: globalCache?.alert_3_pending_first_disb || [],
        alert_4_without_disb: globalCache?.alert_4_without_disb || [],
        alert_5_disbursed_life: globalCache?.alert_5_disbursed_life || [],
        alert_6_pmr_performance: globalCache?.alert_6_pmr_performance || [],
        alert_7_partial_cancellations: globalCache?.alert_7_partial_cancellations || [],
        alert_8_expired_deadline: globalCache?.alert_8_expired_deadline || [],
        alerts_summary: globalCache?.alerts_summary || DEFAULT_ALERTS_SUMMARY,
        loading: false,
        error: err
      };
      globalCache = fallbackState;
      notifyListeners(fallbackState);
      return fallbackState;
    } finally {
      globalFetchPromise = null;
    }
  })();

  return globalFetchPromise;
};

export const useGASPortfolioData = () => {
  const [state, setState] = useState<GASPortfolioState>(() => {
    if (globalCache) return globalCache;
    return {
      metrics: [DEFAULT_GAS_METRICS],
      active_portfolio_table: [],
      chart1_yearly_performance: [],
      chart2_monthly_cumulative: [],
      historical_pmr: [],
      historical_projections_bars: [],
      historical_actuals_lines: [],
      inactive_pmr_table: [],
      inactive_chart1_yearly_performance: [],
      inactive_chart2_monthly_cumulative: [],
      inactive_historical_pmr: [],
      alert_1_pending_legal: [],
      alert_2_pending_eligibility: [],
      alert_3_pending_first_disb: [],
      alert_4_without_disb: [],
      alert_5_disbursed_life: [],
      alert_6_pmr_performance: [],
      alert_7_partial_cancellations: [],
      alert_8_expired_deadline: [],
      alerts_summary: DEFAULT_ALERTS_SUMMARY,
      loading: false,
      error: null
    };
  });

  useEffect(() => {
    listeners.add(setState);
    if (!globalCache || globalCache.active_portfolio_table.length === 0) {
      fetchGASPortfolioData();
    }
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return state;
};
