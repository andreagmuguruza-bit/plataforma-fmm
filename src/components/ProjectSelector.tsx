import React, { useState } from 'react';
import { Project, User } from '../types';
import { ClipboardCheck, Search, ChevronDown, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useGASPortfolioData } from '../hooks/useGASPortfolioData';
import { QUALITATIVE_METADATA_MAP } from '../data/qualitativeMetadata';
import { useLiveQualitativeMap, parseRemoteProjectData } from '../hooks/useQualitativeData';

interface ProjectSelectorProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  currentUser: User;
  selectedTTL?: string;
  selectedEffectivenessMember?: string;
}

export function isTtlMatch(projectTtl?: string, userTtlName?: string, username?: string, userFullName?: string): boolean {
  if (!projectTtl) return false;
  const p = projectTtl.toUpperCase().trim();
  
  if (userTtlName) {
    const u = userTtlName.toUpperCase().trim();
    if (p === u || p.includes(u) || u.includes(p)) return true;
    const pTokens = p.replace(/[^A-Z]/g, ' ').split(/\s+/).filter(t => t.length > 2);
    const uTokens = u.replace(/[^A-Z]/g, ' ').split(/\s+/).filter(t => t.length > 2);
    const common = pTokens.filter(t => uTokens.includes(t));
    if (common.length >= 2) return true;
    if (pTokens.length === 1 && uTokens.includes(pTokens[0])) return true;
  }

  if (userFullName) {
    const fn = userFullName.toUpperCase().trim();
    if (p === fn || p.includes(fn) || fn.includes(p)) return true;
    const fnTokens = fn.replace(/[^A-Z]/g, ' ').split(/\s+/).filter(t => t.length > 2);
    const pTokens = p.replace(/[^A-Z]/g, ' ').split(/\s+/).filter(t => t.length > 2);
    const common = pTokens.filter(t => fnTokens.includes(t));
    if (common.length >= 2) return true;
  }

  if (username) {
    const un = username.toLowerCase().trim();
    if (un.includes('ubaldo') && p.includes('GONZALEZ')) return true;
    if (un.includes('ardanaz') && p.includes('ARDANAZ')) return true;
    if (un.includes('calijuri') && p.includes('CALIJURI')) return true;
    if (un.includes('chamorro') && p.includes('CHAMORRO')) return true;
    if (un.includes('ciavolih') && p.includes('CIAVOLIH')) return true;
    if (un.includes('juanluis') && p.includes('GOMEZ REINO')) return true;
    if (un.includes('goncalves') && p.includes('GONCALVES')) return true;
    if (un.includes('harper') && p.includes('HARPER')) return true;
    if (un.includes('llempen') && p.includes('LLEMPEN')) return true;
    if (un.includes('lora') && p.includes('LORA')) return true;
    if (un.includes('macdowell') && (p.includes('MAC DOWELL') || p.includes('MACDOWELL'))) return true;
    if (un.includes('martinez') && p.includes('MARTINEZ')) return true;
    if (un.includes('motta') && p.includes('MOTTA')) return true;
    if (un.includes('munoz') && p.includes('MUNOZ')) return true;
    if (un.includes('reyes') && p.includes('REYES')) return true;
    if (un.includes('zaltsman') && p.includes('ZALTSMAN')) return true;
    if (un.includes('yarygina') && p.includes('YARYGINA')) return true;
    if (un.includes('alejos') && p.includes('ALEJOS')) return true;
  }
  return false;
}

export const PMR_PREFILLING_PROJECT_IDS: string[] = [
  'AR-L1248',
  'AR-L1285',
  'AR-L1405',
  'AR-L1416',
  'BL-L1031',
  'BL-L1038',
  'BR-L1501',
  'BR-L1513',
  'BR-L1516',
  'BR-L1517',
  'BR-L1525',
  'BR-L1527',
  'BR-L1533',
  'BR-L1535',
  'BR-L1539',
  'BR-L1540',
  'BR-L1550',
  'BR-L1592',
  'BR-L1599',
  'BR-L1614',
  'BR-L1629',
  'BR-L1642',
  'BR-L1643',
  'BR-L1656',
  'BR-L1658',
  'CH-L1178',
  'CO-L1164',
  'CO-L1245',
  'EC-L1230',
  'EC-L1253',
  'HO-L1261',
  'ME-L1309',
  'PE-L1231',
  'PE-L1239',
  'PE-L1266',
  'PE-L1278',
  'PE-L1288',
  'PN-L1161',
  'PN-L1172',
  'PR-L1150',
  'PR-L1192',
  'SU-L1060',
  'UR-L1111',
  'UR-L1164',
  'UR-L1193',
  'UR-L1205'
];

