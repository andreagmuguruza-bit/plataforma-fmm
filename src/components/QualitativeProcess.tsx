import React, { useState } from 'react';
import { Project, User } from '../types';
import { ArrowLeft, TrendingUp, Edit2, Check, Send, RotateCcw, History, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { usePortfolioData } from '../hooks/usePortfolioData';

const getDotColor = (status: string) => {
  const s = String(status || '').toUpperCase().trim();
  if (s === 'SATISFACTORY') return '#4CAF50';
  if (s === 'ALERT') return '#FFC107';
  if (s === 'PROBLEM') return '#F44336';
  return '#9CA3AF'; // N/A
};

const getDotIcon = (status: string) => {
  const s = String(status || '').toUpperCase();
  if (s.includes('SATISFACTORY')) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
  }
  if (s.includes('ALERT')) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
  }
  if (s.includes('PROBLEM')) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
  }
  return null;
};

const getLineColor = (s1: string, s2: string) => {
  const c1 = getDotColor(s1);
  const c2 = getDotColor(s2);
  if (c1 === '#4CAF50' && c2 === '#4CAF50') return '#4CAF50';
  if (c1 === '#9CA3AF' || c2 === '#9CA3AF') return '#D1D5DB';
  if (c1 === '#F44336' || c2 === '#F44336') return '#F44336';
  return '#FFC107';
};

interface QualitativeProcessProps {
  project: Project;
  onBack: () => void;
  onUpdate: (project: Project) => void;
  currentUser: User;
}

