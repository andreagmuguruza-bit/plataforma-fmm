import React, { useState, useMemo } from 'react';
import { Project } from '../types';
import { ArrowLeft, Search, X, ChevronsUpDown, Filter, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useGASPortfolioData, GASPortfolioState, DEFAULT_ALERTS_SUMMARY } from '../hooks/useGASPortfolioData';
import { card1ProjectMetadata, getStatusColor } from '../utils/alertUtils';

interface AlertsProps {
  projects: Project[];
  onBack: () => void;
  onSelectProject?: (id: string) => void;
  backLabel?: string;
  initialState?: {
    openTabs: { id: string; number: number; title: string }[];
    activeTabId: string;
    tabSearchTerm: string;
    selectedSlice: string | null;
    tabFilters: Record<string, string[]>;
    tabSortConfig: { key: string, direction: 'asc' | 'desc' | null };
  };
  onStateChange?: (state: {
    openTabs: { id: string; number: number; title: string }[];
    activeTabId: string;
    tabSearchTerm: string;
    selectedSlice: string | null;
    tabFilters: Record<string, string[]>;
    tabSortConfig: { key: string, direction: 'asc' | 'desc' | null };
  }) => void;
}

// Helper functions for SVG donut charts
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
};

const getIndicatorBoxColor = (colorClass: string) => {
  if (colorClass.includes('red-')) return '#e60000';
  if (colorClass.includes('amber-') || colorClass.includes('yellow-')) return '#ffb300';
  if (colorClass.includes('emerald-') || colorClass.includes('green-')) return '#00b04f';
  return '#cccccc';
};

const countryCodes: Record<string, string> = {
  'Colombia': 'co',
  'Peru': 'pe',
  'Brazil': 'br',
  'Argentina': 'ar',
  'Uruguay': 'uy',
  'Paraguay': 'py',
  'Chile': 'cl',
  'Ecuador': 'ec',
  'Suriname': 'sr',
  'Mexico': 'mx',
  'Panama': 'pa',
  'Belize': 'bz',
  'Bolivia': 'bo',
  'Costa Rica': 'cr',
  'Dominican Republic': 'do',
  'El Salvador': 'sv',
  'Guatemala': 'gt',
  'Honduras': 'hn',
  'Nicaragua': 'ni',
};

export interface CardProjectItem extends Omit<Project, 'metadata'> {
  metadata?: any;
  status_of_indicator: string;
  status_of_indicatorColor: string;
  effectivenessStatus?: string;
  effectivenessColor?: string;
  eligibilityStatus?: string;
  eligibilityColor?: string;
  disbursementStatus?: string;
  disbursementColor?: string;
  noDisbStatus?: string;
  noDisbColor?: string;
  lifeDisbPercent?: string;
  lifeDisbColor?: string;
  pmrPerfStatus?: string;
  pmrPerfColor?: string;
  cancellationStatus?: string;
  expiredDeadlineStatus?: string;
  expiredDeadlineColor?: string;
}