export function shouldSeeAllProjects(user?: User | null): boolean {
  if (!user) return false;
  if (user.role === 'EFFECTIVENESS_TEAM' || user.role === 'GENERAL_FMM' || user.role === 'DIVISION_CHIEF') {
    return true;
  }
  const u = (user.username || user.id || '').toLowerCase().replace(/[^a-z]/g, '');
  const n = (user.name || '').toLowerCase();
  
  // Andrea Guardia, Axel Radics, Anastasiya Yarygina, Maria Elisa De Stefano, Hector Agustin Mendoza, Susana Roman
  if (u.includes('andrea') || n.includes('andrea')) return true;
  if (u.includes('axel') || n.includes('axel')) return true;
  if (u.includes('anastasiya') || n.includes('anastasiya')) return true;
  if (u.includes('elisa') || n.includes('elisa')) return true;
  if (u.includes('hector') || n.includes('hector')) return true;
  if (u.includes('susana') || n.includes('susana')) return true;
  if (u.includes('marta') || n.includes('marta')) return true;
  if (u.includes('fmm') || n.includes('fmm')) return true;

  return false;
}

const PMR_SET = new Set(PMR_PREFILLING_PROJECT_IDS);
const PMR_ORDER_MAP = new Map(PMR_PREFILLING_PROJECT_IDS.map((id, index) => [id, index]));

export function getStatusDisplay(project: Project) {
  if (project.validatedByTTLDate) {
    return {
      text: `Validated by the TTL on ${project.validatedByTTLDate}`,
      color: 'bg-[#4EA72E]'
    };
  }
  if (project.isPrefilledByTeam) {
    return {
      text: 'Pending TTL validation',
      color: 'bg-[#FFC107]'
    };
  }
  return {
    text: 'Pending Effectiveness Team prefilling',
    color: 'bg-[#FFC107]'
  };
}

