import React, { useState, useMemo, useEffect } from 'react';
import { initialProjects } from './data';
import { Project, User, UserRole } from './types';
import Dashboard from './components/Dashboard';
import ProjectView from './components/ProjectView';
import Landing from './components/Landing';
import ProjectSelector from './components/ProjectSelector';
import PortfolioLanding from './components/PortfolioLanding';
import QualitativeProcess from './components/QualitativeProcess';
import Alerts from './components/Alerts';
import MidTermEvaluations from './components/MidTermEvaluations';
import ClosureTable from './components/ClosureTable';
import { User as UserIcon, LogOut, Home, ClipboardCheck, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePortfolioData } from './hooks/usePortfolioData';
import { QUALITATIVE_METADATA_MAP } from './data/qualitativeMetadata';
import Login from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useGASPortfolioData } from './hooks/useGASPortfolioData';

type MainTab = 'PORTFOLIO' | 'DESIGN' | 'EXECUTION' | 'CLOSURE';

const MAIN_TAB_CONFIG: Record<MainTab, {
  label: string;
  activeClass: string;
  inactiveClass: string;
}> = {
  PORTFOLIO: {
    label: 'PORTFOLIO',
    activeClass: 'bg-[#f1f3f5] text-zinc-900 font-medium shadow-none',
    inactiveClass: 'text-[#556987] hover:text-zinc-900 font-medium bg-transparent',
  },
  DESIGN: {
    label: 'DESIGN',
    activeClass: 'bg-[#f1f3f5] text-zinc-900 font-medium shadow-none',
    inactiveClass: 'text-[#556987] hover:text-zinc-900 font-medium bg-transparent',
  },
  EXECUTION: {
    label: 'EXECUTION',
    activeClass: 'bg-[#f1f3f5] text-zinc-900 font-medium shadow-none',
    inactiveClass: 'text-[#556987] hover:text-zinc-900 font-medium bg-transparent',
  },
  CLOSURE: {
    label: 'CLOSURE',
    activeClass: 'bg-[#f1f3f5] text-zinc-900 font-medium shadow-none',
    inactiveClass: 'text-[#556987] hover:text-zinc-900 font-medium bg-transparent',
  },
};
type ExecutionView = 'landing' | 'portfolio' | 'project-selector' | 'project-view' | 'qualitative-process' | 'alerts' | 'mid-term-evaluations' | 'critical-procurement';