const getCardDetails = (cardNumber: number, gasData: GASPortfolioState, list: Project[]): { description: string; columns: { key: string; label: string }[]; projects: CardProjectItem[] } => {
  switch (cardNumber) {
    case 1: {
      const rawRows = (gasData.alert_1_pending_legal && gasData.alert_1_pending_legal.length > 0)
        ? gasData.alert_1_pending_legal
        : Object.keys(card1ProjectMetadata).map((id, idx) => ({
            N: idx + 1,
            projectNumber: id,
            project_name: card1ProjectMetadata[id].name,
            country: card1ProjectMetadata[id].country,
            ttl: card1ProjectMetadata[id].ttl,
            current_approved_amount: card1ProjectMetadata[id].investmentAmount,
            status_of_indicator: card1ProjectMetadata[id].effectivenessStatus
          }));

      return {
        description: "The indicator includes projects approved by the Bank's Board of Directors whose loan contract(s) are pending signature or ratification. The warning is activated when the regulatory deadline for signing is exceeded. The regulatory term is 12 months when prior legislative approval is required, or 3 months when it is not required.",
        columns: [
          { key: 'status_of_indicator', label: 'Plazo Transcurrido' }
        ],
        projects: rawRows.map((row, idx) => {
          const id = row.projectNumber;
          const meta = card1ProjectMetadata[id];
          const status = row.status_of_indicator || meta?.effectivenessStatus || 'Within the deadline (OA-420/423)';
          const col = getStatusColor(1, status, id);
          const color = col === 'red' ? 'bg-red-100 text-red-800 border-red-200' : col === 'yellow' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200';
          const existing = list.find(p => p.id === id);

          return {
            index: row.N || idx + 1,
            id,
            operationNumber: existing?.operationNumber || '',
            name: row.project_name || meta?.name || existing?.name || id,
            country: row.country || meta?.country || existing?.country || '',
            countryCode: ((row.country || meta?.country || existing?.country || '').substring(0, 2)).toLowerCase(),
            countryName: row.country || meta?.country || existing?.country || '',
            ttl: row.ttl || meta?.ttl || existing?.ttl || '',
            status: 'Stage I',
            isPrefilledByTeam: true,
            validatedByTTLDate: null,
            metadata: {
              investmentAmount: typeof row.current_approved_amount === 'number'
                ? `$${row.current_approved_amount.toFixed(1)}M`
                : (row.current_approved_amount || meta?.investmentAmount || 'N/A'),
              disbursementPercent: 0,
              elapsedYears: 0,
              siScore: 0,
              pmr2026: { status: 'Satisfactory', score: 0 }
            },
            status_of_indicator: status,
            status_of_indicatorColor: color,
            effectivenessStatus: status,
            effectivenessColor: color
          };
        })
      };
    }

    case 2: {
      const rawRows = gasData.alert_2_pending_eligibility || [];
      return {
        description: "Projects with signed loan contracts and pending full eligibility are included; 100% of the clauses must be fulfilled and the approval of the Country Office Representative is required for completion.",
        columns: [
          { key: 'status_of_indicator', label: 'Estatus de Extensión' }
        ],
        projects: rawRows.map((row, idx) => {
          const id = row.projectNumber;
          const status = row.status_of_indicator || 'Extension of +6 months';
          const col = getStatusColor(2, status, id);
          const colorClass = col === 'red' ? 'bg-red-100 text-red-800 border-red-200' : col === 'yellow' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200';
          const existing = list.find(p => p.id === id);

          return {
            index: row.N || idx + 1,
            id,
            operationNumber: existing?.operationNumber || '',
            name: row.project_name || existing?.name || id,
            country: row.country || existing?.country || '',
            countryCode: (row.country || existing?.country || '').substring(0, 2).toLowerCase(),
            countryName: row.country || existing?.country || '',
            ttl: row.ttl || existing?.ttl || '',
            status: existing?.status || 'Stage II',
            isPrefilledByTeam: true,
            validatedByTTLDate: null,
            metadata: {
              investmentAmount: typeof row.current_approved_amount === 'number'
                ? `$${row.current_approved_amount.toFixed(1)}M`
                : (row.current_approved_amount || existing?.metadata?.investmentAmount || 'N/A'),
              disbursementPercent: existing?.metadata?.disbursementPercent || 0,
              elapsedYears: 0,
              siScore: 0,
              pmr2026: { status: 'Satisfactory', score: 0 }
            },
            status_of_indicator: status,
            status_of_indicatorColor: colorClass,
            eligibilityStatus: status,
            eligibilityColor: colorClass
          };
        })
      };
    }

    case 3: {
      const rawRows = gasData.alert_3_pending_first_disb || [];
      return {
        description: "The indicator includes eligible projects from the active portfolio that have not yet made their first disbursement. The warning is activated if the project does not make its first disbursement within a month of being declared eligible.",
        columns: [
          { key: 'status_of_indicator', label: 'Retraso de Desembolso' }
        ],
        projects: rawRows.map((row, idx) => {
          const id = row.projectNumber;
          const status = row.status_of_indicator || '';
          const col = getStatusColor(3, status, id);
          const colorClass = col === 'red' ? 'bg-red-100 text-red-800 border-red-200' : col === 'yellow' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200';
          const existing = list.find(p => p.id === id);

          return {
            index: row.N || idx + 1,
            id,
            operationNumber: existing?.operationNumber || '',
            name: row.project_name || existing?.name || id,
            country: row.country || existing?.country || '',
            countryCode: (row.country || existing?.country || '').substring(0, 2).toLowerCase(),
            countryName: row.country || existing?.country || '',
            ttl: row.ttl || existing?.ttl || '',
            status: existing?.status || 'Stage II',
            isPrefilledByTeam: true,
            validatedByTTLDate: null,
            metadata: {
              investmentAmount: typeof row.current_approved_amount === 'number'
                ? `$${row.current_approved_amount.toFixed(1)}M`
                : (row.current_approved_amount || 'N/A'),
              disbursementPercent: 0,
              elapsedYears: 0,
              siScore: 0,
              pmr2026: { status: 'Satisfactory', score: 0 }
            },
            status_of_indicator: status,
            status_of_indicatorColor: colorClass,
            disbursementStatus: status,
            disbursementColor: colorClass
          };
        })
      };
    }

    case 4: {
      const rawRows = gasData.alert_4_without_disb || [];
      return {
        description: "The indicator includes eligible projects that have not disbursed for more than 6 months since their eligibility. Projects that have already disbursed 100% of their resources are not included.",
        columns: [
          { key: 'status_of_indicator', label: 'Tiempo sin desembolsos' }
        ],
        projects: rawRows.map((row, idx) => {
          const id = row.projectNumber;
          const status = row.status_of_indicator;
          const col = getStatusColor(4, status, id);
          const colorClass = col === 'red' ? 'bg-red-100 text-red-800 border-red-200' : col === 'yellow' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200';
          const existing = list.find(p => p.id === id);

          return {
            index: row.N || idx + 1,
            id,
            operationNumber: existing?.operationNumber || '',
            name: row.project_name || existing?.name || id,
            country: row.country || existing?.country || '',
            countryCode: (row.country || existing?.country || '').substring(0, 2).toLowerCase(),
            countryName: row.country || existing?.country || '',
            ttl: row.ttl || existing?.ttl || '',
            status: existing?.status || 'Stage II',
            isPrefilledByTeam: true,
            validatedByTTLDate: null,
            metadata: {
              investmentAmount: typeof row.current_approved_amount === 'number'
                ? `$${row.current_approved_amount.toFixed(1)}M`
                : (row.current_approved_amount || existing?.metadata?.investmentAmount || 'N/A'),
              disbursementPercent: existing?.metadata?.disbursementPercent || 0,
              elapsedYears: 0,
              siScore: 0,
              pmr2026: { status: 'Satisfactory', score: 0 }
            },
            status_of_indicator: status,
            status_of_indicatorColor: colorClass,
            noDisbStatus: status,
            noDisbColor: colorClass
          };
        })
      };
    }

    case 5: {
      const rawRows = gasData.alert_5_disbursed_life || [];
      return {
        description: "The indicator includes projects with more than 36 months in execution (since effectiveness). It classifies these projects according to their disbursed life amount as a percentage of their current approved amount.",
        columns: [
          { key: 'status_of_indicator', label: 'Porcentaje Desembolsado / Estatus' }
        ],
        projects: rawRows.map((row, idx) => {
          const id = row.projectNumber;
          const status = row.status_of_indicator;
          const col = getStatusColor(5, status, id);
          const colorClass = col === 'red' ? 'bg-red-100 text-red-800 border-red-200' : col === 'yellow' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200';
          const existing = list.find(p => p.id === id);

          return {
            index: row.N || idx + 1,
            id,
            operationNumber: existing?.operationNumber || '',
            name: row.project_name || existing?.name || id,
            country: row.country || existing?.country || '',
            countryCode: (row.country || existing?.country || '').substring(0, 2).toLowerCase(),
            countryName: row.country || existing?.country || '',
            ttl: row.ttl || existing?.ttl || '',
            status: existing?.status || 'Stage II',
            isPrefilledByTeam: true,
            validatedByTTLDate: null,
            metadata: {
              investmentAmount: typeof row.current_approved_amount === 'number'
                ? `$${row.current_approved_amount.toFixed(1)}M`
                : (row.current_approved_amount || existing?.metadata?.investmentAmount || 'N/A'),
              disbursementPercent: existing?.metadata?.disbursementPercent || 0,
              elapsedYears: 0,
              siScore: 0,
              pmr2026: { status: 'Satisfactory', score: 0 }
            },
            status_of_indicator: status,
            status_of_indicatorColor: colorClass,
            lifeDisbPercent: status,
            lifeDisbColor: colorClass
          };
        })
      };
    }

    case 6: {
      const rawRows = gasData.alert_6_pmr_performance || [];
      return {
        description: "Projects in the active portfolio that have received at least one performance rating in the past three years are included. The warning is activated if the project is classified as alert or problem in at least one of the last three PMR cycles.",
        columns: [
          { key: 'status_of_indicator', label: 'Estatus PMR (Señales de Alerta)' }
        ],
        projects: rawRows.map((row, idx) => {
          const id = row.projectNumber;
          const status = row.status_of_indicator;
          const col = getStatusColor(6, status, id);
          const colorClass = col === 'red' ? 'bg-red-100 text-red-800 border-red-200' : col === 'yellow' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200';
          const existing = list.find(p => p.id === id);

          return {
            index: row.N || idx + 1,
            id,
            operationNumber: existing?.operationNumber || '',
            name: row.project_name || existing?.name || id,
            country: row.country || existing?.country || '',
            countryCode: (row.country || existing?.country || '').substring(0, 2).toLowerCase(),
            countryName: row.country || existing?.country || '',
            ttl: row.ttl || existing?.ttl || '',
            status: existing?.status || 'Stage II',
            isPrefilledByTeam: true,
            validatedByTTLDate: null,
            metadata: {
              investmentAmount: typeof row.current_approved_amount === 'number'
                ? `$${row.current_approved_amount.toFixed(1)}M`
                : (row.current_approved_amount || existing?.metadata?.investmentAmount || 'N/A'),
              disbursementPercent: existing?.metadata?.disbursementPercent || 0,
              elapsedYears: 0,
              siScore: 0,
              pmr2026: { status: 'Satisfactory', score: 0 }
            },
            status_of_indicator: status,
            status_of_indicatorColor: colorClass,
            pmrPerfStatus: status,
            pmrPerfColor: colorClass
          };
        })
      };
    }

    case 7: {
      const rawRows = gasData.alert_7_partial_cancellations || [];
      return {
        description: "The indicator includes projects in active portfolio that have cancelled a portion of their original approved amount. Projects that have canceled all of their resources are not included. The warning is activated when a project has a partial cancellation, regardless of the amount or the moment in which it was cancelled.",
        columns: [
          { key: 'status_of_indicator', label: 'Estatus de Cancelación' }
        ],
        projects: rawRows.map((row, idx) => {
          const id = row.projectNumber;
          const status = row.status_of_indicator;
          const col = getStatusColor(7, status, id);
          const colorClass = col === 'red' ? 'bg-red-100 text-red-800 border-red-200' : col === 'yellow' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200';
          const existing = list.find(p => p.id === id);

          return {
            index: row.N || idx + 1,
            id,
            operationNumber: existing?.operationNumber || '',
            name: row.project_name || existing?.name || id,
            country: row.country || existing?.country || '',
            countryCode: (row.country || existing?.country || '').substring(0, 2).toLowerCase(),
            countryName: row.country || existing?.country || '',
            ttl: row.ttl || existing?.ttl || '',
            status: existing?.status || 'Stage II',
            isPrefilledByTeam: true,
            validatedByTTLDate: null,
            metadata: {
              investmentAmount: typeof row.current_approved_amount === 'number'
                ? `$${row.current_approved_amount.toFixed(1)}M`
                : (row.current_approved_amount || existing?.metadata?.investmentAmount || 'N/A'),
              disbursementPercent: existing?.metadata?.disbursementPercent || 0,
              elapsedYears: 0,
              siScore: 0,
              pmr2026: { status: 'Satisfactory', score: 0 }
            },
            status_of_indicator: status,
            status_of_indicatorColor: colorClass,
            cancellationStatus: status,
            cancellationColor: colorClass
          };
        })
      };
    }

    case 8: {
      const rawRows = gasData.alert_8_expired_deadline || [];
      return {
        description: "The indicator includes projects that have exceeded the term for the current last disbursement date, but have not justified 100% of the resources and its operational closure is pending. The warning is activated if 120 days after the date of the last current disbursement, the project has not achieved its operational closure (COO).",
        columns: [
          { key: 'status_of_indicator', label: 'Retraso de Plazo' }
        ],
        projects: rawRows.map((row, idx) => {
          const id = row.projectNumber;
          const status = row.status_of_indicator;
          const col = getStatusColor(8, status, id);
          const colorClass = col === 'red' ? 'bg-red-100 text-red-800 border-red-200' : col === 'yellow' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200';
          const existing = list.find(p => p.id === id);

          return {
            index: row.N || idx + 1,
            id,
            operationNumber: existing?.operationNumber || '',
            name: row.project_name || existing?.name || id,
            country: row.country || existing?.country || '',
            countryCode: (row.country || existing?.country || '').substring(0, 2).toLowerCase(),
            countryName: row.country || existing?.country || '',
            ttl: row.ttl || existing?.ttl || '',
            status: existing?.status || 'Stage II',
            isPrefilledByTeam: true,
            validatedByTTLDate: null,
            metadata: {
              investmentAmount: typeof row.current_approved_amount === 'number'
                ? `$${row.current_approved_amount.toFixed(1)}M`
                : (row.current_approved_amount || existing?.metadata?.investmentAmount || 'N/A'),
              disbursementPercent: existing?.metadata?.disbursementPercent || 0,
              elapsedYears: 0,
              siScore: 0,
              pmr2026: { status: 'Satisfactory', score: 0 }
            },
            status_of_indicator: status,
            status_of_indicatorColor: colorClass,
            expiredDeadlineStatus: status,
            expiredDeadlineColor: colorClass
          };
        })
      };
    }

    default:
      return { description: '', columns: [], projects: [] };
  }
};