export default function ProjectSelector({ projects, onSelectProject, currentUser, selectedTTL, selectedEffectivenessMember }: ProjectSelectorProps) {
  const [filterProject, setFilterProject] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

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

  const gasData = useGASPortfolioData();
  const hasFullAccess = shouldSeeAllProjects(currentUser);
  const { qualMap, isQualLoading } = useLiveQualitativeMap();

  // Always maintain all 46 designated PMR prefilling projects in the exact requested order
  const pmrProjects = React.useMemo(() => {
    const projectMap = new Map<string, Project>();
    projects.forEach(p => {
      if (p.id) projectMap.set(p.id.toUpperCase().trim(), p);
      if (p.operationNumber) projectMap.set(p.operationNumber.toUpperCase().trim(), p);
    });

    const activeGasMap = new Map<string, any>();
    (gasData.active_portfolio_table || []).forEach(p => {
      if (p.projectNumber) activeGasMap.set(p.projectNumber.toUpperCase().trim(), p);
      if (p.operationNumber) activeGasMap.set(p.operationNumber.toUpperCase().trim(), p);
    });

    const inactiveGasMap = new Map<string, any>();
    (gasData.inactive_pmr_table || []).forEach(p => {
      if (p.projectNumber) inactiveGasMap.set(p.projectNumber.toUpperCase().trim(), p);
      if (p.operationNumber) inactiveGasMap.set(p.operationNumber.toUpperCase().trim(), p);
    });

    return PMR_PREFILLING_PROJECT_IDS.map((id) => {
      const upperId = id.toUpperCase().trim();
      const existing = projectMap.get(upperId);
      const gasRow = activeGasMap.get(upperId) || inactiveGasMap.get(upperId);
      const meta = QUALITATIVE_METADATA_MAP[id] || QUALITATIVE_METADATA_MAP[upperId];

      const projTtl = (upperId === 'HO-L1261')
        ? (gasRow?.ttl && gasRow.ttl !== 'N/A' && gasRow.ttl !== '' ? gasRow.ttl : 'ALEJOS MARROQUIN, LUIS ALEJANDRO')
        : (existing?.ttl || gasRow?.ttl || '');

      const projName = (upperId === 'HO-L1261')
        ? (existing?.name || gasRow?.title || 'Programa de Modernización de la Gestión Fiscal')
        : (existing?.name || gasRow?.title || id);

      const projCountry = (upperId === 'HO-L1261')
        ? 'Honduras'
        : (existing?.countryName || existing?.country || gasRow?.countryName || '');

      // Dynamic validation status from FMM_Qualitative_Data Google Sheets
      const parsedRemote = parseRemoteProjectData(qualMap, upperId, existing?.operationNumber || gasRow?.operationNumber);
      const remoteData = parsedRemote?.remoteData || parsedRemote?.projectEntry;

      const rawPrefilled = remoteData?.isPrefilledByTeam ?? (parsedRemote?.projectEntry?.isPrefilledByTeam) ?? (existing as any)?.isPrefilledByTeam;
      const rawValidated = remoteData?.validatedByTTLDate ?? (parsedRemote?.projectEntry?.validatedByTTLDate) ?? (existing as any)?.validatedByTTLDate;

      const resolvedPrefilled = rawPrefilled !== undefined
        ? (rawPrefilled === true || rawPrefilled === 'true' || rawPrefilled === 'TRUE' || rawPrefilled === 1)
        : (existing?.isPrefilledByTeam ?? ((id === 'BR-L1642' || id === 'HO-L1261') ? false : true));

      const resolvedValidated = (rawValidated !== undefined && rawValidated !== null && String(rawValidated).trim() !== '' && String(rawValidated).toLowerCase() !== 'null' && String(rawValidated).toLowerCase() !== 'undefined')
        ? String(rawValidated).trim()
        : (existing?.validatedByTTLDate || null);

      if (existing) {
        return {
          ...existing,
          name: projName,
          country: projCountry,
          countryName: projCountry,
          countryCode: existing.countryCode || gasRow?.countryCode || id.substring(0, 2).toLowerCase(),
          ttl: projTtl,
          operationNumber: existing.operationNumber || gasRow?.operationNumber || id,
          isPrefilledByTeam: resolvedPrefilled,
          validatedByTTLDate: resolvedValidated
        };
      }

      return {
        id,
        operationNumber: gasRow?.operationNumber || id,
        name: projName,
        country: projCountry,
        countryCode: gasRow?.countryCode || id.substring(0, 2).toLowerCase(),
        countryName: projCountry,
        ttl: projTtl,
        status: gasRow?.stage || gasRow?.status || 'Stage I',
        isPrefilledByTeam: resolvedPrefilled,
        validatedByTTLDate: resolvedValidated,
        qualitativeData: {
          estadoImplementacion: meta?.estadoImplementacion || [],
          productosDestacados: meta?.productosDestacados || [],
          probabilidadObjetivos: meta?.probabilidadObjetivos || [],
          accionesSugeridas: meta?.accionesSugeridas || [],
          fechaEvaluacionIntermedia: meta?.fechaEvaluacionIntermedia || '',
          fechaTalleresArranque: meta?.fechaTalleresArranque || '',
          temasCriticosSimulador: meta?.temasCriticosSimulador || '',
          verificadorContenidos: meta?.verificadorContenidos || ''
        },
        metadata: {
          investmentAmount: `$${gasRow?.currentApprovedAmount || 0}M`,
          disbursementPercent: gasRow?.disbursedLifePercent || 0,
          elapsedYears: 0,
          siScore: 0,
          pmr2026: {
            status: 'Satisfactory',
            score: 0
          }
        }
      } as Project;
    });
  }, [projects, gasData.active_portfolio_table, gasData.inactive_pmr_table, qualMap]);

  const filteredProjects = React.useMemo(() => {
    return pmrProjects.filter(project => {
      // If user does not have full access to all 46 projects, filter strictly to their assigned projects
      if (!hasFullAccess) {
        const isUserAlejos = (currentUser.username || currentUser.id || '').toLowerCase().includes('alejos') ||
                             (currentUser.name || '').toLowerCase().includes('alejos');
        if (isUserAlejos) {
          return project.id === 'HO-L1261';
        }

        const isMatch = isTtlMatch(
          project.ttl,
          selectedTTL || currentUser.ttlName,
          currentUser.username || currentUser.id,
          currentUser.name
        );
        if (!isMatch) return false;
      }

      // General filters apply
      const filterProjLower = String(filterProject || '').toLowerCase();
      const statusObj = getStatusDisplay(project);
      const matchesProject = filterProject === '' || 
        String(project.name || '').toLowerCase().includes(filterProjLower) || 
        String(project.id || '').toLowerCase().includes(filterProjLower) ||
        String(project.operationNumber || '').toLowerCase().includes(filterProjLower) ||
        statusObj.text.toLowerCase().includes(filterProjLower);
      const projectCountry = project.countryName || project.country;
      const matchesCountry = filterCountry === '' || projectCountry === filterCountry;
      
      let matchesStatus = true;
      if (filterStatus !== '') {
        if (filterStatus === 'Validated by TTL') {
          matchesStatus = !!project.validatedByTTLDate;
        } else if (filterStatus === 'Pending TTL validation') {
          matchesStatus = project.isPrefilledByTeam && !project.validatedByTTLDate;
        } else if (filterStatus === 'Pending Effectiveness Team prefilling') {
          matchesStatus = !project.isPrefilledByTeam && !project.validatedByTTLDate;
        }
      }

      return matchesProject && matchesCountry && matchesStatus;
    });
  }, [pmrProjects, hasFullAccess, currentUser, selectedTTL, filterProject, filterCountry, filterStatus]);

  const orderedFilteredProjects = filteredProjects;

  const uniqueCountries = React.useMemo(() => {
    return Array.from(new Set(pmrProjects.map(p => p.countryName || p.country))).filter(Boolean).sort();
  }, [pmrProjects]);

  const pmrStatuses = [
    'Pending Effectiveness Team prefilling',
    'Pending TTL validation',
    'Validated by TTL'
  ];

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
    if (upper.includes('ALEJOS') && upper.includes('LUIS')) return 'Luis';

    let name = '';
    if (fullName.includes(',')) {
      name = fullName.split(',')[1].trim().split(' ')[0];
    } else {
      name = fullName.split(' ')[0];
    }
    
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const displayName = !hasFullAccess && selectedTTL 
    ? getFirstName(selectedTTL) 
    : !hasFullAccess && currentUser.ttlName
      ? getFirstName(currentUser.ttlName)
      : currentUser.name ? getFirstName(currentUser.name) : currentUser.username;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="space-y-8"
    >
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            Qualitative information
          </h2>
          {isQualLoading && (
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-full">
              <Loader2 className="w-3 h-3 animate-spin text-[#005173]" />
              <span className="italic">Syncing live status...</span>
            </span>
          )}
        </div>
        <p className="text-zinc-500 mt-1 whitespace-pre-line">
          {"\n"}
          Hello, {displayName}. Please, {hasFullAccess ? 'prefill' : 'validate'} the qualitative information about the current status of {hasFullAccess ? 'the' : 'your'} projects for the PMR cycle.{"\n"}
          {"\n"}
          Click on "{hasFullAccess ? 'Start prefilling' : 'Start validation'}" to begin the process, or click on "{hasFullAccess ? 'See prefilling' : 'See validation'}" to review the information submitted.
        </p>
      </div>

      {hasFullAccess && (
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-8">
          <div className="flex flex-col gap-1 lg:col-span-5">
            <label className="text-[#002148] font-bold text-[13px] tracking-tight">PROJECT</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search project name or ID..." 
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#005173] font-normal placeholder:text-zinc-400"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 lg:col-span-3">
            <label className="text-[#002148] font-bold text-[13px] tracking-tight">COUNTRY</label>
            <div className="relative">
              <select 
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full pl-3 pr-10 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#005173] font-medium appearance-none"
              >
                <option value="">All Countries</option>
                {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1 lg:col-span-4">
            <label className="text-[#002148] font-bold text-[13px] tracking-tight">STATUS</label>
            <div className="relative">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-3 pr-10 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#005173] font-medium appearance-none"
              >
                <option value="">All Statuses</option>
                {pmrStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#f4f4f5] border border-zinc-200 rounded-xl overflow-hidden">
        <div className="hidden lg:grid grid-cols-12 gap-4 py-3 px-6 border-b border-zinc-200 text-[11px] font-bold text-zinc-900 uppercase tracking-wider">
          <div className="col-span-1 text-center">N</div>
          <div className="col-span-4">PROJECT</div>
          <div className="col-span-2 pl-5">COUNTRY</div>
          <div className="col-span-3">STATUS</div>
          <div className="col-span-2 text-left">ACTION</div>
        </div>
        <div className="divide-y divide-zinc-200 bg-white">
          {orderedFilteredProjects.map((project, idx) => {
            const status = getStatusDisplay(project);
            const flagCode = countryCodes[project.countryName] || (project.countryCode ? project.countryCode.toLowerCase() : '');
            return (
              <div key={project.id} className="flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4 py-4 px-4 lg:px-6 items-start lg:items-center hover:bg-zinc-50 transition-colors">
                <div className="hidden lg:block lg:col-span-1 text-center text-zinc-400 font-medium text-xs">
                  {idx + 1}
                </div>
                <div className="lg:col-span-4 w-full">
                  <div className="font-bold text-zinc-900 text-[13px] pr-4" title={project.name}>
                    {project.name}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5 font-medium flex items-center justify-between lg:block">
                    <span>{project.id}</span>
                    <span className="lg:hidden text-[10px] text-zinc-300 font-bold uppercase">Nº {idx + 1}</span>
                  </div>
                </div>
                <div className="lg:col-span-2 flex items-center gap-2 text-xs text-zinc-500 font-medium lg:pl-5">
                  <span className="lg:hidden text-[10px] uppercase font-bold text-zinc-300 mr-1">Country:</span>
                  {flagCode ? (
                    <img 
                      src={`https://flagcdn.com/w40/${flagCode}.png`} 
                      className="w-4 h-auto shadow-sm border border-zinc-100" 
                      crossOrigin="anonymous" 
                      referrerPolicy="no-referrer" 
                      alt={project.countryName} 
                    />
                  ) : (
                    '🏳️'
                  )}
                  {project.countryName}
                </div>
                <div className="lg:col-span-3 w-full">
                  <div className="flex items-center gap-2">
                    <span className="lg:hidden text-[10px] uppercase font-bold text-zinc-300 mr-1">Status:</span>
                    <div className={`w-3 h-3 rounded-full shrink-0 ${status.color}`}></div>
                    <span className="text-xs text-zinc-500 font-medium">{status.text}</span>
                  </div>
                </div>
                <div className="lg:col-span-2 flex justify-start w-full pt-1 lg:pt-0">
                  {hasFullAccess ? (
                    <button 
                      onClick={() => onSelectProject(project.id)}
                      className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#f4f4f5] text-black rounded-lg text-xs font-medium transition-colors hover:bg-[#005173] hover:text-white group whitespace-nowrap"
                    >
                      <ClipboardCheck className="w-4 h-4 text-black group-hover:text-white transition-colors" />
                      {project.validatedByTTLDate 
                        ? 'See validation' 
                        : project.isPrefilledByTeam 
                          ? 'See prefilling' 
                          : 'Start prefilling'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => onSelectProject(project.id)}
                      className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#f4f4f5] text-black rounded-lg text-xs font-medium transition-colors hover:bg-[#005173] hover:text-white group whitespace-nowrap"
                    >
                      <ClipboardCheck className="w-4 h-4 text-black group-hover:text-white transition-colors" />
                      {project.validatedByTTLDate ? 'See validation' : 'Start validation'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </motion.div>
  );
}
