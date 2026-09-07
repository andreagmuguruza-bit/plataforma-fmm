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

type MainTab = 'PORTFOLIO' | 'DESIGN' | 'EXECUTION' | 'CLOSURE';
type ExecutionView = 'landing' | 'portfolio' | 'project-selector' | 'project-view' | 'qualitative-process' | 'alerts' | 'mid-term-evaluations' | 'critical-procurement';

function MainApp() {
  const { user, activeRole, setActiveRole, isLoggedIn, logout } = useAuth();
  const { tableData, metrics } = usePortfolioData();
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

  // Initialize projects from tableData if not already initialized with more than mock data
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
        isPrefilledByTeam: true,
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
    }
  }, [tableData, projects.length]);

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

  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

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
          <nav className="hidden lg:flex items-center gap-1 ml-4 lg:ml-8">
            {(['PORTFOLIO', 'DESIGN', 'EXECUTION', 'CLOSURE'] as MainTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setMainTab(tab);
                  if (tab === 'EXECUTION') {
                    setExecutionView('landing');
                  }
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  mainTab === tab 
                    ? 'bg-zinc-100 text-zinc-900' 
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                {tab}
              </button>
            ))}
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

          {/* User 'fmm': Complete removal of role section and profile dropdown; clean simple logout button */}
          {isFmmUser ? (
            <button 
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:text-red-600 hover:bg-zinc-100 rounded-lg transition-colors border border-zinc-200"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1 md:gap-2 hover:bg-zinc-100 p-1 md:p-1.5 rounded-lg transition-colors"
            >
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-700">
                <UserIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </div>
              <span className="text-zinc-700 font-medium text-[10px] md:text-sm hidden xs:inline">Hello, {displayName}</span>
            </button>
          )}

          <AnimatePresence>
            {!isFmmUser && isUserMenuOpen && (
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
                          {activeRole === 'EFFECTIVENESS_TEAM' ? 'PMR prefilling' : 'PMR validation'}
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

                  <div className="flex-1 py-4 overflow-y-auto">
                    {(['PORTFOLIO', 'DESIGN', 'EXECUTION', 'CLOSURE'] as MainTab[]).map(tab => (
                      <button
                        key={tab}
                        onClick={() => {
                          setMainTab(tab);
                          if (tab === 'EXECUTION') {
                            setExecutionView('landing');
                          }
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center px-6 py-4 text-sm font-semibold transition-colors ${
                          mainTab === tab 
                            ? 'bg-zinc-100 text-[#005173]' 
                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
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
                    projectSourceView === 'mid-term-evaluations' 
                      ? 'midterm' 
                      : projectSourceView === 'critical-procurement'
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
