import React, { useState } from 'react';
import { initialProjects } from './data';
import { Project, User, UserRole } from './types';
import Dashboard from './components/Dashboard';
import ProjectView from './components/ProjectView';
import Landing from './components/Landing';
import ProjectSelector from './components/ProjectSelector';
import PortfolioLanding from './components/PortfolioLanding';
import QualitativeProcess from './components/QualitativeProcess';
import Alerts from './components/Alerts';
import { Settings, User as UserIcon, HelpCircle, Database as DatabaseIcon, LogOut, Home, ClipboardCheck, X, ChevronDown, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePortfolioData } from './hooks/usePortfolioData';
import { QUALITATIVE_METADATA_MAP } from './data/qualitativeMetadata';

type MainTab = 'PORTFOLIO' | 'DESIGN' | 'EXECUTION' | 'CLOSURE';
type ExecutionView = 'landing' | 'portfolio' | 'project-selector' | 'project-view' | 'qualitative-process' | 'alerts';

const MOCK_USERS: User[] = [
  { id: '1', name: 'Effectiveness Team', email: 'effectiveness@iadb.org', role: 'EFFECTIVENESS_TEAM' },
  { id: '2', name: 'Division Chief', email: 'chief@iadb.org', role: 'DIVISION_CHIEF' },
  { id: '3', name: 'TTL', email: 'ttl@iadb.org', role: 'TTL' }
];

const EFFECTIVENESS_TEAM_MEMBERS = [
  { name: 'Radics, Gustavo Axel', email: 'AXELRADICS@IADB.ORG' },
  { name: 'MENDOZA CASTRO , HECTOR AGUSTIN', email: 'HMENDOZA@IADB.ORG' },
  { name: 'Guardia Muguruza, Andrea', email: 'ANDREAGUA@IADB.ORG' }
];

const TTL_INFO = [
  { name: 'Martin Ardanaz', email: 'MARTINA@iadb.org' },
  { name: 'Jessica Chamorro', email: 'JESSICACH@IADB.ORG' },
  { name: 'Sergio Ciavolih', email: 'SERGIOCI@IADB.ORG' },
  { name: 'Juan Luis Gomez', email: 'jgomezreino@IADB.ORG' },
  { name: 'Carlos Goncalves', email: 'cgoncalves@iadb.org' },
  { name: 'Ubaldo', email: 'UBALDOG@IADB.ORG' },
  { name: 'Leslie harper', email: 'LESLIEHA@iadb.org' },
  { name: 'Zoila Llempen', email: 'ZOILAL@IADB.ORG' },
  { name: 'Oscar lora', email: 'OLORAROCHA@iadb.org' },
  { name: 'Maria cristina mac dowell', email: 'mmacdowell@IADB.ORG' },
  { name: 'Andre Martinez', email: 'ANDREMA@IADB.ORG' },
  { name: 'Renata motta', email: 'RMOTTACAFE@IADB.ORG' },
  { name: 'Andres Munoz', email: 'ANDRESMU@iadb.org' },
  { name: 'Zoila Navarro', email: 'ZOILAN@IADB.ORG' },
  { name: 'Gerardo Reyes', email: 'GERARDOR@iadb.org' },
  { name: 'Anastasiya', email: 'ANASTASIYAY@IADB.ORG' },
  { name: 'Ariel', email: 'TEODOROZ@iadb.org' }
];