interface IndicatorSlice {
  key: string;
  label: string;
  color: string;
  count: number;
  match: (status: string, projectId?: string) => boolean;
}

const getCardSlices = (cardNumber: number, gasData: GASPortfolioState, _cardProjects?: CardProjectItem[]): IndicatorSlice[] => {
  const alertKey = `Alert ${cardNumber}`.toLowerCase();
  const summaryRows = (gasData.alerts_summary && gasData.alerts_summary.length > 0)
    ? gasData.alerts_summary.filter(r => r.alert.toLowerCase() === alertKey)
    : DEFAULT_ALERTS_SUMMARY.filter(r => r.alert.toLowerCase() === alertKey);

  // Fallback default labels for cards 1 to 8
  const defaultLabels = [
    ['Within the deadline (OA-420/423)', 'Extended months', '+1 year extension'],
    ['Within the deadline (OA-420/423)', 'Extension of 6 months', 'Extension of +6 months'],
    ['Less than 1 month', '1-6 months', '+6 months'],
    ['6 months', '7-12 months', '+12 months'],
    ['>25% disbursed', '10%-25%', '0%-10%'],
    ['No alert or problem', 'With alert or problem: 1-2', 'With alert or problem: 3'],
    ['No partial cancellations', 'Less than 15%', '+15%'],
    ['0-4 months', '5-12 months', '+12 months'],
  ][cardNumber - 1] || ['Within deadline', 'Warning', 'Critical'];

  const greenLabel = summaryRows[0]?.status_of_indicator || defaultLabels[0];
  const greenCount = summaryRows[0] !== undefined ? Number(summaryRows[0].count) || 0 : 0;

  const yellowLabel = summaryRows[1]?.status_of_indicator || defaultLabels[1];
  const yellowCount = summaryRows[1] !== undefined ? Number(summaryRows[1].count) || 0 : 0;

  const redLabel = summaryRows[2]?.status_of_indicator || defaultLabels[2];
  const redCount = summaryRows[2] !== undefined ? Number(summaryRows[2].count) || 0 : 0;

  let greenMatch: (s: string, id?: string) => boolean;
  let yellowMatch: (s: string, id?: string) => boolean;
  let redMatch: (s: string, id?: string) => boolean;

  switch (cardNumber) {
    case 1: {
      redMatch = (s: string) => s.includes('+1 año') || s.includes('+1 year') || s.includes('>12');
      yellowMatch = (s: string, id?: string) =>
        s.toLowerCase().includes('extend') ||
        s.toLowerCase().includes('prórroga') ||
        (!!id && !!card1ProjectMetadata[id]?.effectivenessStatus.toLowerCase().includes('extend'));
      greenMatch = (s: string, id?: string) => !yellowMatch(s, id) && !redMatch(s);
      break;
    }
    case 2: {
      redMatch = (s: string) => s.includes('+6') || s.includes('>6') || s.includes('extension of +6');
      yellowMatch = (s: string) => (s.includes('6 mes') || s.includes('6 month')) && !s.includes('+6') && !s.includes('>6');
      greenMatch = (s: string) => s.toLowerCase().includes('plazo') || s.toLowerCase().includes('deadline') || s.toLowerCase().includes('within');
      break;
    }
    case 3: {
      redMatch = (s: string) => s.includes('+6') || s.includes('>6');
      yellowMatch = (s: string) => s.includes('1-6') || s.toLowerCase().includes('retraso') || s.toLowerCase().includes('delay');
      greenMatch = (s: string) => s.toLowerCase().includes('menos') || s.toLowerCase().includes('less') || s.includes('<');
      break;
    }
    case 4: {
      redMatch = (s: string) => s.includes('+12') || s.includes('>12');
      yellowMatch = (s: string) => s.includes('7-12');
      greenMatch = (s: string) => (s.includes('6 mes') || s.includes('6 month')) && !s.includes('7-12') && !s.includes('+12');
      break;
    }
    case 5: {
      redMatch = (s: string) => s.includes('0%-10%') || s.includes('0-10%');
      yellowMatch = (s: string) => s.includes('10%-25%') || s.includes('10-25%');
      greenMatch = (s: string) => s.includes('>25%') || s.includes('> 25%');
      break;
    }
    case 6: {
      redMatch = (s: string) => s.includes(': 3') || s.includes('problema: 3');
      yellowMatch = (s: string) => s.includes('1-2') || s.toLowerCase().includes('with alert') || s.toLowerCase().includes('con alerta');
      greenMatch = (s: string) => s.toLowerCase().includes('no alert') || s.toLowerCase().includes('sin alerta');
      break;
    }
    case 7: {
      redMatch = (s: string) => s.includes('+15%') || s.includes('>15%') || s.includes('> 15%');
      yellowMatch = (s: string) => s.toLowerCase().includes('less than 15%') || s.toLowerCase().includes('hasta 15%') || s.includes('<= 15%');
      greenMatch = (s: string) => s.toLowerCase().includes('no partial') || s.toLowerCase().includes('sin cancelación');
      break;
    }
    case 8: {
      redMatch = (s: string) => s.includes('+12') || s.includes('>12');
      yellowMatch = (s: string) => s.includes('5-12');
      greenMatch = (s: string) => s.includes('0-4');
      break;
    }
    default: {
      redMatch = (s: string) => s.toLowerCase().includes('red');
      yellowMatch = (s: string) => s.toLowerCase().includes('yellow');
      greenMatch = (s: string) => s.toLowerCase().includes('green');
      break;
    }
  }

  return [
    {
      key: greenLabel,
      label: greenLabel,
      color: '#00b04f',
      count: greenCount,
      match: (s: string, id?: string) => s.trim().toLowerCase() === greenLabel.trim().toLowerCase() || greenMatch(s, id)
    },
    {
      key: yellowLabel,
      label: yellowLabel,
      color: '#ffb300',
      count: yellowCount,
      match: (s: string, id?: string) => s.trim().toLowerCase() === yellowLabel.trim().toLowerCase() || yellowMatch(s, id)
    },
    {
      key: redLabel,
      label: redLabel,
      color: '#e60000',
      count: redCount,
      match: (s: string, id?: string) => s.trim().toLowerCase() === redLabel.trim().toLowerCase() || redMatch(s, id)
    }
  ];
};

