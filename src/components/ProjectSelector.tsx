import React, { useState } from 'react';
import { Project, User } from '../types';
import { ClipboardCheck, Search, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

interface ProjectSelectorProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  currentUser: User;
  selectedTTL?: string;
  selectedEffectivenessMember?: string;
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

  const filteredProjects = projects.filter(project => {
    if (currentUser.role === 'TTL') {
      return project.ttl === selectedTTL;
    }
    
    // Effectiveness Team filters
    const filterProjLower = String(filterProject || '').toLowerCase();
    const matchesProject = filterProject === '' || 
      String(project.name || '').toLowerCase().includes(filterProjLower) || 
      String(project.id || '').toLowerCase().includes(filterProjLower);
    const matchesCountry = filterCountry === '' || project.country === filterCountry;
    
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

  const uniqueCountries = Array.from(new Set(projects.map(p => p.country))).filter(Boolean).sort();
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

  const getStatusDisplay = (project: Project) => {
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
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {currentUser.role === 'EFFECTIVENESS_TEAM' ? 'PMR qualitative prefilling' : 'PMR qualitative input validation'}
        </h2>
        <p className="text-zinc-500 mt-1 whitespace-pre-line">
          {"\n"}
          Hello, {displayName}. Please, {currentUser.role === 'EFFECTIVENESS_TEAM' ? 'prefill' : 'validate'} the qualitative information about the current status of {currentUser.role === 'EFFECTIVENESS_TEAM' ? 'the' : 'your'} projects for the PMR cycle.{"\n"}
          {"\n"}
          Click on "{currentUser.role === 'EFFECTIVENESS_TEAM' ? 'Start prefilling' : 'Start validation'}" to begin the process, or click on "{currentUser.role === 'EFFECTIVENESS_TEAM' ? 'See prefilling' : 'See validation'}" to review the information submitted.
        </p>
      </div>

      {currentUser.role === 'EFFECTIVENESS_TEAM' && (
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
          {filteredProjects.map((project, idx) => {
            const status = getStatusDisplay(project);
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
                  {project.countryName && countryCodes[project.countryName] ? (
                    <img 
                      src={`https://flagcdn.com/w40/${countryCodes[project.countryName]}.png`} 
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
                  {currentUser.role === 'TTL' ? (
                    !project.isPrefilledByTeam && !project.validatedByTTLDate ? (
                      <span className="text-xs text-zinc-400 font-medium italic">No action needed</span>
                    ) : (
                      <button 
                        onClick={() => onSelectProject(project.id)}
                        className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#f4f4f5] text-black rounded-lg text-xs font-medium transition-colors hover:bg-[#005173] hover:text-white group whitespace-nowrap"
                      >
                        <ClipboardCheck className="w-4 h-4 text-black group-hover:text-white transition-colors" />
                        {project.validatedByTTLDate ? 'See validation' : 'Start validation'}
                      </button>
                    )
                  ) : (
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