export default function App() {
  const { tableData, metrics } = usePortfolioData();
  const [mainTab, setMainTab] = useState<MainTab>('PORTFOLIO');
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [executionView, setExecutionView] = useState<ExecutionView>('landing');
  const [portfolioFilter, setPortfolioFilter] = useState<'INV' | 'PBL' | null>(null);
  const [isPmrMode, setIsPmrMode] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectSourceView, setProjectSourceView] = useState<'portfolio' | 'alerts'>('portfolio');
  const [alertsState, setAlertsState] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [selectedTTL, setSelectedTTL] = useState<string>('');
  const [selectedEffectivenessMember, setSelectedEffectivenessMember] = useState<string>(EFFECTIVENESS_TEAM_MEMBERS[0].name);

  const ttls = Array.from(new Set(tableData.map(row => row.ttl))).filter(Boolean).sort();

  // Initialize projects from tableData if not already initialized with more than mock data
  React.useEffect(() => {
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
  }, [tableData]);

  // Update selectedTTL when switching to TTL role if not set
  React.useEffect(() => {
    if (currentUser.role === 'TTL' && !selectedTTL && ttls.length > 0) {
      setSelectedTTL(ttls[0]);
    }
  }, [currentUser.role, ttls, selectedTTL]);

  // Scroll to top on view change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [mainTab, executionView, selectedProjectId]);

  const updateProject = (updatedProject: Project) => {
    let finalProject = { ...updatedProject };
    
    // RBAC Rule: If Effectiveness Team saves a validated project, reset validation
    if (currentUser.role === 'EFFECTIVENESS_TEAM' && updatedProject.validatedByTTLDate) {
      finalProject.validatedByTTLDate = null;
    }
    
    setProjects(projects.map(p => p.id === finalProject.id ? finalProject : p));
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  const getFirstName = (fullName: string) => {
    if (!fullName) return '';
    const upper = String(fullName || '').toUpperCase();
    
    // Special cases
    if (upper.includes('MAC DOWELL') && upper.includes('MARIA')) return 'Maria Cristina';
    if (upper.includes('GOMEZ') && upper.includes('JUAN LUIS')) return 'Juan Luis';
    if (upper.includes('ZALTSMAN') && upper.includes('ARIEL')) return 'Ariel';
    if (upper.includes('RADICS') && upper.includes('GUSTAVO AXEL')) return 'Axel';
    if (upper.includes('MENDOZA CASTRO') && upper.includes('HECTOR AGUSTIN')) return 'Hector Agustin';
    if (upper.includes('GUARDIA MUGURUZA') && upper.includes('ANDREA')) return 'Andrea';

    let name = '';
    if (fullName.includes(',')) {
      name = fullName.split(',')[1].trim().split(' ')[0];
    } else {
      name = fullName.split(' ')[0];
    }
    
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const displayName = currentUser.role === 'TTL' && selectedTTL 
    ? getFirstName(selectedTTL) 
    : currentUser.role === 'EFFECTIVENESS_TEAM' && selectedEffectivenessMember
      ? getFirstName(selectedEffectivenessMember)
      : currentUser.name;

  const currentFullName = currentUser.role === 'TTL' && selectedTTL
    ? selectedTTL
    : currentUser.role === 'EFFECTIVENESS_TEAM' && selectedEffectivenessMember
      ? selectedEffectivenessMember
      : currentUser.name;

  const currentEmail = currentUser.role === 'TTL' && selectedTTL
    ? (TTL_INFO.find(info => {
        const normalize = (str: string) => String(str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase();
        const parts = normalize(info.name).split(' ');
        const normalizedSelected = normalize(selectedTTL);
        return parts.every(part => normalizedSelected.includes(part));
      })?.email || currentUser.email)
    : currentUser.role === 'EFFECTIVENESS_TEAM' && selectedEffectivenessMember
      ? (EFFECTIVENESS_TEAM_MEMBERS.find(m => m.name === selectedEffectivenessMember)?.email || currentUser.email)
      : currentUser.email;

  const formatName = (name: string) => {
    if (!name) return '';
    const titleCase = (str: string) => String(str || '').split(' ').map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '').join(' ');
    if (name.includes(',')) {
      const [last, first] = name.split(',').map(s => s.trim());
      return `${titleCase(first)} ${titleCase(last)}`;
    }
    return titleCase(name);
  };

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
            <img src="/idb-logo.png" alt="IDB Logo" className="h-[38.4px] md:h-10 object-contain" />
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

        <div className="flex items-center gap-2 md:gap-6 text-sm text-zinc-600 relative">
          <div className="hidden lg:flex flex-col sm:flex-row items-end sm:items-center gap-1 md:gap-3">
            <div className="flex items-center gap-1 md:gap-2 bg-zinc-100 px-2 md:px-3 py-0.5 md:py-1.5 rounded-lg border border-zinc-200">
              <span className="text-[8px] md:text-[10px] uppercase font-bold text-zinc-400">Role:</span>
              <select 
                value={currentUser.id}
                onChange={(e) => {
                  const user = MOCK_USERS.find(u => u.id === e.target.value);
                  if (user) {
                    setCurrentUser(user);
                    if (user.role !== 'TTL') setSelectedTTL('');
                  }
                }}
                className="bg-transparent border-none text-[9px] md:text-xs font-semibold text-zinc-700 focus:ring-0 cursor-pointer p-0"
              >
                {MOCK_USERS.map(user => (
                  <option key={user.id} value={user.id}>{user.role.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            {(currentUser.role === 'EFFECTIVENESS_TEAM' || currentUser.role === 'TTL') && (
              <div className="flex items-center gap-1 md:gap-2 bg-zinc-100 px-2 md:px-3 py-0.5 md:py-1.5 rounded-lg border border-zinc-200 animate-in fade-in slide-in-from-left-2">
                <span className="text-[8px] md:text-[10px] uppercase font-bold text-zinc-400">
                  {currentUser.role === 'EFFECTIVENESS_TEAM' ? 'Member:' : 'TTL:'}
                </span>
                <select 
                  value={currentUser.role === 'EFFECTIVENESS_TEAM' ? selectedEffectivenessMember : selectedTTL}
                  onChange={(e) => currentUser.role === 'EFFECTIVENESS_TEAM' ? setSelectedEffectivenessMember(e.target.value) : setSelectedTTL(e.target.value)}
                  className="bg-transparent border-none text-[9px] md:text-xs font-semibold text-zinc-700 focus:ring-0 cursor-pointer max-w-[80px] xs:max-w-[100px] md:max-w-[150px] p-0"
                >
                  {currentUser.role === 'EFFECTIVENESS_TEAM' ? (
                    EFFECTIVENESS_TEAM_MEMBERS.map(member => (
                      <option key={member.email} value={member.name}>{member.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="" disabled>Select TTL</option>
                      {ttls.map(ttl => (
                        <option key={ttl} value={ttl}>{ttl}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="hidden lg:flex items-center gap-1 md:gap-2 hover:bg-zinc-100 p-1 md:p-1.5 rounded-lg transition-colors"
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
                    {currentUser.role !== 'DIVISION_CHIEF' && (
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
                          {currentUser.role === 'EFFECTIVENESS_TEAM' ? 'PMR prefilling' : 'PMR validation'}
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="p-6 border-t border-zinc-100">
                    <button 
                      onClick={() => {
                        // Logout logic here if needed
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
                      <img src="/idb-logo.png" alt="IDB Logo" className="h-7 object-contain" />
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
                totalProjects={metrics?.totalProjects}
              />
            )}
            
            {executionView === 'alerts' && (
              <div className="p-6 max-w-7xl mx-auto w-full">
                <Alerts 
                  projects={projects}
                  onBack={() => setExecutionView('landing')}
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
                  selectedTTL={selectedTTL}
                  selectedEffectivenessMember={selectedEffectivenessMember}
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
                  onBack={() => setExecutionView(projectSourceView)} 
                  onUpdate={updateProject}
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
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            Closure Module - Coming Soon
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
