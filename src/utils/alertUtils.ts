export interface AlertInfo {
  number: number;
  color: 'red' | 'yellow' | 'green';
  title: string;
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

export interface GASAlertsData {
  alert_1_pending_legal?: GASAlertRow[];
  alert_2_pending_eligibility?: GASAlertRow[];
  alert_3_pending_first_disb?: GASAlertRow[];
  alert_3_pending_first_disbursement?: GASAlertRow[];
  alert_4_without_disb?: GASAlertRow[];
  alert_5_disbursed_life?: GASAlertRow[];
  alert_6_pmr_performance?: GASAlertRow[];
  alert_7_partial_cancellations?: GASAlertRow[];
  alert_8_expired_deadline?: GASAlertRow[];
  [key: string]: any;
}

export const ALERT_TITLES: Record<number, string> = {
  1: 'Pending legal effectiveness',
  2: 'Pending eligibility',
  3: 'Pending first disbursement',
  4: 'Projects without disbursements',
  5: 'Disbursed life amount',
  6: 'PMR performance (last 3 cycles)',
  7: 'Partial cancellations',
  8: 'Expired disbursement deadline'
};

export const card1ProjectMetadata: Record<string, {
  name: string;
  country: string;
  countryCode: string;
  ttl: string;
  investmentAmount: string;
  effectivenessStatus: string;
  effectivenessColor: string;
}> = {
  'AR-L1416': {
    name: 'Federal Tax Administration Reform Program',
    country: 'Argentina',
    countryCode: 'ar',
    ttl: 'GOMEZ REINO, JUAN LUIS',
    investmentAmount: '$100.0M',
    effectivenessStatus: '3 extended months',
    effectivenessColor: 'bg-amber-100 text-amber-800'
  },
  'AR-L1424': {
    name: 'Provincial Fiscal Coordination Improvement Program',
    country: 'Argentina',
    countryCode: 'ar',
    ttl: 'GOMEZ REINO, JUAN LUIS',
    investmentAmount: '$750.0M',
    effectivenessStatus: 'Within the deadline (OA-420/423)',
    effectivenessColor: 'bg-emerald-100 text-emerald-800'
  },
  'BR-L1629': {
    name: 'Fiscal Management Modernization Program of the State of Amazonas - PROFISCO III AM',
    country: 'Brazil',
    countryCode: 'br',
    ttl: 'MARIA CRISTINA MAC DOWELL',
    investmentAmount: '$30.0M',
    effectivenessStatus: '4 extended months',
    effectivenessColor: 'bg-amber-100 text-amber-800'
  },
  'BR-L1642': {
    name: 'Fiscal Management Modernization Program for the State of Goiás – PROFISCO III GO',
    country: 'Brazil',
    countryCode: 'br',
    ttl: 'MARTINEZ FRITSCHER, ANDRE CARLOS',
    investmentAmount: '$90.4M',
    effectivenessStatus: 'Within the deadline (OA-420/423)',
    effectivenessColor: 'bg-emerald-100 text-emerald-800'
  },
  'BR-L1656': {
    name: 'Fiscal Management Modernization Project of the State of Maranhão - PROFISCO III MA',
    country: 'Brazil',
    countryCode: 'br',
    ttl: 'YARYGINA UDOVENKO, ANASTASIYA',
    investmentAmount: '$52.9M',
    effectivenessStatus: 'Within the deadline (OA-420/423)',
    effectivenessColor: 'bg-emerald-100 text-emerald-800'
  },
  'BR-L1658': {
    name: 'Fiscal Management Modernization Program of the Ministry of Finance - PROFISCO III MF',
    country: 'Brazil',
    countryCode: 'br',
    ttl: 'MARIA CRISTINA MAC DOWELL',
    investmentAmount: '$278.0M',
    effectivenessStatus: 'Within the deadline (OA-420/423)',
    effectivenessColor: 'bg-emerald-100 text-emerald-800'
  },
  'BR-L1667': {
    name: 'Project for the Modernization of Fiscal Management in the State of Piaui - PROFISCO III PI',
    country: 'Brazil',
    countryCode: 'br',
    ttl: 'MARTINEZ FRITSCHER, ANDRE CARLOS',
    investmentAmount: '$53.0M',
    effectivenessStatus: 'Within the deadline (OA-420/423)',
    effectivenessColor: 'bg-emerald-100 text-emerald-800'
  },
  'BR-L1669': {
    name: 'Fiscal Management Modernization Project of the State of Rio Grande do Sul - PROFISCO III RS',
    country: 'Brazil',
    countryCode: 'br',
    ttl: 'MARIA CRISTINA MAC DOWELL',
    investmentAmount: '$120.0M',
    effectivenessStatus: 'Within the deadline (OA-420/423)',
    effectivenessColor: 'bg-emerald-100 text-emerald-800'
  },
  'BR-L1674': {
    name: 'Fiscal Management Modernization Project for the State of Pernambuco – PROFISCO - III PE.',
    country: 'Brazil',
    countryCode: 'br',
    ttl: 'MARIA CRISTINA MAC DOWELL',
    investmentAmount: '$92.3M',
    effectivenessStatus: 'Within the deadline (OA-420/423)',
    effectivenessColor: 'bg-emerald-100 text-emerald-800'
  },
  'BR-L1676': {
    name: 'Management and Integration Support Program for Fiscal Authorities in Brazil – PROFISCO III SP',
    country: 'Brazil',
    countryCode: 'br',
    ttl: 'MARIA CRISTINA MAC DOWELL',
    investmentAmount: '$145.8M',
    effectivenessStatus: 'Within the deadline (OA-420/423)',
    effectivenessColor: 'bg-emerald-100 text-emerald-800'
  },
  'ME-L1309': {
    name: 'Program to Strengthen the Fiscal Performance of Subnational Governments',
    country: 'Mexico',
    countryCode: 'mx',
    ttl: 'MUNOZ MIRANDA, ANDRES FELIPE',
    investmentAmount: '$500.0M',
    effectivenessStatus: '7 extended months',
    effectivenessColor: 'bg-amber-100 text-amber-800'
  },
  'UR-L1205': {
    name: 'Program for Institutional and Operational Strengthening of Fiscal Management in Uruguay',
    country: 'Uruguay',
    countryCode: 'uy',
    ttl: 'CIAVOLIH MOTA, SERGIO RICARDO',
    investmentAmount: '$20.0M',
    effectivenessStatus: '8 extended months',
    effectivenessColor: 'bg-amber-100 text-amber-800'
  }
};

let globalGasAlerts: GASAlertsData = {};

// Preload local cache if available in browser
if (typeof window !== 'undefined' && typeof fetch === 'function') {
  fetch('/gas_portfolio_cache.json')
    .then(res => res.json())
    .then(data => {
      if (data) {
        setGlobalGasAlerts(data);
      }
    })
    .catch(() => {});
}

export function setGlobalGasAlerts(data: GASAlertsData) {
  if (!data) return;
  globalGasAlerts = {
    alert_1_pending_legal: Array.isArray(data.alert_1_pending_legal) ? data.alert_1_pending_legal : globalGasAlerts.alert_1_pending_legal || [],
    alert_2_pending_eligibility: Array.isArray(data.alert_2_pending_eligibility) ? data.alert_2_pending_eligibility : globalGasAlerts.alert_2_pending_eligibility || [],
    alert_3_pending_first_disb: Array.isArray(data.alert_3_pending_first_disb)
      ? data.alert_3_pending_first_disb
      : Array.isArray(data.alert_3_pending_first_disbursement)
        ? data.alert_3_pending_first_disbursement
        : globalGasAlerts.alert_3_pending_first_disb || [],
    alert_4_without_disb: Array.isArray(data.alert_4_without_disb) ? data.alert_4_without_disb : globalGasAlerts.alert_4_without_disb || [],
    alert_5_disbursed_life: Array.isArray(data.alert_5_disbursed_life) ? data.alert_5_disbursed_life : globalGasAlerts.alert_5_disbursed_life || [],
    alert_6_pmr_performance: Array.isArray(data.alert_6_pmr_performance) ? data.alert_6_pmr_performance : globalGasAlerts.alert_6_pmr_performance || [],
    alert_7_partial_cancellations: Array.isArray(data.alert_7_partial_cancellations) ? data.alert_7_partial_cancellations : globalGasAlerts.alert_7_partial_cancellations || [],
    alert_8_expired_deadline: Array.isArray(data.alert_8_expired_deadline) ? data.alert_8_expired_deadline : globalGasAlerts.alert_8_expired_deadline || [],
  };
}

export function getStatusColor(alertNumber: number, status: string, projectId?: string): 'red' | 'yellow' | 'green' | 'grey' {
  const s = (status || '').trim().toLowerCase();
  
  if (alertNumber === 1) {
    if (s.includes('+1 año') || s.includes('+1 year') || s.includes('>12')) return 'red';
    if (s.includes('extend') || s.includes('extens') || s.includes('prórroga')) return 'yellow';
    if (s.includes('deadline') || s.includes('plazo') || s.includes('within')) return 'green';
    if (projectId && card1ProjectMetadata[projectId]) {
      const pStatus = card1ProjectMetadata[projectId].effectivenessStatus.toLowerCase();
      if (pStatus.includes('+1 año') || pStatus.includes('+1 year') || pStatus.includes('>12')) return 'red';
      if (pStatus.includes('extend') || pStatus.includes('extens') || pStatus.includes('prórroga')) return 'yellow';
      return 'green';
    }
    return 'green';
  }

  if (alertNumber === 2) {
    if (s.includes('+6') || s.includes('>6') || s.includes('extension of +6')) return 'red';
    if (s.includes('6 month') || s.includes('6 mes')) return 'yellow';
    return 'green';
  }

  if (alertNumber === 3) {
    if (s.includes('+6') || s.includes('>6')) return 'red';
    if (s.includes('1-6') || s.includes('retraso') || s.includes('delay')) return 'yellow';
    if (s.includes('menos') || s.includes('<') || s.includes('less')) return 'green';
    return 'grey';
  }

  if (alertNumber === 4) {
    if (s.includes('+12') || s.includes('>12')) return 'red';
    if (s.includes('7-12')) return 'yellow';
    if (s.includes('6 month') || s.includes('6 mes')) return 'green';
    return 'yellow';
  }

  if (alertNumber === 5) {
    if (s.includes('0%-10%') || s.includes('0-10%')) return 'red';
    if (s.includes('10%-25%') || s.includes('10-25%')) return 'yellow';
    if (s.includes('>25%')) return 'green';
    return 'green';
  }

  if (alertNumber === 6) {
    if (s.includes(': 3') || s.includes('problema: 3')) return 'red';
    if (s.includes('1-2') || s.includes('with alert') || s.includes('con alerta')) return 'yellow';
    return 'green';
  }

  if (alertNumber === 7) {
    if (s.includes('+15%') || s.includes('> 15%') || s.includes('>15%')) return 'red';
    if (s.includes('less than 15%') || s.includes('hasta 15%') || s.includes('<= 15%')) return 'yellow';
    return 'green';
  }

  if (alertNumber === 8) {
    if (s.includes('>12') || s.includes('+12')) return 'red';
    if (s.includes('5-12')) return 'yellow';
    if (s.includes('0-4')) return 'green';
    return 'yellow';
  }

  return 'grey';
}

export function getAlertsForProject(projectId: string, gasData?: any): AlertInfo[] {
  const alerts: AlertInfo[] = [];
  const data = gasData || globalGasAlerts;

  for (let num = 1; num <= 8; num++) {
    let table: GASAlertRow[] = [];
    if (num === 1) table = data?.alert_1_pending_legal || globalGasAlerts.alert_1_pending_legal || [];
    else if (num === 2) table = data?.alert_2_pending_eligibility || globalGasAlerts.alert_2_pending_eligibility || [];
    else if (num === 3) table = data?.alert_3_pending_first_disb || data?.alert_3_pending_first_disbursement || globalGasAlerts.alert_3_pending_first_disb || [];
    else if (num === 4) table = data?.alert_4_without_disb || globalGasAlerts.alert_4_without_disb || [];
    else if (num === 5) table = data?.alert_5_disbursed_life || globalGasAlerts.alert_5_disbursed_life || [];
    else if (num === 6) table = data?.alert_6_pmr_performance || globalGasAlerts.alert_6_pmr_performance || [];
    else if (num === 7) table = data?.alert_7_partial_cancellations || globalGasAlerts.alert_7_partial_cancellations || [];
    else if (num === 8) table = data?.alert_8_expired_deadline || globalGasAlerts.alert_8_expired_deadline || [];

    const row = table.find((x: any) => x.projectNumber === projectId);
    if (row) {
      const color = getStatusColor(num, row.status_of_indicator, projectId);
      alerts.push({
        number: num,
        color: color === 'grey' ? 'green' : color,
        title: ALERT_TITLES[num]
      });
    }
  }

  return alerts;
}

export function getAlertTagForProject(projectId: string, alertNumber: number, gasData?: any): { tag: string; color: 'red' | 'yellow' | 'green' | 'grey' } {
  const data = gasData || globalGasAlerts;

  if (alertNumber === 1) {
    if (card1ProjectMetadata[projectId]) {
      const meta = card1ProjectMetadata[projectId];
      const isYellow = meta.effectivenessStatus.toLowerCase().includes('extend');
      return { tag: meta.effectivenessStatus, color: isYellow ? 'yellow' : 'green' };
    }
    const r = (data?.alert_1_pending_legal || globalGasAlerts.alert_1_pending_legal || []).find((x: any) => x.projectNumber === projectId);
    if (r) {
      const color = getStatusColor(1, r.status_of_indicator, projectId);
      return { tag: r.status_of_indicator, color };
    }
    return { tag: 'N/A', color: 'grey' };
  }

  let table: GASAlertRow[] = [];
  if (alertNumber === 2) table = data?.alert_2_pending_eligibility || globalGasAlerts.alert_2_pending_eligibility || [];
  else if (alertNumber === 3) table = data?.alert_3_pending_first_disb || data?.alert_3_pending_first_disbursement || globalGasAlerts.alert_3_pending_first_disb || [];
  else if (alertNumber === 4) table = data?.alert_4_without_disb || globalGasAlerts.alert_4_without_disb || [];
  else if (alertNumber === 5) table = data?.alert_5_disbursed_life || globalGasAlerts.alert_5_disbursed_life || [];
  else if (alertNumber === 6) table = data?.alert_6_pmr_performance || globalGasAlerts.alert_6_pmr_performance || [];
  else if (alertNumber === 7) table = data?.alert_7_partial_cancellations || globalGasAlerts.alert_7_partial_cancellations || [];
  else if (alertNumber === 8) table = data?.alert_8_expired_deadline || globalGasAlerts.alert_8_expired_deadline || [];

  const row = table.find((x: any) => x.projectNumber === projectId);
  if (row) {
    const color = getStatusColor(alertNumber, row.status_of_indicator, projectId);
    return { tag: row.status_of_indicator, color };
  }

  if (alertNumber === 3) {
    return { tag: 'No projects with this alert', color: 'grey' };
  }

  return { tag: 'N/A', color: 'grey' };
}