export default function Alerts({ projects, onBack, onSelectProject, initialState, onStateChange, backLabel }: AlertsProps) {
  const gasData = useGASPortfolioData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlertLevel, setSelectedAlertLevel] = useState<string>('ALL');

  const [openTabs, setOpenTabs] = useState<{ id: string; number: number; title: string }[]>(
    initialState?.openTabs || [{ id: 'overview', number: 0, title: 'Scorecard' }]
  );
  const [activeTabId, setActiveTabId] = useState<string>(initialState?.activeTabId || 'overview');
  const [tabSearchTerm, setTabSearchTerm] = useState<string>(initialState?.tabSearchTerm || '');
  const [selectedSlice, setSelectedSlice] = useState<string | null>(initialState?.selectedSlice || null);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    
    const updatedTabs = [...openTabs];
    const [removed] = updatedTabs.splice(draggedIndex, 1);
    updatedTabs.splice(targetIndex, 0, removed);
    setOpenTabs(updatedTabs);
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const [tabFilters, setTabFilters] = useState<Record<string, string[]>>(() => {
    const defaults = {
      id: [],
      name: [],
      country: [],
      ttl: [],
      status: []
    };
    if (initialState?.tabFilters) {
      return {
        ...defaults,
        ...initialState.tabFilters
      };
    }
    return defaults;
  });
  const [openTabFilter, setOpenTabFilter] = useState<string | null>(null);
  const [tabSortConfig, setTabSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>(
    initialState?.tabSortConfig || { key: '', direction: null }
  );

  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    onStateChange?.({
      openTabs,
      activeTabId,
      tabSearchTerm,
      selectedSlice,
      tabFilters,
      tabSortConfig
    });
  }, [openTabs, activeTabId, tabSearchTerm, selectedSlice, tabFilters, tabSortConfig, onStateChange]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openTabFilter && !(e.target as Element).closest('.tab-filter-dropdown')) {
        setOpenTabFilter(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openTabFilter]);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setTabFilters({
      id: [],
      name: [],
      country: [],
      ttl: [],
      status: []
    });
    setTabSortConfig({ key: '', direction: null });
    setOpenTabFilter(null);
  }, [activeTabId]);

  const isSelected = (status: string) => selectedSlice === status;
  const getOpacity = (status: string, isInsideTab: boolean) => {
    if (!isInsideTab) return "1";
    if (!selectedSlice) return "1";
    return isSelected(status) ? "1" : "0.3";
  };

  const handleSliceClick = (status: string, isInsideTab: boolean) => {
    if (!isInsideTab) return;
    if (selectedSlice === status) {
      setSelectedSlice(null);
    } else {
      setSelectedSlice(status);
    }
  };

  const renderLegendItem = (color: string, label: string, statusKey: string, isInsideTab: boolean) => {
    const isFiltered = selectedSlice === statusKey;
    const hasFilter = selectedSlice !== null;
    
    return (
      <div 
        onClick={() => handleSliceClick(statusKey, isInsideTab)}
        className={`flex items-center gap-2 py-1 px-2.5 rounded-lg transition-all ${
          isInsideTab 
            ? `cursor-pointer ${
                isFiltered 
                  ? 'bg-zinc-200/90 font-extrabold border border-zinc-300 shadow-sm' 
                  : hasFilter 
                    ? 'opacity-40 hover:opacity-80 hover:bg-zinc-100/30' 
                    : 'hover:bg-zinc-100/50'
              }`
            : ''
        }`}
      >
        <div className="w-3 h-3 rounded-sm shrink-0 shadow-sm font-sans" style={{ backgroundColor: color }} />
        <span className={`text-[11px] truncate font-sans ${isFiltered ? 'text-zinc-950 font-extrabold' : 'text-zinc-700 font-semibold'}`}>
          {label}
        </span>
      </div>
    );
  };

  // Render Indicator Donut dynamically based on real Google Sheets data (alerts_summary)
  const renderIndicatorDonut = (cardNumber: number, isInsideTab: boolean = false) => {
    const details = getCardDetails(cardNumber, gasData, projects);
    const slices = getCardSlices(cardNumber, gasData, details.projects);
    const projectsCount = slices.reduce((sum, s) => sum + s.count, 0);

    let donutChart: React.ReactNode = null;

    if (projectsCount === 0) {
      donutChart = (
        <div className="relative w-[172px] h-[172px] flex items-center justify-center">
          <svg width="172" height="172" className="transform -rotate-90">
            <circle 
              cx="86" 
              cy="86" 
              r="58" 
              fill="none" 
              stroke="#e4e4e7" 
              strokeWidth={29} 
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 rounded-full bg-[#4EA72E] flex items-center justify-center shadow-sm">
              <Check className="w-5 h-5 text-white stroke-[3.5]" />
            </div>
          </div>
        </div>
      );
    } else {
      const activeSlices = slices.filter(s => s.count > 0);

      if (activeSlices.length === 1) {
        const slice = activeSlices[0];
        const labelPos = polarToCartesian(86, 86, 58, 90);
        donutChart = (
          <svg width="172" height="172" className="transform -rotate-90">
            <circle 
              cx="86" 
              cy="86" 
              r="58" 
              fill="none" 
              stroke={slice.color} 
              strokeWidth={isSelected(slice.key) ? 35 : 29} 
              opacity={getOpacity(slice.key, isInsideTab)}
              onClick={() => handleSliceClick(slice.key, isInsideTab)}
              className={isInsideTab ? "cursor-pointer transition-all duration-200 hover:scale-[1.02] origin-center" : ""}
            />
            <text 
              x={labelPos.x} 
              y={labelPos.y} 
              transform={`rotate(90, ${labelPos.x}, ${labelPos.y})`} 
              fill="#ffffff" 
              fontSize="14" 
              fontWeight="bold" 
              textAnchor="middle" 
              dominantBaseline="central" 
              style={{ pointerEvents: 'none' }}
            >
              {slice.count}
            </text>
          </svg>
        );
      } else {
        let currentAngle = 0;
        donutChart = (
          <svg width="172" height="172" className="transform -rotate-90">
            {activeSlices.map((slice) => {
              const sliceAngle = (slice.count / projectsCount) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + sliceAngle;
              const midAngle = startAngle + (sliceAngle / 2);
              currentAngle = endAngle;

              const arcPath = describeArc(86, 86, 58, startAngle, Math.min(359.99, endAngle - 0.05));
              const labelPos = polarToCartesian(86, 86, 58, midAngle);

              return (
                <g key={slice.key}>
                  <path 
                    d={arcPath} 
                    fill="none" 
                    stroke={slice.color} 
                    strokeWidth={isSelected(slice.key) ? 35 : 29} 
                    opacity={getOpacity(slice.key, isInsideTab)}
                    onClick={() => handleSliceClick(slice.key, isInsideTab)}
                    className={isInsideTab ? "cursor-pointer transition-all duration-200 hover:scale-[1.02] origin-center" : ""}
                    strokeLinecap="butt" 
                  />
                  {slice.count > 0 && (
                    <text 
                      x={labelPos.x} 
                      y={labelPos.y} 
                      transform={`rotate(90, ${labelPos.x}, ${labelPos.y})`} 
                      fill="#ffffff" 
                      fontSize="14" 
                      fontWeight="bold" 
                      textAnchor="middle" 
                      dominantBaseline="central" 
                      style={{ pointerEvents: 'none' }}
                    >
                      {slice.count}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        );
      }
    }

    // Always render legends for all 3 official color tags (Verde, Amarillo, Rojo) even if count is 0
    const legends = (
      <div className="space-y-1 w-full">
        {slices.map(slice => (
          <React.Fragment key={slice.key}>
            {renderLegendItem(slice.color, slice.label, slice.key, isInsideTab)}
          </React.Fragment>
        ))}
      </div>
    );

    if (isInsideTab) {
      return (
        <div className="w-full flex flex-col items-center">
          <p className="text-zinc-800 font-bold text-sm md:text-base mt-2 mb-4 text-center font-sans">
            Total Projects in indicator: {projectsCount}
          </p>
          <div className="w-[172px] h-[172px] flex items-center justify-center mb-6 relative">
            {donutChart}
          </div>
          
          <div className="w-full space-y-1 text-zinc-700 text-xs self-start px-2 mt-auto">
            {legends}
          </div>
        </div>
      );
    }

    return (
      <>
        <p className="text-zinc-800 font-bold text-sm md:text-base mt-2 mb-4 text-center">
          Total Projects in indicator: {projectsCount}
        </p>

        <div className="w-[172px] h-[172px] flex items-center justify-center mb-6 relative">
          {donutChart}
        </div>

        {/* Legend */}
        <div className="w-full space-y-1 text-zinc-700 text-xs self-start px-2 mt-auto">
          {legends}
        </div>
      </>
    );
  };

  // Tab functions
  const openAlertTab = (number: number, title: string) => {
    const tabId = `card-${number}`;
    if (!openTabs.some(t => t.id === tabId)) {
      setOpenTabs([...openTabs, { id: tabId, number, title }]);
    }
    setActiveTabId(tabId);
    setTabSearchTerm('');
    setSelectedSlice(null);
  };

  const closeTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (tabId === 'overview') return;
    
    const targetIndex = openTabs.findIndex(t => t.id === tabId);
    const updatedTabs = openTabs.filter(t => t.id !== tabId);
    setOpenTabs(updatedTabs);
    
    if (activeTabId === tabId) {
      const nextTab = updatedTabs[targetIndex - 1] || updatedTabs[0];
      setActiveTabId(nextTab.id);
      setTabSearchTerm('');
      setSelectedSlice(null);
    }
  };

  const activeTabDetails = useMemo(() => {
    if (activeTabId === 'overview') return null;
    const num = parseInt(activeTabId.replace('card-', ''), 10);
    return getCardDetails(num, gasData, projects);
  }, [activeTabId, gasData, projects]);

  const uniqueTabIds = useMemo(() => {
    if (!activeTabDetails) return [];
    return Array.from(new Set(activeTabDetails.projects.map(p => p.id))).filter(Boolean).sort();
  }, [activeTabDetails]);

  const uniqueTabNames = useMemo(() => {
    if (!activeTabDetails) return [];
    return Array.from(new Set(activeTabDetails.projects.map(p => p.name))).filter(Boolean).sort();
  }, [activeTabDetails]);

  const uniqueTabCountries = useMemo(() => {
    if (!activeTabDetails) return [];
    return Array.from(new Set(activeTabDetails.projects.map(p => p.country))).filter(Boolean).sort();
  }, [activeTabDetails]);

  const uniqueTabTTLs = useMemo(() => {
    if (!activeTabDetails) return [];
    return Array.from(new Set(activeTabDetails.projects.map(p => p.ttl))).filter(Boolean).sort();
  }, [activeTabDetails]);

  const uniqueTabStatusChoices = useMemo(() => {
    if (!activeTabDetails) return [];
    return Array.from(new Set(activeTabDetails.projects.map(p => p.status_of_indicator))).filter(Boolean).sort();
  }, [activeTabDetails]);

  const handleTabSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (tabSortConfig.key === key && tabSortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (tabSortConfig.key === key && tabSortConfig.direction === 'desc') {
      direction = null;
    }
    setTabSortConfig({ key, direction });
  };

  const toggleTabFilter = (column: string, value: string) => {
    setTabFilters(prev => {
      const current = prev[column] || [];
      if (current.includes(value)) {
        return { ...prev, [column]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [column]: [...current, value] };
      }
    });
  };

  const filteredTabProjects = useMemo(() => {
    if (!activeTabDetails) return [];
    const cardNum = parseInt(activeTabId.replace('card-', ''), 10);
    const slices = getCardSlices(cardNum, gasData, activeTabDetails.projects);

    return activeTabDetails.projects.filter(p => {
      const matchesSearch = 
        p.id.toLowerCase().includes(tabSearchTerm.toLowerCase()) ||
        p.name.toLowerCase().includes(tabSearchTerm.toLowerCase()) ||
        p.country.toLowerCase().includes(tabSearchTerm.toLowerCase()) ||
        p.ttl.toLowerCase().includes(tabSearchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Slice click donut filter
      if (selectedSlice) {
        const slice = slices.find(s => s.key === selectedSlice || s.label === selectedSlice);
        if (slice) {
          if (!slice.match(p.status_of_indicator, p.id)) return false;
        } else {
          if (p.status_of_indicator !== selectedSlice) return false;
        }
      }

      // Dropdown checkbox filters
      const matchesIdField = tabFilters.id.length === 0 || tabFilters.id.includes(p.id);
      const matchesNameField = tabFilters.name.length === 0 || tabFilters.name.includes(p.name);
      const matchesCountryField = tabFilters.country.length === 0 || tabFilters.country.includes(p.country);
      const matchesTtlField = tabFilters.ttl.length === 0 || tabFilters.ttl.includes(p.ttl);

      const indicatorValue = p.status_of_indicator || '';
      const matchesStatusField = tabFilters.status.length === 0 || tabFilters.status.includes(indicatorValue);

      return matchesIdField && matchesNameField && matchesCountryField && matchesTtlField && matchesStatusField;
    }).sort((a, b) => {
      if (!tabSortConfig.key || !tabSortConfig.direction) return 0;
      
      let aVal: any = '';
      let bVal: any = '';
      
      if (tabSortConfig.key === 'id') {
        aVal = a.id;
        bVal = b.id;
      } else if (tabSortConfig.key === 'name') {
        aVal = a.name;
        bVal = b.name;
      } else if (tabSortConfig.key === 'country') {
        aVal = a.country;
        bVal = b.country;
      } else if (tabSortConfig.key === 'ttl') {
        aVal = a.ttl;
        bVal = b.ttl;
      } else if (tabSortConfig.key === 'investment') {
        const parseValue = (str: string) => {
          const num = parseFloat(str.replace(/[^0-9.]/g, ''));
          return isNaN(num) ? 0 : num;
        };
        aVal = parseValue(a.metadata?.investmentAmount || '');
        bVal = parseValue(b.metadata?.investmentAmount || '');
      } else if (tabSortConfig.key === 'status') {
        aVal = a.status_of_indicator || '';
        bVal = b.status_of_indicator || '';
      }

      const order = tabSortConfig.direction === 'asc' ? 1 : -1;
      if (aVal < bVal) return -1 * order;
      if (aVal > bVal) return 1 * order;
      return 0;
    });
  }, [activeTabDetails, activeTabId, tabSearchTerm, selectedSlice, tabFilters, tabSortConfig, gasData]);

  const renderTabColumnHeader = (columnKey: string, label: string | React.ReactNode, options: string[], sortable: boolean = true, minWidth?: string) => {
    const isFiltered = tabFilters[columnKey]?.length > 0;
    return (
      <th 
        className={`px-3 py-3 text-center relative font-bold text-[10px] text-zinc-900 uppercase tracking-wider border-b border-zinc-200 ${minWidth ? minWidth : ''}`}
      >
        <div className="flex items-center justify-center gap-1.5 font-sans">
          <span className="leading-tight">{label}</span>
          <div className="flex items-center gap-0.5">
            {sortable && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabSort(columnKey);
                }}
                className={`p-1 rounded hover:bg-zinc-200 transition-colors ${tabSortConfig.key === columnKey ? 'text-[#005173]' : 'text-zinc-600'}`}
                title="Sort"
              >
                <ChevronsUpDown className="w-3" style={{ height: '12px', width: '12px' }} />
              </button>
            )}
            
            {options.length > 0 && (
              <div className="relative tab-filter-dropdown inline-block">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenTabFilter(openTabFilter === columnKey ? null : columnKey);
                  }}
                  className={`p-1 rounded hover:bg-zinc-200 transition-colors ${isFiltered ? 'text-[#005173]' : 'text-zinc-650'}`}
                  title="Filter"
                >
                  <Filter className="w-3 h-3" />
                </button>
                
                {openTabFilter === columnKey && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 bg-white border border-zinc-200 rounded-md shadow-lg z-50 max-h-60 flex flex-col font-normal normal-case">
                    <div className="p-2 border-b border-zinc-100 bg-white text-left">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setTabFilters(prev => ({ ...prev, [columnKey]: [] }));
                        }}
                        className="text-xs text-[#005173] hover:underline w-full text-left font-medium"
                      >
                        Clear filters
                      </button>
                    </div>
                    <div className="p-2 flex flex-col gap-1 overflow-y-auto text-left">
                      {options.map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer hover:bg-zinc-50 p-1.5 rounded">
                          <input 
                            type="checkbox" 
                            checked={tabFilters[columnKey]?.includes(opt) || false}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleTabFilter(columnKey, opt);
                            }}
                            className="rounded border-zinc-300 text-[#005173] focus:ring-[#005173]"
                          />
                          <span className="truncate">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </th>
    );
  };

  return (
    <div className="w-full">
      {/* Header section with entrance animation */}
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="space-y-4"
      >
        {/* Back button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 font-medium transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> {backLabel || "Back to Execution"}
        </button>

        {/* Header with strictly black font color */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
          <div>
            <h1 
              className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900" 
              style={{ color: 'black' }}
            >
              Alerts
            </h1>
            <p className="text-zinc-500 font-medium text-sm mt-1">
              This section shows key warning indicators before and during the execution phase.
            </p>
          </div>
          {gasData.data_as_of_long && (
            <span className="text-[11px] sm:text-[12px] font-bold text-zinc-500 uppercase tracking-wider">
              {gasData.data_as_of_long.toUpperCase()}
            </span>
          )}
        </div>
      </motion.div>

      {/* Main Tabs Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="space-y-8 mt-8 w-full"
      >
        {/* Tab Navigation Menu */}
        <div className="flex border-b border-zinc-200/85 overflow-x-auto pb-px gap-1.5 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
          {openTabs.map((tab, index) => {
            const isActive = activeTabId === tab.id;
            const isDraggingThis = draggedIndex === index;
            const isDragOverThis = dragOverIndex === index;
            return (
              <div
                key={tab.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => {
                  setActiveTabId(tab.id);
                  setTabSearchTerm('');
                  setSelectedSlice(null);
                }}
                className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-t-xl transition-all border-t border-x text-xs font-bold uppercase tracking-wider whitespace-nowrap select-none ${
                  isActive
                    ? 'bg-white text-[#005173] border-zinc-200 border-b-white z-10 font-extrabold shadow-sm'
                    : 'bg-zinc-50/75 border-transparent text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100/50'
                } ${isDraggingThis ? 'opacity-40 bg-zinc-200/50 border-dashed border-zinc-300' : 'cursor-grab active:cursor-grabbing'} ${
                  isDragOverThis && !isDraggingThis ? 'border-l-4 border-l-[#005173] bg-zinc-100' : ''
                }`}
              >
                {tab.number > 0 && (
                  <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black shrink-0 ${
                    isActive ? 'bg-[#005173] text-white' : 'bg-zinc-200 text-zinc-500'
                  }`}>
                    {tab.number}
                  </span>
                )}
                <span>{tab.title}</span>
                {tab.id !== 'overview' && (
                  <button
                    onClick={(e) => closeTab(e, tab.id)}
                    className="ml-1 p-0.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-800 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {activeTabId === 'overview' ? (
          <>
            {/* Subtitle 1: Alerts before the execution */}
            <div className="mt-4 mb-10">
              <h2 className="text-lg md:text-xl font-extrabold text-zinc-900 tracking-tight" style={{ color: 'black' }}>
                Alerts before the execution
              </h2>
            </div>

            {/* Metrics Cards: Dynamic & High Fidelity Footnote Indicators (Grid 1) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 mt-4 font-sans">
              
              {/* Card 1: Pending legal effectiveness */}
              <div 
                onClick={() => openAlertTab(1, "Pending legal effectiveness")}
                className="relative bg-[#fafafa] pt-12 pb-6 px-5 rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col items-center cursor-pointer hover:shadow-md hover:border-zinc-300 hover:bg-white transition-all transform hover:-translate-y-0.5 group w-full"
              >
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[90%] bg-[#005173] text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 shadow-md border border-[#003d57]">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#005173] font-black text-xs shrink-0 shadow-sm">
                    1
                  </div>
                  <span className="font-extrabold text-xs md:text-sm tracking-tight text-center">Pending legal effectiveness</span>
                </div>
                {renderIndicatorDonut(1)}
              </div>

              {/* Card 2: Pending eligibility */}
              <div 
                onClick={() => openAlertTab(2, "Pending eligibility")}
                className="relative bg-[#fafafa] pt-12 pb-6 px-5 rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col items-center cursor-pointer hover:shadow-md hover:border-zinc-300 hover:bg-white transition-all transform hover:-translate-y-0.5 group w-full"
              >
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[90%] bg-[#005173] text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md border border-[#003d57]">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#005173] font-black text-xs shrink-0 shadow-sm">
                    2
                  </div>
                  <span className="font-extrabold text-xs md:text-sm tracking-tight text-center">Pending eligibility</span>
                </div>
                {renderIndicatorDonut(2)}
              </div>

              {/* Card 3: Pending first disbursement */}
              <div 
                onClick={() => openAlertTab(3, "Pending first disbursement")}
                className="relative bg-[#fafafa] pt-12 pb-6 px-5 rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col items-center cursor-pointer hover:shadow-md hover:border-zinc-300 hover:bg-white transition-all transform hover:-translate-y-0.5 group w-full"
              >
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[90%] bg-[#005173] text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md border border-[#003d57]">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#005173] font-black text-xs shrink-0 shadow-sm">
                    3
                  </div>
                  <span className="font-extrabold text-xs md:text-sm tracking-tight text-center">Pending first disbursement</span>
                </div>
                {renderIndicatorDonut(3)}
              </div>

            </div>

            {/* Subtitle 2: Alerts during execution */}
            <div className="mt-6 mb-10">
              <h2 className="text-lg md:text-xl font-extrabold text-zinc-900 tracking-tight" style={{ color: 'black' }}>
                Alerts during execution
              </h2>
            </div>

            {/* Metrics Cards: Dynamic & High Fidelity Footnote Indicators (Grid 2) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 mt-4 font-sans">

              {/* Card 4: Projects without disbursements */}
              <div 
                onClick={() => openAlertTab(4, "Projects without disbursements")}
                className="relative bg-[#fafafa] pt-12 pb-6 px-5 rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col items-center cursor-pointer hover:shadow-md hover:border-zinc-300 hover:bg-white transition-all transform hover:-translate-y-0.5 group w-full"
              >
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[90%] bg-[#005173] text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 shadow-md border border-[#003d57]">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#005173] font-black text-xs shrink-0 shadow-sm">
                    4
                  </div>
                  <span className="font-extrabold text-xs md:text-sm tracking-tight text-center">Projects without disbursements</span>
                </div>
                {renderIndicatorDonut(4)}
              </div>

              {/* Card 5: Disbursed life amount */}
              <div 
                onClick={() => openAlertTab(5, "Disbursed life amount")}
                className="relative bg-[#fafafa] pt-12 pb-6 px-5 rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col items-center cursor-pointer hover:shadow-md hover:border-zinc-300 hover:bg-white transition-all transform hover:-translate-y-0.5 group w-full"
              >
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[90%] bg-[#005173] text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 shadow-md border border-[#003d57]">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#005173] font-black text-xs shrink-0 shadow-sm">
                    5
                  </div>
                  <span className="font-extrabold text-xs md:text-sm tracking-tight text-center">Disbursed life amount</span>
                </div>
                {renderIndicatorDonut(5)}
              </div>

              {/* Card 6: PMR performance (last 3 cycles) */}
              <div 
                onClick={() => openAlertTab(6, "PMR performance (last 3 cycles)")}
                className="relative bg-[#fafafa] pt-12 pb-6 px-5 rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col items-center cursor-pointer hover:shadow-md hover:border-zinc-300 hover:bg-white transition-all transform hover:-translate-y-0.5 group w-full"
              >
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[90%] bg-[#005173] text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 shadow-md border border-[#003d57]">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#005173] font-black text-xs shrink-0 shadow-sm">
                    6
                  </div>
                  <span className="font-extrabold text-xs md:text-sm tracking-tight text-center">PMR performance (last 3 cycles)</span>
                </div>
                {renderIndicatorDonut(6)}
              </div>

              {/* Card 7: Partial cancellations */}
              <div 
                onClick={() => openAlertTab(7, "Partial cancellations")}
                className="relative bg-[#fafafa] pt-12 pb-6 px-5 rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col items-center cursor-pointer hover:shadow-md hover:border-zinc-300 hover:bg-white transition-all transform hover:-translate-y-0.5 group w-full"
              >
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[90%] bg-[#005173] text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 shadow-md border border-[#003d57]">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#005173] font-black text-xs shrink-0 shadow-sm">
                    7
                  </div>
                  <span className="font-extrabold text-xs md:text-sm tracking-tight text-center">Partial cancellations</span>
                </div>
                {renderIndicatorDonut(7)}
              </div>

              {/* Card 8: Expired disbursement deadline */}
              <div 
                onClick={() => openAlertTab(8, "Expired disbursement deadline")}
                className="relative bg-[#fafafa] pt-12 pb-6 px-5 rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col items-center cursor-pointer hover:shadow-md hover:border-zinc-300 hover:bg-white transition-all transform hover:-translate-y-0.5 group w-full"
              >
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[90%] bg-[#005173] text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 shadow-md border border-[#003d57]">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#005173] font-black text-xs shrink-0 shadow-sm">
                    8
                  </div>
                  <span className="font-extrabold text-xs md:text-sm tracking-tight text-center">Expired disbursement deadline</span>
                </div>
                {renderIndicatorDonut(8)}
              </div>

            </div>
          </>
        ) : activeTabDetails ? (
          /* Detail Tab Content */
          <div className="space-y-6 animate-fadeIn">
            {/* Active Indicator Header Box */}
            <div className="flex items-center justify-start pt-1">
              <div className="inline-flex items-center gap-3 bg-[#005173] text-white py-2 px-4 rounded-lg shadow-sm border border-[#003d57]">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#005173] font-bold text-xs shrink-0 shadow-xs">
                  {parseInt(activeTabId.replace('card-', ''), 10)}
                </div>
                <span className="font-bold text-sm tracking-tight">
                  {openTabs.find(t => t.id === activeTabId)?.title || `Alert ${activeTabId.replace('card-', '')}`}
                </span>
              </div>
            </div>

            {/* Indicator Definition Card */}
            <div className="p-4 bg-zinc-50/70 border border-zinc-200/80 rounded-xl text-zinc-700 text-xs md:text-sm leading-relaxed">
              <span className="font-bold text-[#005173] block mb-1 uppercase tracking-wider text-[11px]">INDICATOR DEFINITION:</span>
              <p className="text-zinc-700 text-xs md:text-sm leading-relaxed">{activeTabDetails.description}</p>
            </div>

            {/* Split Grid: Donut Filter on Left, Project Dashboard on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Donut Card Filter */}
              <div className="lg:col-span-4 bg-[#fafafa] p-6 rounded-2xl border border-zinc-200/90 shadow-sm flex flex-col items-center animate-fadeIn">
                {renderIndicatorDonut(parseInt(activeTabId.replace('card-', ''), 10), true)}
              </div>

              {/* Right Column: Project Dashboard */}
              <div className="lg:col-span-8 space-y-4">
                {/* Project Search Bar */}
                <div className="flex flex-col gap-1 w-full max-w-sm">
                  <label className="text-[#002148] font-bold text-[13px] tracking-tight">PROJECT</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Search project name or ID..." 
                      value={tabSearchTerm}
                      onChange={(e) => setTabSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#005173] font-normal placeholder:text-zinc-400 shadow-sm"
                    />
                  </div>
                </div>
                
                {/* High-Fidelity Table */}
                <div className="bg-white rounded-none sm:rounded-xl shadow-sm border-y sm:border border-zinc-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-full text-left border-collapse border-spacing-0" style={{ boxSizing: 'border-box', width: '100%' }}>
                      <thead>
                        <tr className="bg-zinc-100 border-b-2 border-zinc-200 text-[10px] font-bold text-zinc-900 uppercase tracking-wider">
                          {renderTabColumnHeader('index', 'N', [], false, 'w-8')}
                          {renderTabColumnHeader('id', <span>PROJECT<br/>ID</span>, uniqueTabIds, true, 'min-w-[80px]')}
                          {renderTabColumnHeader('name', <span>PROJECT<br/>NAME</span>, uniqueTabNames, true, 'min-w-[124px] max-w-[150px]')}
                          {renderTabColumnHeader('country', 'Country', uniqueTabCountries, true)}
                          {renderTabColumnHeader('ttl', 'TTL', uniqueTabTTLs, true, 'min-w-[100px] max-w-[120px]')}
                          {renderTabColumnHeader('investment', <span>Current Approved<br/>Amount<br/>($M)</span>, [], true, 'min-w-[90px]')}
                          {renderTabColumnHeader('status', <span>Status of<br/>indicator</span>, uniqueTabStatusChoices, true)}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50 text-sm">
                        {filteredTabProjects.length > 0 ? (
                          filteredTabProjects.map((project, index) => {
                            const customValue = project.status_of_indicator || '';
                            const customColorClass = project.status_of_indicatorColor || 'bg-zinc-100/80 text-zinc-800';

                            return (
                              <tr 
                                key={`${project.id}-${index}`}
                                className="hover:bg-zinc-50 transition-colors cursor-pointer group font-sans text-sm"
                                onClick={() => onSelectProject?.(project.id)}
                              >
                                <td className="px-2 py-3 text-center text-zinc-400 font-medium text-[10px]">
                                  {index + 1}
                                </td>
                                <td className="px-2 py-3 text-left text-zinc-500 text-[10px] font-semibold whitespace-nowrap">
                                  {project.id}
                                </td>
                                <td className="px-2 py-3">
                                  <div className="text-black font-semibold text-[11px] leading-tight whitespace-normal break-words">
                                    {project.name}
                                  </div>
                                </td>
                                <td className="px-2 py-3 text-left">
                                  <div className="flex items-center justify-start gap-3">
                                    {countryCodes[project.country] ? (
                                      <img 
                                        src={`https://flagcdn.com/w40/${countryCodes[project.country]}.png`} 
                                        alt={project.country}
                                        className="w-4 h-auto shadow-sm border border-zinc-100"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <span className="text-lg">🏳️</span>
                                    )}
                                    <span className="text-zinc-500 text-[10px] font-medium">{project.country}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-3 max-w-[100px] w-[100px] whitespace-normal break-words text-left text-zinc-500 text-[10px] font-medium">
                                  {project.ttl.includes(',') ? (
                                    <div className="flex flex-col items-start justify-start text-left">
                                      <span>{project.ttl.split(',')[0]},</span>
                                      <span>{project.ttl.split(',').slice(1).join(',').trim()}</span>
                                    </div>
                                  ) : (
                                    project.ttl
                                  )}
                                </td>
                                <td className="px-2 py-3 text-center text-zinc-500 text-[10px] font-bold whitespace-nowrap">
                                  {project.metadata?.investmentAmount || 'N/A'}
                                </td>
                                <td className="px-2 py-3 text-left">
                                  <div className="flex items-start justify-start gap-2 max-w-[180px] whitespace-normal break-words">
                                    <div 
                                      className="w-3 h-3 rounded-sm shrink-0 shadow-sm mt-0.5" 
                                      style={{ backgroundColor: getIndicatorBoxColor(customColorClass) }} 
                                    />
                                    <span className="text-[11px] text-zinc-700 font-normal leading-tight">
                                      {customValue}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 font-medium">
                              {activeTabId === 'card-3' || activeTabDetails.projects.length === 0 ? 'No projects with this alert.' : 'No projects matched the search criteria or selected filter category.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