export default function QualitativeProcess({ project, onBack, onUpdate, currentUser }: QualitativeProcessProps) {
  const { getProjectDetails } = usePortfolioData();
  const details = getProjectDetails(project.id);
  
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

  const [data, setData] = useState({
    estadoImplementacion: project.qualitativeData?.estadoImplementacion || [],
    productosDestacados: project.qualitativeData?.productosDestacados || [],
    probabilidadObjetivos: project.qualitativeData?.probabilidadObjetivos || [],
    accionesSugeridas: project.qualitativeData?.accionesSugeridas || [],
    fechaEvaluacionIntermedia: project.qualitativeData?.fechaEvaluacionIntermedia || '',
    fechaTalleresArranque: project.qualitativeData?.fechaTalleresArranque || '',
    temasCriticosSimulador: project.qualitativeData?.temasCriticosSimulador || '',
    verificadorContenidos: project.qualitativeData?.verificadorContenidos || '',
  });

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = (section: string) => {
    if (editingSection === section) {
      setEditingSection(null);
    } else {
      setEditingSection(section);
    }
  };

  const handleEditAll = () => {
    setIsEditing(true);
    setJustSubmitted(false);
  };

  const handleSend = () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    const updatedProject: Project = {
      ...project,
      qualitativeData: data
    };

    if (currentUser.role === 'EFFECTIVENESS_TEAM') {
      updatedProject.isPrefilledByTeam = true;
      updatedProject.validatedByTTLDate = null; // Reverts to Pending TTL validation if it was validated
    } else if (currentUser.role === 'TTL') {
      updatedProject.validatedByTTLDate = formattedDate;
    }
    
    onUpdate(updatedProject);

    setJustSubmitted(true);
    setIsEditing(false);
    setEditingSection(null);
  };

  const isSubmitted = currentUser.role === 'EFFECTIVENESS_TEAM' ? project.isPrefilledByTeam : !!project.validatedByTTLDate;

  const SectionHeader = ({ title, sectionId }: { title: string, sectionId: string }) => (
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-sm font-bold text-zinc-900">{title}</h4>
      {(!isSubmitted || isEditing) && (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleEdit(sectionId)}
            className={`p-1.5 rounded-md transition-colors ${editingSection === sectionId ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'}`}
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {(isSubmitted && !isEditing) && (
        <div className="p-1.5 rounded-md text-zinc-400">
          {/* No check icon for validated sections as per request */}
        </div>
      )}
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Projects
        </button>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl md:text-[18px] font-semibold tracking-tight text-black leading-tight">{project.name}</h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-zinc-500 font-medium mt-1">
              <span>{project.id}</span>
              {project.operationNumber && (
                <>
                  <span className="hidden sm:inline">|</span>
                  <span className="whitespace-pre-line">{project.operationNumber}</span>
                </>
              )}
              <span className="hidden sm:inline">|</span>
              <span className="flex items-center gap-1">
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
              </span>
              <span className="hidden sm:inline">|</span>
              <span>TTL: {project.ttl}</span>
              <span className="hidden sm:inline">|</span>
              <span className="flex items-center gap-1.5">
                Status: {project.status}
              </span>
              <span className="hidden sm:inline">|</span>
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                PMR March Cycle 2026: 
                <span 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ 
                    backgroundColor: 
                      project.metadata.pmr2026?.status === 'Satisfactory' ? '#4CAF50' : 
                      project.metadata.pmr2026?.status === 'Alert' ? '#FFC107' : 
                      project.metadata.pmr2026?.status === 'Problem' ? '#F44336' : '#9CA3AF' 
                  }}
                ></span> 
                {project.metadata.pmr2026?.status || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PMR Performance Section - Synced from Project View */}
      {details && details.pmrHistory && details.pmrHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-zinc-900" />
              <h3 className="text-base font-semibold tracking-tight uppercase">PMR Performance History</h3>
            </div>
          </div>
          
          <div className="p-4 sm:p-8">
            <div className="bg-zinc-50 rounded-2xl border border-zinc-100 p-6 sm:p-10 flex items-center justify-center min-h-[160px]">
              <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
                {/* Desktop View */}
                <div className="hidden lg:grid grid-cols-[160px_1fr] gap-y-10 items-center">
                  {/* Years Row */}
                  <div className="text-sm font-bold text-zinc-900 leading-tight">Year</div>
                  <div className="flex items-center w-full px-4 justify-between">
                    {details.pmrHistory.map((item) => (
                      <div key={item.year} className="w-6 flex justify-center">
                        <span className="text-[12px] font-bold text-zinc-900">{item.year}</span>
                      </div>
                    ))}
                  </div>

                  {/* Auto-calculated Classification */}
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-zinc-900 leading-tight">Auto-calculated Classification</span>
                  </div>
                  <div className="flex items-center w-full px-4 justify-between">
                    {details.pmrHistory.map((item, index, array) => (
                      <React.Fragment key={item.year}>
                        <div className="w-6 flex justify-center">
                          <div className="relative group">
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm cursor-help transition-transform duration-200 group-hover:scale-110 ring-[2px] ring-zinc-50 relative z-10"
                              style={{ backgroundColor: getDotColor(item.autoCalculatedStatus) }}
                            >
                              {getDotIcon(item.autoCalculatedStatus)}
                            </div>
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-20">
                              {item.autoCalculatedStatus}
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45" />
                            </div>
                          </div>
                        </div>
                        {index < array.length - 1 && (
                          <div 
                            className="flex-1 h-[2px] mx-0.5 min-w-[4px]"
                            style={{ backgroundColor: getLineColor(item.autoCalculatedStatus, array[index+1].autoCalculatedStatus) }}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Validated Classification */}
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-zinc-900 leading-tight">Validated Classification</span>
                  </div>
                  <div className="flex items-center w-full px-4 justify-between">
                    {details.pmrHistory.map((item, index, array) => (
                      <React.Fragment key={item.year}>
                        <div className="w-6 flex justify-center">
                          <div className="relative group">
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm cursor-help transition-transform duration-200 group-hover:scale-110 ring-[2px] ring-zinc-50 relative z-10"
                              style={{ backgroundColor: getDotColor(item.validatedStatus) }}
                            >
                              {getDotIcon(item.validatedStatus)}
                            </div>
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-20">
                              {item.hoverText}: {item.validatedStatus}
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 rotate-45" />
                            </div>
                          </div>
                        </div>
                        {index < array.length - 1 && (
                          <div 
                            className="flex-1 h-[2px] mx-0.5 min-w-[4px]"
                            style={{ backgroundColor: getLineColor(item.validatedStatus, array[index+1].validatedStatus) }}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Mobile View */}
                <div className="grid lg:hidden grid-cols-3 gap-y-4 gap-x-2 items-center text-center">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Year</div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Auto</div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Validated</div>
                  
                  {details.pmrHistory.map((item) => (
                    <React.Fragment key={item.year}>
                      <div className="text-xs font-bold text-zinc-900">{item.year}</div>
                      <div className="flex justify-center">
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white shadow-sm ring-1 ring-zinc-100"
                          style={{ backgroundColor: getDotColor(item.autoCalculatedStatus) }}
                        >
                          {getDotIcon(item.autoCalculatedStatus)}
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white shadow-sm ring-1 ring-zinc-100"
                          style={{ backgroundColor: getDotColor(item.validatedStatus) }}
                        >
                          {getDotIcon(item.validatedStatus)}
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-4 sm:p-8">
        <div className="flex items-start lg:items-center gap-2 mb-4">
          <p className="text-sm text-zinc-600 flex flex-col lg:flex-row lg:items-center">
            <span className="font-bold text-black uppercase">QUALITATIVE INFORMATION</span>
            <span className="hidden lg:inline mx-1.5">|</span> 
            <span className="inline-flex items-center gap-1.5 mt-1 lg:mt-0">
              <span className={`w-2 h-2 rounded-full ${project.validatedByTTLDate ? 'bg-[#4EA72E]' : 'bg-yellow-400'}`}></span>
              <span className="italic">
                {project.validatedByTTLDate 
                  ? `Validated by the TTL on ${project.validatedByTTLDate}` 
                  : project.isPrefilledByTeam 
                    ? 'Pending TTL validation' 
                    : 'Pending Effectiveness Team prefilling'}
              </span>
            </span>
          </p>
        </div>

        <div className="bg-zinc-50 p-4 sm:p-6 rounded-2xl border border-zinc-200 space-y-8">
          <div className="space-y-6">
            {/* Estado Implementación */}
            <div className={`p-4 rounded-xl border transition-colors ${isSubmitted && !isEditing ? 'bg-zinc-100 border-zinc-200' : 'bg-white border-zinc-100'}`}>
              <SectionHeader title="Estado de implementación / Principales riesgos" sectionId="estadoImplementacion" />
              {editingSection === 'estadoImplementacion' ? (
                <textarea 
                  className="w-full text-sm border border-zinc-200 rounded px-2 py-1 h-32"
                  value={data.estadoImplementacion.join('\n')}
                  placeholder=""
                  onChange={e => setData({...data, estadoImplementacion: e.target.value.split('\n')})}
                />
              ) : (
                <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
                  {data.estadoImplementacion.length > 0 && data.estadoImplementacion[0] !== '' ? (
                    data.estadoImplementacion.map((item, i) => <li key={i}>{item}</li>)
                  ) : (
                    <li className="list-none">&nbsp;</li>
                  )}
                </ul>
              )}
            </div>

            {/* Productos Destacados */}
            <div className={`p-4 rounded-xl border transition-colors ${isSubmitted && !isEditing ? 'bg-zinc-100 border-zinc-200' : 'bg-white border-zinc-100'}`}>
              <SectionHeader title="Productos destacados/innovadores del proyecto" sectionId="productosDestacados" />
              {editingSection === 'productosDestacados' ? (
                <textarea 
                  className="w-full text-sm border border-zinc-200 rounded px-2 py-1 h-32"
                  value={data.productosDestacados.join('\n')}
                  placeholder=""
                  onChange={e => setData({...data, productosDestacados: e.target.value.split('\n')})}
                />
              ) : (
                <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
                  {data.productosDestacados.length > 0 && data.productosDestacados[0] !== '' ? (
                    data.productosDestacados.map((item, i) => <li key={i}>{item}</li>)
                  ) : (
                    <li className="list-none">&nbsp;</li>
                  )}
                </ul>
              )}
            </div>

            {/* Probabilidad Objetivos */}
            <div className={`p-4 rounded-xl border transition-colors ${isSubmitted && !isEditing ? 'bg-zinc-100 border-zinc-200' : 'bg-white border-zinc-100'}`}>
              <SectionHeader title="Probabilidad de alcanzar objetivos de desarrollo / Temas a considerar en el PCR" sectionId="probabilidadObjetivos" />
              {editingSection === 'probabilidadObjetivos' ? (
                <textarea 
                  className="w-full text-sm border border-zinc-200 rounded px-2 py-1 h-32"
                  value={data.probabilidadObjetivos.join('\n')}
                  placeholder=""
                  onChange={e => setData({...data, probabilidadObjetivos: e.target.value.split('\n')})}
                />
              ) : (
                <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
                  {data.probabilidadObjetivos.length > 0 && data.probabilidadObjetivos[0] !== '' ? (
                    data.probabilidadObjetivos.map((item, i) => <li key={i}>{item}</li>)
                  ) : (
                    <li className="list-none">&nbsp;</li>
                  )}
                </ul>
              )}
            </div>

            {/* Acciones Sugeridas */}
            <div className={`p-4 rounded-xl border transition-colors ${isSubmitted && !isEditing ? 'bg-zinc-100 border-zinc-200' : 'bg-white border-zinc-100'}`}>
              <SectionHeader title="Acciones sugeridas / Pedidos" sectionId="accionesSugeridas" />
              {editingSection === 'accionesSugeridas' ? (
                <textarea 
                  className="w-full text-sm border border-zinc-200 rounded px-2 py-1 h-32"
                  value={data.accionesSugeridas.join('\n')}
                  placeholder=""
                  onChange={e => setData({...data, accionesSugeridas: e.target.value.split('\n')})}
                />
              ) : (
                <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
                  {data.accionesSugeridas.length > 0 && data.accionesSugeridas[0] !== '' ? (
                    data.accionesSugeridas.map((item, i) => <li key={i}>{item}</li>)
                  ) : (
                    <li className="list-none">&nbsp;</li>
                  )}
                </ul>
              )}
            </div>

            {/* Fecha evaluación intermedia */}
            <div className={`p-4 rounded-xl border transition-colors ${isSubmitted && !isEditing ? 'bg-zinc-100 border-zinc-200' : 'bg-white border-zinc-100'}`}>
              <SectionHeader title="Fecha evaluación intermedia" sectionId="fechaEvaluacionIntermedia" />
              {editingSection === 'fechaEvaluacionIntermedia' ? (
                <input 
                  type="text"
                  className="w-full text-sm border border-zinc-200 rounded px-2 py-2"
                  value={data.fechaEvaluacionIntermedia}
                  placeholder="Enter date..."
                  onChange={e => setData({...data, fechaEvaluacionIntermedia: e.target.value})}
                />
              ) : (
                <p className="text-sm text-zinc-700 whitespace-pre-wrap px-1">
                  {data.fechaEvaluacionIntermedia || <span className="text-zinc-400 italic">No information available</span>}
                </p>
              )}
            </div>

            {/* Fecha talleres de arranque */}
            <div className={`p-4 rounded-xl border transition-colors ${isSubmitted && !isEditing ? 'bg-zinc-100 border-zinc-200' : 'bg-white border-zinc-100'}`}>
              <SectionHeader title="Fecha talleres de arranque" sectionId="fechaTalleresArranque" />
              {editingSection === 'fechaTalleresArranque' ? (
                <input 
                  type="text"
                  className="w-full text-sm border border-zinc-200 rounded px-2 py-2"
                  value={data.fechaTalleresArranque}
                  placeholder="Enter date..."
                  onChange={e => setData({...data, fechaTalleresArranque: e.target.value})}
                />
              ) : (
                <p className="text-sm text-zinc-700 whitespace-pre-wrap px-1">
                  {data.fechaTalleresArranque || <span className="text-zinc-400 italic">No information available</span>}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6">
          {justSubmitted && (
            <div className="bg-[#4EA72E]/10 text-zinc-600 px-8 py-3 rounded-lg font-medium text-sm border border-[#4EA72E]/20 shadow-sm">
              {currentUser.role === 'EFFECTIVENESS_TEAM' ? 'Thanks for your submission!' : 'Thanks for your validation!'}
            </div>
          )}

          {(isSubmitted && !isEditing) && (
            <button 
              onClick={handleEditAll}
              className="flex items-center gap-2 bg-white text-[#005173] px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-zinc-100 transition-colors border border-[#005173]"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          )}

          {(!isSubmitted || isEditing) && (
            <div className="w-full flex justify-end">
              <button 
                onClick={handleSend}
                className="flex items-center gap-2 bg-[#005173] text-white px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-[#003d57] transition-colors shadow-md"
              >
                <Send className="w-4 h-4" />
                {currentUser.role === 'EFFECTIVENESS_TEAM' ? 'SAVE PREFILLING' : 'SAVE VALIDATION'}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