function MainApp() {
  const { user, activeRole, setActiveRole, isLoggedIn, logout } = useAuth();
  const { tableData, metrics } = usePortfolioData();
  const gasData = useGASPortfolioData();
  const [mainTab, setMainTab] = useState<MainTab>('PORTFOLIO');
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [executionView, setExecutionView] = useState<ExecutionView>('landing');
  const [portfolioFilter, setPortfolioFilter] = useState<'INV' | 'PBL' | null>(null);
  const [isPmrMode, setIsPmrMode] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectSourceView, setProjectSourceView] = useState<'portfolio' | 'alerts' | 'project-view' | 'mid-term-evaluations' | 'critical-procurement'>('portfolio');
  const [previousSourceView, setPreviousSourceView] = useState<'portfolio' | 'alerts' | 'mid-term-evaluations' | 'critical-procurement'>('portfolio');
  const [alertsState, setAlertsState] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Derive currentUser object compatible with all child components
  const currentUser: User = useMemo(() => {
    if (!user) {
      return { id: 'fmm', name: 'FMM Team', email: 'fmm@iadb.org', role: 'GENERAL_FMM' };
    }
    return {
      id: user.username,
      name: user.name,
      email: user.email,
      role: activeRole,
      username: user.username,
      ttlName: user.ttlName,
      isDualRole: user.isDualRole,
      allowedRoles: user.allowedRoles
    };
  }, [user, activeRole]);

  // Initialize projects from tableData or gasData if not already initialized with more than mock data
  useEffect(() => {
    if (tableData.length > 0 && projects.length <= 1) {
      const mappedProjects: Project[] = tableData.map(row => ({
        index: row.index,
        id: row.projectNumber,
        operationNumber: row.operationNumber,
        name: row.title,
        country: row.countryName,
        countryCode: row.countryCode,
        countryName: row.countryName,
        ttl: row.ttl,
        status: row.status,
        isPrefilledByTeam: (row as any).isPrefilledByTeam !== undefined 
          ? (row as any).isPrefilledByTeam 
          : ((row.projectNumber === 'BR-L1642' || row.projectNumber === 'HO-L1261') ? false : true),
        validatedByTTLDate: (row as any).validatedByTTLDate !== undefined ? (row as any).validatedByTTLDate : null,
        qualitativeData: {
          estadoImplementacion: (row as any).qualitativeData?.estadoImplementacion || QUALITATIVE_METADATA_MAP[row.projectNumber]?.estadoImplementacion || [],
          productosDestacados: (row as any).qualitativeData?.productosDestacados || QUALITATIVE_METADATA_MAP[row.projectNumber]?.productosDestacados || [],
          probabilidadObjetivos: (row as any).qualitativeData?.probabilidadObjetivos || QUALITATIVE_METADATA_MAP[row.projectNumber]?.probabilidadObjetivos || [],
          accionesSugeridas: (row as any).qualitativeData?.accionesSugeridas || QUALITATIVE_METADATA_MAP[row.projectNumber]?.accionesSugeridas || [],
          fechaEvaluacionIntermedia: QUALITATIVE_METADATA_MAP[row.projectNumber]?.fechaEvaluacionIntermedia || '',
          fechaTalleresArranque: QUALITATIVE_METADATA_MAP[row.projectNumber]?.fechaTalleresArranque || '',
          temasCriticosSimulador: QUALITATIVE_METADATA_MAP[row.projectNumber]?.temasCriticosSimulador || '',
          verificadorContenidos: QUALITATIVE_METADATA_MAP[row.projectNumber]?.verificadorContenidos || '',
        },
        metadata: {
          investmentAmount: `$${row.currentApprovedAmount.toFixed(1)}M`,
          disbursementPercent: row.disbursedLifePercent,
          elapsedYears: 0,
          siScore: 0,
          pmr2026: {
            status: (row.pmrClassification === 'Satisfactory' || row.pmrClassification === 'Alert' || row.pmrClassification === 'Problem' || row.pmrClassification === 'N/A') 
              ? row.pmrClassification 
              : (String(row.pmrClassification || '').toUpperCase() === 'SATISFACTORY' ? 'Satisfactory' : 
                 String(row.pmrClassification || '').toUpperCase() === 'ALERT' ? 'Alert' : 
                 String(row.pmrClassification || '').toUpperCase() === 'PROBLEM' ? 'Problem' : 'N/A'),
            score: 0
          }
        }
      }));
      setProjects(mappedProjects);
    } else if (projects.length <= 1 && gasData.active_portfolio_table && gasData.active_portfolio_table.length > 0) {
      const mappedProjects: Project[] = gasData.active_portfolio_table.map((row, idx) => {
        const approved = Number(row.currentApprovedAmount) || 0;
        const disbursed = Number(row.disbursedLifeAmount) || 0;
        const percent = Number(row.disbursedLifePercent) || (approved > 0 ? (disbursed / approved) * 100 : 0);
        return {
          index: row.N_Index || (idx + 1),
          id: row.projectNumber,
          operationNumber: row.operationNumber || '',
          name: row.title || '',
          country: row.countryName || '',
          countryCode: row.countryCode || '',
          countryName: row.countryName || '',
          ttl: row.ttl || '',
          status: row.stage || row.status || 'Stage II',
          isPrefilledByTeam: ((row.projectNumber === 'BR-L1642' || row.projectNumber === 'HO-L1261') ? false : true),
          validatedByTTLDate: null,
          qualitativeData: {
            estadoImplementacion: QUALITATIVE_METADATA_MAP[row.projectNumber]?.estadoImplementacion || [],
            productosDestacados: QUALITATIVE_METADATA_MAP[row.projectNumber]?.productosDestacados || [],
            probabilidadObjetivos: QUALITATIVE_METADATA_MAP[row.projectNumber]?.probabilidadObjetivos || [],
            accionesSugeridas: QUALITATIVE_METADATA_MAP[row.projectNumber]?.accionesSugeridas || [],
            fechaEvaluacionIntermedia: QUALITATIVE_METADATA_MAP[row.projectNumber]?.fechaEvaluacionIntermedia || '',
            fechaTalleresArranque: QUALITATIVE_METADATA_MAP[row.projectNumber]?.fechaTalleresArranque || '',
            temasCriticosSimulador: QUALITATIVE_METADATA_MAP[row.projectNumber]?.temasCriticosSimulador || '',
            verificadorContenidos: QUALITATIVE_METADATA_MAP[row.projectNumber]?.verificadorContenidos || '',
          },
          metadata: {
            investmentAmount: `$${approved.toFixed(1)}M`,
            disbursementPercent: percent,
            elapsedYears: Number(row.yearsInExecution || 0),
            siScore: 0,
            pmr2026: {
              status: 'Satisfactory',
              score: 0
            }
          }
        };
      });
      setProjects(mappedProjects);
    } else if (tableData.length > 0 && projects.length > 1) {
      // Check if BR-L1642 is missing in projects
      const hasBR1642 = projects.some(p => p.id === 'BR-L1642');
      const brRow = tableData.find(r => r.projectNumber === 'BR-L1642');
      if (!hasBR1642 && brRow) {
        const newProj: Project = {
          index: brRow.index,
          id: brRow.projectNumber,
          operationNumber: brRow.operationNumber,
          name: brRow.title,
          country: brRow.countryName,
          countryCode: brRow.countryCode,
          countryName: brRow.countryName,
          ttl: brRow.ttl,
          status: brRow.status,
          isPrefilledByTeam: false,
          validatedByTTLDate: null,
          qualitativeData: {
            estadoImplementacion: (brRow as any).qualitativeData?.estadoImplementacion || [""],
            productosDestacados: (brRow as any).qualitativeData?.productosDestacados || [""],
            probabilidadObjetivos: (brRow as any).qualitativeData?.probabilidadObjetivos || [""],
            accionesSugeridas: (brRow as any).qualitativeData?.accionesSugeridas || [""],
            fechaEvaluacionIntermedia: '',
            fechaTalleresArranque: '',
            temasCriticosSimulador: '',
            verificadorContenidos: '',
          },
          metadata: {
            investmentAmount: `$${brRow.currentApprovedAmount.toFixed(1)}M`,
            disbursementPercent: brRow.disbursedLifePercent,
            elapsedYears: 0,
            siScore: 0,
            pmr2026: {
              status: 'N/A',
              score: 0
            }
          }
        };

        setProjects(prev => {
          const next = [...prev];
          const idx1643 = next.findIndex(p => p.id === 'BR-L1643');
          if (idx1643 !== -1) {
            next.splice(idx1643, 0, newProj);
          } else {
            const idx1629 = next.findIndex(p => p.id === 'BR-L1629');
            if (idx1629 !== -1) {
              next.splice(idx1629 + 1, 0, newProj);
            } else {
              next.push(newProj);
            }
          }
          return next;
        });
      }

      // Check if HO-L1261 is missing in projects
      const hasHO1261 = projects.some(p => p.id === 'HO-L1261');
      const hoRow = tableData.find(r => r.projectNumber === 'HO-L1261');
      if (!hasHO1261 && hoRow) {
        const newProjHO: Project = {
          index: hoRow.index,
          id: hoRow.projectNumber,
          operationNumber: hoRow.operationNumber,
          name: hoRow.title,
          country: hoRow.countryName,
          countryCode: hoRow.countryCode,
          countryName: hoRow.countryName,
          ttl: hoRow.ttl,
          status: hoRow.status,
          isPrefilledByTeam: false,
          validatedByTTLDate: null,
          qualitativeData: {
            estadoImplementacion: (hoRow as any).qualitativeData?.estadoImplementacion || [""],
            productosDestacados: (hoRow as any).qualitativeData?.productosDestacados || [""],
            probabilidadObjetivos: (hoRow as any).qualitativeData?.probabilidadObjetivos || [""],
            accionesSugeridas: (hoRow as any).qualitativeData?.accionesSugeridas || [""],
            fechaEvaluacionIntermedia: '',
            fechaTalleresArranque: '',
            temasCriticosSimulador: '',
            verificadorContenidos: '',
          },
          metadata: {
            investmentAmount: `$${hoRow.currentApprovedAmount.toFixed(1)}M`,
            disbursementPercent: hoRow.disbursedLifePercent,
            elapsedYears: 0,
            siScore: 0,
            pmr2026: {
              status: 'N/A',
              score: 0
            }
          }
        };

        setProjects(prev => {
          const next = [...prev];
          const idxME = next.findIndex(p => p.id.startsWith('ME-'));
          if (idxME !== -1) {
            next.splice(idxME, 0, newProjHO);
          } else {
            next.push(newProjHO);
          }
          return next;
        });
      }

      // Sync any remote Google Sheets updates from tableData to projects
      setProjects(prev => {
        let changed = false;
        const next = prev.map(p => {
          const row = tableData.find(r => r.projectNumber === p.id);
          if (!row) return p;
          const remotePrefilled = (row as any).isPrefilledByTeam;
          const remoteValidated = (row as any).validatedByTTLDate;
          const remoteQual = (row as any).qualitativeData;
          if (remotePrefilled !== undefined && remotePrefilled !== p.isPrefilledByTeam) {
            changed = true;
            return {
              ...p,
              isPrefilledByTeam: remotePrefilled,
              validatedByTTLDate: remoteValidated !== undefined ? remoteValidated : p.validatedByTTLDate,
              qualitativeData: remoteQual || p.qualitativeData
            };
          }
          if (remoteValidated !== undefined && remoteValidated !== p.validatedByTTLDate) {
            changed = true;
            return {
              ...p,
              validatedByTTLDate: remoteValidated,
              isPrefilledByTeam: remotePrefilled !== undefined ? remotePrefilled : p.isPrefilledByTeam,
              qualitativeData: remoteQual || p.qualitativeData
            };
          }
          return p;
        });
        return changed ? next : prev;
      });
    }
  }, [tableData]);

  // Sync inactive projects from GAS to projects state
  useEffect(() => {
    if (gasData.inactive_pmr_table && gasData.inactive_pmr_table.length > 0) {
      setProjects(prev => {
        let changed = false;
        const next = [...prev];
        gasData.inactive_pmr_table.forEach(inactive => {
          const exists = next.some(p => p.id === inactive.projectNumber);
          if (!exists) {
            changed = true;
            const approved = Number(inactive.currentApprovedAmount) || 0;
            const disbursed = Number(inactive.disbursedLifeAmount) || 0;
            const percent = Number(inactive.disbursedLifePercent) || (approved > 0 ? (disbursed / approved) * 100 : 0);
            next.push({
              index: inactive.N_Index || next.length + 1,
              id: inactive.projectNumber,
              operationNumber: inactive.operationNumber || '',
              name: inactive.title || '',
              country: inactive.countryName || '',
              countryCode: inactive.countryCode || '',
              countryName: inactive.countryName || '',
              ttl: inactive.ttl || '',
              status: inactive.stage || inactive.status || 'Stage III',
              isPrefilledByTeam: false,
              validatedByTTLDate: null,
              qualitativeData: {
                estadoImplementacion: [],
                productosDestacados: [],
                probabilidadObjetivos: [],
                accionesSugeridas: [],
                fechaEvaluacionIntermedia: '',
                fechaTalleresArranque: '',
                temasCriticosSimulador: '',
                verificadorContenidos: '',
              },
              metadata: {
                investmentAmount: `$${approved.toFixed(1)}M`,
                disbursementPercent: percent,
                elapsedYears: Number(inactive.yearsInExecution || 0),
                siScore: 0,
                pmr2026: {
                  status: 'N/A',
                  score: 0
                }
              }
            });
          }
        });
        return changed ? next : prev;
      });
    }
  }, [gasData.inactive_pmr_table]);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [mainTab, executionView, selectedProjectId]);

  const updateProject = (updatedProject: Project) => {
    let finalProject = { ...updatedProject };
    
    // RBAC Rule: If Effectiveness Team saves a validated project, reset validation
    if (activeRole === 'EFFECTIVENESS_TEAM' && updatedProject.validatedByTTLDate) {
      finalProject.validatedByTTLDate = null;
    }
    
    setProjects(projects.map(p => p.id === finalProject.id ? finalProject : p));
  };

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    const target = String(selectedProjectId).trim().toUpperCase();

    // 1. Look up in projects state (by id or operationNumber)
    const found = projects.find(
      p => (p.id && String(p.id).trim().toUpperCase() === target) ||
           (p.operationNumber && String(p.operationNumber).trim().toUpperCase() === target)
    );
    if (found) return found;

    // 2. Look up in tableData
    const tableRow = (tableData || []).find(
      r => (r.projectNumber && String(r.projectNumber).trim().toUpperCase() === target) ||
           (r.operationNumber && String(r.operationNumber).trim().toUpperCase() === target)
    );
    if (tableRow) {
      return {
        index: tableRow.index,
        id: tableRow.projectNumber,
        operationNumber: tableRow.operationNumber,
        name: tableRow.title,
        country: tableRow.countryName,
        countryCode: tableRow.countryCode,
        countryName: tableRow.countryName,
        ttl: tableRow.ttl,
        status: tableRow.status,
        isPrefilledByTeam: (tableRow as any).isPrefilledByTeam !== undefined
          ? (tableRow as any).isPrefilledByTeam
          : ((tableRow.projectNumber === 'BR-L1642' || tableRow.projectNumber === 'HO-L1261') ? false : true),
        validatedByTTLDate: (tableRow as any).validatedByTTLDate || null,
        qualitativeData: {
          estadoImplementacion: (tableRow as any).qualitativeData?.estadoImplementacion || QUALITATIVE_METADATA_MAP[tableRow.projectNumber]?.estadoImplementacion || [],
          productosDestacados: (tableRow as any).qualitativeData?.productosDestacados || QUALITATIVE_METADATA_MAP[tableRow.projectNumber]?.productosDestacados || [],
          probabilidadObjetivos: (tableRow as any).qualitativeData?.probabilidadObjetivos || QUALITATIVE_METADATA_MAP[tableRow.projectNumber]?.probabilidadObjetivos || [],
          accionesSugeridas: (tableRow as any).qualitativeData?.accionesSugeridas || QUALITATIVE_METADATA_MAP[tableRow.projectNumber]?.accionesSugeridas || [],
          fechaEvaluacionIntermedia: QUALITATIVE_METADATA_MAP[tableRow.projectNumber]?.fechaEvaluacionIntermedia || '',
          fechaTalleresArranque: QUALITATIVE_METADATA_MAP[tableRow.projectNumber]?.fechaTalleresArranque || '',
          temasCriticosSimulador: QUALITATIVE_METADATA_MAP[tableRow.projectNumber]?.temasCriticosSimulador || '',
          verificadorContenidos: QUALITATIVE_METADATA_MAP[tableRow.projectNumber]?.verificadorContenidos || '',
        },
        metadata: {
          investmentAmount: `$${tableRow.currentApprovedAmount.toFixed(1)}M`,
          disbursementPercent: tableRow.disbursedLifePercent,
          elapsedYears: 0,
          siScore: 0,
          pmr2026: {
            status: 'Satisfactory',
            score: 0
          }
        }
      } as Project;
    }

    // 3. Look up in gasData.active_portfolio_table
    const activeGas = (gasData.active_portfolio_table || []).find(
      r => (r.projectNumber && String(r.projectNumber).trim().toUpperCase() === target) ||
           (r.operationNumber && String(r.operationNumber).trim().toUpperCase() === target)
    );
    if (activeGas) {
      const approved = Number(activeGas.currentApprovedAmount) || 0;
      const disbursed = Number(activeGas.disbursedLifeAmount) || 0;
      const percent = Number(activeGas.disbursedLifePercent) || (approved > 0 ? (disbursed / approved) * 100 : 0);
      const isPrefilled = (activeGas.projectNumber === 'BR-L1642' || activeGas.projectNumber === 'HO-L1261') ? false : true;
      return {
        index: activeGas.N_Index || 0,
        id: activeGas.projectNumber,
        operationNumber: activeGas.operationNumber || '',
        name: activeGas.title || '',
        country: activeGas.countryName || '',
        countryCode: activeGas.countryCode || '',
        countryName: activeGas.countryName || '',
        ttl: activeGas.ttl || '',
        status: activeGas.stage || activeGas.status || 'Stage II',
        isPrefilledByTeam: isPrefilled,
        validatedByTTLDate: null,
        qualitativeData: {
          estadoImplementacion: QUALITATIVE_METADATA_MAP[activeGas.projectNumber]?.estadoImplementacion || [],
          productosDestacados: QUALITATIVE_METADATA_MAP[activeGas.projectNumber]?.productosDestacados || [],
          probabilidadObjetivos: QUALITATIVE_METADATA_MAP[activeGas.projectNumber]?.probabilidadObjetivos || [],
          accionesSugeridas: QUALITATIVE_METADATA_MAP[activeGas.projectNumber]?.accionesSugeridas || [],
          fechaEvaluacionIntermedia: QUALITATIVE_METADATA_MAP[activeGas.projectNumber]?.fechaEvaluacionIntermedia || '',
          fechaTalleresArranque: QUALITATIVE_METADATA_MAP[activeGas.projectNumber]?.fechaTalleresArranque || '',
          temasCriticosSimulador: QUALITATIVE_METADATA_MAP[activeGas.projectNumber]?.temasCriticosSimulador || '',
          verificadorContenidos: QUALITATIVE_METADATA_MAP[activeGas.projectNumber]?.verificadorContenidos || '',
        },
        metadata: {
          investmentAmount: `$${approved.toFixed(1)}M`,
          disbursementPercent: percent,
          elapsedYears: Number(activeGas.yearsInExecution || 0),
          siScore: 0,
          pmr2026: {
            status: 'Satisfactory',
            score: 0
          }
        }
      } as Project;
    }

    // 4. Look up directly in inactive_pmr_table
    const inactive = (gasData.inactive_pmr_table || []).find(
      r => (r.projectNumber && String(r.projectNumber).trim().toUpperCase() === target) ||
           (r.operationNumber && String(r.operationNumber).trim().toUpperCase() === target)
    );
    if (inactive) {
      const approved = Number(inactive.currentApprovedAmount) || 0;
      const disbursed = Number(inactive.disbursedLifeAmount) || 0;
      const percent = Number(inactive.disbursedLifePercent) || (approved > 0 ? (disbursed / approved) * 100 : 0);
      return {
        index: inactive.N_Index || 0,
        id: inactive.projectNumber,
        operationNumber: inactive.operationNumber || '',
        name: inactive.title || '',
        country: inactive.countryName || '',
        countryCode: inactive.countryCode || '',
        countryName: inactive.countryName || '',
        ttl: inactive.ttl || '',
        status: inactive.stage || inactive.status || 'Stage III',
        isPrefilledByTeam: false,
        validatedByTTLDate: null,
        qualitativeData: {
          estadoImplementacion: QUALITATIVE_METADATA_MAP[inactive.projectNumber]?.estadoImplementacion || [],
          productosDestacados: QUALITATIVE_METADATA_MAP[inactive.projectNumber]?.productosDestacados || [],
          probabilidadObjetivos: QUALITATIVE_METADATA_MAP[inactive.projectNumber]?.probabilidadObjetivos || [],
          accionesSugeridas: QUALITATIVE_METADATA_MAP[inactive.projectNumber]?.accionesSugeridas || [],
          fechaEvaluacionIntermedia: QUALITATIVE_METADATA_MAP[inactive.projectNumber]?.fechaEvaluacionIntermedia || '',
          fechaTalleresArranque: QUALITATIVE_METADATA_MAP[inactive.projectNumber]?.fechaTalleresArranque || '',
          temasCriticosSimulador: QUALITATIVE_METADATA_MAP[inactive.projectNumber]?.temasCriticosSimulador || '',
          verificadorContenidos: QUALITATIVE_METADATA_MAP[inactive.projectNumber]?.verificadorContenidos || '',
        },
        metadata: {
          investmentAmount: `$${approved.toFixed(1)}M`,
          disbursementPercent: percent,
          elapsedYears: Number(inactive.yearsInExecution || 0),
          siScore: 0,
          pmr2026: {
            status: 'N/A',
            score: 0
          }
        }
      } as Project;
    }

    // 5. Ultimate fallback from QUALITATIVE_METADATA_MAP or ID directly
    const meta = QUALITATIVE_METADATA_MAP[selectedProjectId] || QUALITATIVE_METADATA_MAP[target];
    const countryPrefix = selectedProjectId.substring(0, 2).toLowerCase();
    return {
      index: 0,
      id: selectedProjectId,
      operationNumber: selectedProjectId,
      name: selectedProjectId,
      country: '',
      countryCode: countryPrefix,
      countryName: '',
      ttl: '',
      status: 'Stage II',
      isPrefilledByTeam: (selectedProjectId === 'BR-L1642' || selectedProjectId === 'HO-L1261') ? false : true,
      validatedByTTLDate: null,
      qualitativeData: {
        estadoImplementacion: meta?.estadoImplementacion || [],
        productosDestacados: meta?.productosDestacados || [],
        probabilidadObjetivos: meta?.probabilidadObjetivos || [],
        accionesSugeridas: meta?.accionesSugeridas || [],
        fechaEvaluacionIntermedia: meta?.fechaEvaluacionIntermedia || '',
        fechaTalleresArranque: meta?.fechaTalleresArranque || '',
        temasCriticosSimulador: meta?.temasCriticosSimulador || '',
        verificadorContenidos: meta?.verificadorContenidos || '',
      },
      metadata: {
        investmentAmount: '$0.0M',
        disbursementPercent: 0,
        elapsedYears: 0,
        siScore: 0,
        pmr2026: {
          status: 'Satisfactory',
          score: 0
        }
      }
    } as Project;
  }, [projects, selectedProjectId, tableData, gasData.active_portfolio_table, gasData.inactive_pmr_table]);

  const getFirstName = (fullName: string) => {
    if (!fullName) return '';
    const upper = String(fullName || '').toUpperCase();
    
    if (upper.includes('MARTA') && upper.includes('RUIZ')) return 'Marta';
    if (upper.includes('ANASTASIYA')) return 'Anastasiya';
    if (upper.includes('MAC DOWELL') && upper.includes('MARIA')) return 'Maria Cristina';
    if (upper.includes('GOMEZ') && upper.includes('JUAN LUIS')) return 'Juan Luis';
    if (upper.includes('ZALTSMAN') && upper.includes('ARIEL')) return 'Ariel';
    if (upper.includes('RADICS') && upper.includes('GUSTAVO AXEL')) return 'Axel';
    if (upper.includes('MENDOZA') && upper.includes('HECTOR')) return 'Hector';
    if (upper.includes('GUARDIA') && upper.includes('ANDREA')) return 'Andrea';
    if (upper.includes('DESTEFANO') && upper.includes('MARIA ELISA')) return 'Elisa';
    if (upper.includes('ROMAN') && upper.includes('SUSANA')) return 'Susana';

    let name = '';
    if (fullName.includes(',')) {
      name = fullName.split(',')[1].trim().split(' ')[0];
    } else {
      name = fullName.split(' ')[0];
    }
    
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const displayName = useMemo(() => {
    if (!user) return 'FMM';
    if (user.username === 'martaruiz') return 'Marta';
    return getFirstName(user.name);
  }, [user]);

  const currentFullName = useMemo(() => {
    if (!user) return 'FMM Team';
    if (user.username === 'martaruiz') return 'Marta Ruiz-Arranz';
    return user.name;
  }, [user]);

  const currentEmail = useMemo(() => {
    if (!user) return 'fmm@iadb.org';
    if (user.username === 'martaruiz') return 'mruizarranz@IADB.ORG';
    return user.email;
  }, [user]);

  const formatName = (name: string) => {
    if (!name) return '';
    const titleCase = (str: string) => String(str || '').split(' ').map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '').join(' ');
    if (name.includes(',')) {
      const [last, first] = name.split(',').map(s => s.trim());
      return `${titleCase(first)} ${titleCase(last)}`;
    }
    return titleCase(name);
  };

  if (!isLoggedIn || !user) {
    return <Login />;
  }

  const isFmmUser = user.username === 'fmm';
  const isAnastasiya = user.username === 'anastasiyayarygina';

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900">
      {/* Top Bar */}
      <header className="bg-[#FAFAFA] text-zinc-700 border-b border-zinc-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4 md:gap-6">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-zinc-600" />
          </button>
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => setMainTab('PORTFOLIO')}>
            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" className="h-[38.4px] md:h-10 object-contain" />
            <div className="hidden sm:block w-px h-5 md:h-6 bg-zinc-300"></div>
            <h1 className="text-[14.4px] md:text-sm font-semibold tracking-tight whitespace-nowrap text-zinc-700">
              FMM Effectiveness Platform
            </h1>
          </div>
          <nav className="hidden lg:flex items-center gap-6 ml-6 lg:ml-8">
            {(['PORTFOLIO', 'DESIGN', 'EXECUTION', 'CLOSURE'] as MainTab[]).map(tab => {
              const cfg = MAIN_TAB_CONFIG[tab];
              const isActive = mainTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setMainTab(tab);
                    if (tab === 'EXECUTION') {
                      setExecutionView('landing');
                    }
                  }}
                  className={`px-3.5 py-1.5 text-xs md:text-[13px] font-medium tracking-normal uppercase rounded-md transition-colors duration-150 cursor-pointer ${
                    isActive 
                      ? cfg.activeClass 
                      : cfg.inactiveClass
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4 text-sm text-zinc-600 relative">
          {/* Role Dropdown strictly for anastasiyayarygina */}
          {isAnastasiya && (
            <div className="flex items-center gap-1.5 md:gap-2 bg-zinc-100 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-zinc-200">
              <span className="text-[9px] md:text-[10px] uppercase font-bold text-zinc-400">Role:</span>
              <select 
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value as UserRole)}
                className="bg-transparent border-none text-[10px] md:text-xs font-semibold text-zinc-700 focus:ring-0 cursor-pointer p-0"
              >
                <option value="EFFECTIVENESS_TEAM">Effectiveness Team</option>
                <option value="TTL">TTL</option>
              </select>
            </div>
          )}

          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1 md:gap-2 hover:bg-zinc-100 p-1 md:p-1.5 rounded-lg transition-colors"
          >
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-700">
              <UserIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            <span className="text-zinc-700 font-medium text-[10px] md:text-sm hidden xs:inline">Hello, {displayName}</span>
          </button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <>
                {/* Backdrop to close menu */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" 
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-[70] flex flex-col"
                >
                  <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{formatName(currentFullName)}</p>
                        <p className="text-xs text-zinc-500">{String(currentEmail || '').toLowerCase()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsUserMenuOpen(false)}
                      className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400 hover:text-zinc-900"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 py-4">
                    <button 
                      onClick={() => {
                        setMainTab('PORTFOLIO');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-4 px-6 py-4 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors group"
                    >
                      <Home className="w-5 h-5 text-zinc-400 group-hover:text-[#005173] transition-colors" />
                      <span className="font-semibold">Home</span>
                    </button>
                    {activeRole !== 'DIVISION_CHIEF' && user.username !== 'martaruiz' && (
                      <button 
                        onClick={() => {
                          setMainTab('EXECUTION');
                          setExecutionView('project-selector');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-4 px-6 py-4 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors group"
                      >
                        <ClipboardCheck className="w-5 h-5 text-zinc-400 group-hover:text-[#005173] transition-colors" />
                        <span className="font-semibold">
                          Qualitative information
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="p-6 border-t border-zinc-100">
                    <button 
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                    >
                      <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      <span className="font-bold uppercase tracking-widest text-xs">Logout</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}

            {isMobileMenuOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" 
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-[70] flex flex-col"
                >
                  <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" className="h-7 object-contain" />
                      <div className="w-px h-5 bg-zinc-300 mx-0.5"></div>
                      <span className="text-[11px] font-semibold tracking-tight text-zinc-700 whitespace-nowrap">FMM Effectiveness Platform</span>
                    </div>
                    <button 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 py-4 px-4 space-y-2 overflow-y-auto">
                    {(['PORTFOLIO', 'DESIGN', 'EXECUTION', 'CLOSURE'] as MainTab[]).map(tab => {
                      const cfg = MAIN_TAB_CONFIG[tab];
                      const isActive = mainTab === tab;
                      return (
                        <button
                          key={tab}
                          onClick={() => {
                            setMainTab(tab);
                            if (tab === 'EXECUTION') {
                              setExecutionView('landing');
                            }
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs md:text-sm uppercase tracking-normal font-medium transition-colors ${
                            isActive ? cfg.activeClass : cfg.inactiveClass
                          }`}
                        >
                          <span>{tab}</span>
                          {isActive && <span className="w-2 h-2 rounded-full bg-current opacity-70" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-4 border-t border-zinc-100">
                    <button 
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {mainTab === 'PORTFOLIO' && <PortfolioLanding />}
        
        {mainTab === 'EXECUTION' && (
          <div className="flex-1 flex flex-col">
            {executionView === 'landing' && (
              <Landing 
                onSelectPortfolio={(instrument, isPmr) => {
                  setPortfolioFilter(instrument);
                  setIsPmrMode(!!isPmr);
                  setExecutionView('portfolio');
                }}
                onSelectProjectLevel={() => setExecutionView('project-selector')}
                onSelectAlerts={() => setExecutionView('alerts')}
                onSelectMidTermEvaluations={() => setExecutionView('mid-term-evaluations')}
                onSelectCriticalProcurement={() => setExecutionView('critical-procurement')}
                totalProjects={metrics?.totalProjects}
              />
            )}
            
            {executionView === 'alerts' && (
              <div className="p-6 max-w-7xl mx-auto w-full">
                <Alerts 
                  projects={projects}
                  onBack={() => {
                    if (projectSourceView === 'project-view') {
                      setExecutionView('project-view');
                      setProjectSourceView(previousSourceView);
                    } else {
                      setExecutionView('landing');
                    }
                  }}
                  backLabel={projectSourceView === 'project-view' ? 'Back to Project' : 'Back to Execution'}
                  onSelectProject={(id) => {
                    setSelectedProjectId(id);
                    setProjectSourceView('alerts');
                    setExecutionView('project-view');
                  }}
                  initialState={alertsState || undefined}
                  onStateChange={setAlertsState}
                />
              </div>
            )}

            {executionView === 'mid-term-evaluations' && (
              <div className="p-6 max-w-7xl mx-auto w-full">
                <MidTermEvaluations 
                  projects={projects}
                  onBack={() => {
                    if (projectSourceView === 'project-view') {
                      setExecutionView('project-view');
                      setProjectSourceView(previousSourceView);
                    } else {
                      setExecutionView('landing');
                    }
                  }}
                  backLabel={projectSourceView === 'project-view' ? 'Back to Project' : 'Back to Execution'}
                  onSelectProject={(id) => {
                    setSelectedProjectId(id);
                    setProjectSourceView('mid-term-evaluations');
                    setExecutionView('project-view');
                  }}
                />
              </div>
            )}

            {executionView === 'critical-procurement' && (
              <div className="p-6 max-w-7xl mx-auto w-full">
                <MidTermEvaluations 
                  projects={projects}
                  isCriticalProcurement={true}
                  onBack={() => {
                    if (projectSourceView === 'project-view') {
                      setExecutionView('project-view');
                      setProjectSourceView(previousSourceView);
                    } else {
                      setExecutionView('landing');
                    }
                  }}
                  backLabel={projectSourceView === 'project-view' ? 'Back to Project' : 'Back to Execution'}
                  onSelectProject={(id) => {
                    setSelectedProjectId(id);
                    setProjectSourceView('critical-procurement');
                    setExecutionView('project-view');
                  }}
                />
              </div>
            )}

            {executionView === 'portfolio' && (
              <div className="p-6 max-w-7xl mx-auto w-full">
                <Dashboard 
                  projects={projects} 
                  isReadOnly={false}
                  onBack={() => {
                    setExecutionView('landing');
                    setPortfolioFilter(null);
                    setIsPmrMode(false);
                  }}
                  onSelectProject={(id) => {
                    setSelectedProjectId(id);
                    setProjectSourceView('portfolio');
                    setExecutionView('project-view');
                  }}
                  initialInstrument={portfolioFilter}
                  isPmrMode={isPmrMode}
                />
              </div>
            )}

            {executionView === 'project-selector' && (
              <div className="p-6 max-w-7xl mx-auto w-full">
                <ProjectSelector 
                  projects={projects}
                  onSelectProject={(id) => {
                    setSelectedProjectId(id);
                    setExecutionView('qualitative-process');
                  }}
                  currentUser={currentUser}
                  selectedTTL={user?.ttlName}
                  selectedEffectivenessMember={user?.name}
                />
              </div>
            )}

            {executionView === 'qualitative-process' && selectedProject && (
              <div className="p-6 max-w-7xl mx-auto w-full">
                <QualitativeProcess 
                  project={selectedProject} 
                  onBack={() => setExecutionView('project-selector')} 
                  onUpdate={updateProject}
                  currentUser={currentUser}
                />
              </div>
            )}

            {executionView === 'project-view' && selectedProject && (
              <div className="p-6 max-w-7xl mx-auto w-full">
                <ProjectView 
                  project={selectedProject} 
                  initialTab={
                    projectSourceView === 'critical-procurement'
                      ? 'critical_procurement'
                      : 'baseline'
                  }
                  onBack={() => {
                    const backView = projectSourceView === 'project-view' ? 'portfolio' : projectSourceView;
                    setExecutionView(backView);
                  }} 
                  onUpdate={updateProject}
                  onNavigateToAlert={(alertNumber, alertTitle) => {
                    const tabId = `card-${alertNumber}`;
                    const currentOpenTabs = alertsState?.openTabs || [{ id: 'overview', number: 0, title: 'Scorecard' }];
                    const alreadyOpen = currentOpenTabs.some((t: any) => t.id === tabId);
                    const newOpenTabs = alreadyOpen 
                      ? currentOpenTabs 
                      : [...currentOpenTabs, { id: tabId, number: alertNumber, title: alertTitle }];

                    const defaultTabFilters = {
                      id: [],
                      name: [],
                      country: [],
                      ttl: [],
                      status: []
                    };

                    const newState = {
                      openTabs: newOpenTabs,
                      activeTabId: tabId,
                      tabSearchTerm: '',
                      selectedSlice: null,
                      tabFilters: alertsState?.tabFilters || defaultTabFilters,
                      tabSortConfig: alertsState?.tabSortConfig || { key: '', direction: null }
                    };

                    setAlertsState(newState);
                    setPreviousSourceView(projectSourceView === 'project-view' ? 'portfolio' : projectSourceView);
                    setProjectSourceView('project-view');
                    setExecutionView('alerts');
                  }}
                />
              </div>
            )}
          </div>
        )}

        {mainTab === 'DESIGN' && (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            Design Module - Coming Soon
          </div>
        )}

        {mainTab === 'CLOSURE' && (
          <div className="p-6 max-w-7xl mx-auto w-full flex-1 flex flex-col bg-zinc-100/30">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <div className="mb-4 text-left">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-black">
                  PCR Results Projection
                </h2>
                <p className="text-zinc-500 text-base md:text-lg mt-2">
                  This section displays the projected PCR results to be delivered within the next 9 months for investment projects (INV), or 12 months for policy-based loans (PBLs).
                </p>
              </div>
              <ClosureTable />
            </motion.div>
          </div>
        )}
      </main>

      {/* Bottom Bar */}
      <footer className="bg-[#005173] border-t border-[#003d57] py-6 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-blue-100">
          <p>Developed by the Fiscal Management Division</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
