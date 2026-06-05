import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronsUpDown, Filter } from 'lucide-react';

interface RowData {
  proyecto: string;
  relevancia: { code: 'E' | 'S' | 'PI' | 'I'; text: string };
  efectividad: { code: 'E' | 'S' | 'PI' | 'I'; text: string };
  eficiencia: { code: 'E' | 'S' | 'PI' | 'I' | 'NA'; text: string };
  sostenibilidad: { code: 'E' | 'S' | 'PI' | 'I'; text: string };
  mejorGlobal: { code: 'AS' | 'S' | 'PS' | 'PI' | 'I'; text: string };
  peorGlobal: { code: 'AS' | 'S' | 'PS' | 'PI' | 'I'; text: string };
  observaciones: string;
}

export default function ClosureTable() {
  const data: RowData[] = [
    {
      proyecto: 'SU-L1050',
      relevancia: { code: 'E', text: 'Excelente' },
      efectividad: { code: 'S', text: 'Satisfactorio' },
      eficiencia: { code: 'E', text: 'Excelente' },
      sostenibilidad: { code: 'E', text: 'Excelente' },
      mejorGlobal: { code: 'AS', text: 'Altamente satisfactorio' },
      peorGlobal: { code: 'PS', text: 'Parcialmente satisfactorio' },
      observaciones: 'Hay un indicador no relevante (producto no pagado por el proyecto) cuyo logro es ahora “NA”, pero puede pasar a ser “0”',
    },
    {
      proyecto: 'PR-L1175 | PR-L1179',
      relevancia: { code: 'E', text: 'Excelente' },
      efectividad: { code: 'S', text: 'Satisfactorio' },
      eficiencia: { code: 'NA', text: 'No aplica' },
      sostenibilidad: { code: 'E', text: 'Excelente' },
      mejorGlobal: { code: 'S', text: 'Satisfactorio' },
      peorGlobal: { code: 'PS', text: 'Parcialmente satisfactorio' },
      observaciones: 'Depende de la validación de los ajustes metodológicos en los indicadores de dos objetivos específicos',
    },
    {
      proyecto: 'UR-L1111',
      relevancia: { code: 'E', text: 'Excelente' },
      efectividad: { code: 'S', text: 'Satisfactorio' },
      eficiencia: { code: 'S', text: 'Satisfactorio' },
      sostenibilidad: { code: 'E', text: 'Excelente' },
      mejorGlobal: { code: 'S', text: 'Satisfactorio' },
      peorGlobal: { code: 'S', text: 'Satisfactorio' },
      observaciones: 'Es necesario hacer, y se hizo la solicitud al INE, de datos para medir el indicador R4.1 (valores de predios)',
    },
    {
      proyecto: 'CO-L1283',
      relevancia: { code: 'E', text: 'Excelente' },
      efectividad: { code: 'S', text: 'Satisfactorio' },
      eficiencia: { code: 'NA', text: 'No aplica' },
      sostenibilidad: { code: 'E', text: 'Excelente' },
      mejorGlobal: { code: 'S', text: 'Satisfactorio' },
      peorGlobal: { code: 'PI', text: 'Parcialmente infructuoso' },
      observaciones: 'Es necesario hacer , y se está trabajando en, la solicitud de información para 3 de 5 indicadores de resultado',
    },
    {
      proyecto: 'DR-L1117',
      relevancia: { code: 'E', text: 'Excelente' },
      efectividad: { code: 'PI', text: 'Parcialmente insatisfactorio' },
      eficiencia: { code: 'E', text: 'Excelente' },
      sostenibilidad: { code: 'E', text: 'Excelente' },
      mejorGlobal: { code: 'PS', text: 'Parcialmente satisfactorio' },
      peorGlobal: { code: 'PI', text: 'Parcialmente infructuoso' },
      observaciones: 'Es necesario no cuestionar la atribución del indicador de recaudo a las actividades del proyecto para mantener el puntaje de eficiencia y efectividad',
    },
    {
      proyecto: 'EC-L1230',
      relevancia: { code: 'S', text: 'Satisfactorio' },
      efectividad: { code: 'PI', text: 'Parcialmente insatisfactorio' },
      eficiencia: { code: 'I', text: 'Insatisfactorio' },
      sostenibilidad: { code: 'S', text: 'Satisfactorio' },
      mejorGlobal: { code: 'PI', text: 'Parcialmente infructuoso' },
      peorGlobal: { code: 'I', text: 'Infructuoso' },
      observaciones: 'Debido a la cancelación parcial, no se implementaron productos relevantes para logro de resultados',
    },
  ];

  // State for sorting & filtering
  const [projectFilters, setProjectFilters] = useState<string[]>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Close filter dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isFilterOpen && !(e.target as Element).closest('.project-filter-dropdown')) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  // Unique project identifiers for filter options
  const uniqueProjects = useMemo(() => {
    const set = new Set<string>();
    data.forEach(item => {
      // split by | just to have unique individual project ids or full string
      set.add(item.proyecto);
    });
    return Array.from(set).sort();
  }, []);

  const handleSort = () => {
    if (sortDirection === null) {
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortDirection(null);
    }
  };

  const toggleProjectFilter = (proj: string) => {
    setProjectFilters(prev => {
      if (prev.includes(proj)) {
        return prev.filter(p => p !== proj);
      } else {
        return [...prev, proj];
      }
    });
  };

  // Filter and sort computation
  const sortedAndFilteredData = useMemo(() => {
    let result = [...data];

    // Filter
    if (projectFilters.length > 0) {
      result = result.filter(row => projectFilters.includes(row.proyecto));
    }

    // Sort
    if (sortDirection) {
      result.sort((a, b) => {
        if (sortDirection === 'asc') {
          return a.proyecto.localeCompare(b.proyecto);
        } else {
          return b.proyecto.localeCompare(a.proyecto);
        }
      });
    }

    return result;
  }, [projectFilters, sortDirection]);

  // Styles matches user alerts (Yellow is bg-amber-100 text-black border-transparent)
  // Let's pair color styles to be polished:
  const colStyles: Record<string, { bg: string; text: string; border: string }> = {
    E: { bg: 'bg-[#009a4e]', text: 'text-white border-transparent', border: 'border-zinc-200' }, // Dark Green (Excelente)
    AS: { bg: 'bg-[#009a4e]', text: 'text-white border-transparent', border: 'border-zinc-200' }, // Dark Green (Altamente Satisfactorio)
    S: { bg: 'bg-[#7cbf46]', text: 'text-white border-transparent', border: 'border-zinc-200' }, // Medium Green (Satisfactorio)
    PS: { bg: 'bg-[#a3e635]', text: 'text-zinc-900 border-transparent', border: 'border-zinc-200' }, // Light Green (Parcialmente Satisfactorio)
    PI: { bg: 'bg-[#ffb300]', text: 'text-black', border: 'border-transparent' }, // Alerts Solid Yellow (0% opacity, hex #ffb300), text black and no border
    I: { bg: 'bg-[#e60000]', text: 'text-white border-transparent', border: 'border-zinc-200' }, // Red (Insatisfactorio/Infructuoso)
    NA: { bg: 'bg-zinc-100', text: 'text-zinc-500 border-transparent', border: 'border-zinc-200' }, // Off-white (No aplica)
  };

  const renderCell = (cell: { code: string; text: string }) => {
    const style = colStyles[cell.code] || colStyles.NA;
    return (
      <div className="relative group flex items-center justify-center w-full h-full min-h-[46px] transition-all duration-150">
        <div 
          className={`w-full py-2.5 px-2 flex items-center justify-center font-bold text-xs border rounded-md shadow-xs transition-transform duration-100 group-hover:scale-[1.03] select-none cursor-help ${style.bg} ${style.text} ${style.border}`}
        >
          {cell.code}
        </div>
        
        {/* Tooltip visible on hover */}
        <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none transition-all duration-200">
          <div className="bg-zinc-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded shadow-md whitespace-nowrap border border-zinc-750">
            {cell.text}
          </div>
          <div className="w-1.5 h-1.5 bg-zinc-900 border-r border-b border-zinc-750 rotate-45 -mt-1"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full mt-6 flex flex-col gap-6">
      {/* Table Container styled strictly matching Dashboard tables */}
      <div className="bg-white rounded-none sm:rounded-xl shadow-sm border-y sm:border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-spacing-0 min-w-[1000px]">
            <thead className="bg-zinc-100 border-b-2 border-zinc-200 text-[10px] font-bold text-zinc-900 uppercase tracking-wider">
              {/* Header Row 1 */}
              <tr>
                <th rowSpan={2} className="px-3 py-3 text-center text-zinc-400 font-bold text-[10px] w-12 border-r border-zinc-200 align-middle">
                  N
                </th>
                
                {/* Column "Proyecto" with custom styled Filter & Sort matching Dashboard.tsx */}
                <th rowSpan={2} className="px-4 py-3 text-left min-w-[190px] border-r border-zinc-200 relative project-filter-dropdown align-middle">
                  <div className="flex items-center justify-between gap-1.5">
                    <span>PROYECTO</span>
                    <div className="flex items-center gap-1">
                      {/* Sort button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSort();
                        }}
                        className={`p-1 rounded hover:bg-zinc-250 transition-colors ${sortDirection ? 'text-[#005173]' : 'text-zinc-500'}`}
                        title="Ordenar"
                      >
                        <ChevronsUpDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Filter button */}
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsFilterOpen(!isFilterOpen);
                          }}
                          className={`p-1 rounded hover:bg-zinc-250 transition-colors ${projectFilters.length > 0 ? 'text-[#005173] bg-zinc-200/50' : 'text-zinc-500'}`}
                          title="Filtrar"
                        >
                          <Filter className="w-3.5 h-3.5" />
                        </button>

                        <AnimatePresence>
                          {isFilterOpen && (
                            <motion.div 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.15 }}
                              className="absolute top-full right-0 mt-2 w-52 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 py-2.5 flex flex-col font-normal normal-case text-xs text-zinc-800"
                            >
                              <div className="px-3 pb-2 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 -mt-1 rounded-t-lg">
                                <span className="font-bold text-zinc-500 text-[10px] uppercase">Filtrar Proyecto</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProjectFilters([]);
                                  }}
                                  className="text-[10px] text-[#005173] hover:underline font-semibold"
                                >
                                  Limpiar
                                </button>
                              </div>
                              <div className="p-1 px-2 flex flex-col gap-0.5 overflow-y-auto max-h-48 mt-1">
                                {uniqueProjects.map(proj => (
                                  <label 
                                    key={proj} 
                                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-zinc-50 cursor-pointer select-none transition-colors"
                                  >
                                    <input 
                                      type="checkbox" 
                                      checked={projectFilters.includes(proj)}
                                      onChange={() => toggleProjectFilter(proj)}
                                      className="rounded border-zinc-300 text-[#005173] focus:ring-[#005173] w-3.5 h-3.5"
                                    />
                                    <span className="font-medium text-zinc-700 truncate">{proj}</span>
                                  </label>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </th>

                {/* Criteria Header Section */}
                <th colSpan={4} className="px-4 py-3 text-center border-r border-zinc-200 bg-zinc-50/50 text-zinc-700 font-bold">
                  Mejor calificación (Criterios)
                </th>

                {/* Subtly colored vertical spacer column */}
                <th className="w-[1%] p-0 bg-zinc-50 border-r border-zinc-200"></th>

                {/* Global Mejor Qualification */}
                <th className="px-4 py-3 text-center border-r border-zinc-200 bg-zinc-50/50 text-zinc-700 font-bold">
                  Mejor calificación (Global)
                </th>

                {/* Visual partition spacer */}
                <th className="w-[1%] p-0 bg-zinc-50 border-r border-zinc-200"></th>

                {/* Global Peor Qualification */}
                <th className="px-4 py-3 text-center border-r border-zinc-200 bg-zinc-50/50 text-zinc-700 font-bold">
                  Peor calificación (Global)
                </th>

                {/* Observaciones column header */}
                <th rowSpan={2} className="px-4 py-3 text-left w-[30%] align-middle border-l border-zinc-200">
                  Observaciones (posible bajada de puntaje)
                </th>
              </tr>

              {/* Header Row 2 */}
              <tr className="bg-zinc-50 border-t border-zinc-200 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                {/* Columns N and PROYECTO are handled via rowSpan={2} inside Row 1 */}
                
                {/* Individual criteria */}
                <th className="px-2 py-2 text-center border-r border-zinc-200 font-semibold text-zinc-500 bg-zinc-50/20">Relevancia</th>
                <th className="px-2 py-2 text-center border-r border-zinc-200 font-semibold text-zinc-500 bg-zinc-50/20">Efectividad</th>
                <th className="px-2 py-2 text-center border-r border-zinc-200 font-semibold text-zinc-500 bg-zinc-50/20">Eficiencia</th>
                <th className="px-2 py-2 text-center border-r border-zinc-200 font-semibold text-zinc-500 bg-zinc-50/20">Sostenibilidad</th>
                
                {/* Spacer header */}
                <th className="p-0 border-r border-zinc-200 bg-zinc-50"></th>

                {/* Global elements */}
                <th className="px-2 py-2 text-center border-r border-zinc-200 font-semibold text-zinc-500 bg-zinc-50/20">Global</th>

                {/* Spacer header */}
                <th className="p-0 border-r border-zinc-200 bg-zinc-50"></th>

                {/* Global elements */}
                <th className="px-2 py-2 text-center border-r border-zinc-200 font-semibold text-zinc-500 bg-zinc-50/20">Global</th>

                {/* Column Observaciones is handled via rowSpan={2} inside Row 1 */}
              </tr>
            </thead>

            {/* Table Body matching standard table row alignments */}
            <tbody className="divide-y divide-zinc-200 text-[11px] font-sans">
              {sortedAndFilteredData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-zinc-400 font-medium bg-zinc-50/50">
                    No se encontraron proyectos con los filtros seleccionados
                  </td>
                </tr>
              ) : (
                sortedAndFilteredData.map((row, index) => (
                  <tr 
                    key={row.proyecto} 
                    className="hover:bg-zinc-50/50 transition-colors duration-150 cursor-default"
                  >
                    {/* Sequence index */}
                    <td className="px-3 py-3 text-center text-zinc-400 font-medium text-[10px] border-r border-zinc-200">
                      {index + 1}
                    </td>

                    {/* Project Identifier styled bold */}
                    <td className="px-4 py-3 font-semibold text-zinc-900 text-xs tracking-tight border-r border-zinc-200 whitespace-nowrap bg-zinc-50/10">
                      {row.proyecto}
                    </td>

                    {/* Criteria cells (bg-emerald-50/5 matches beautiful dashboard tints) */}
                    <td className="p-1.5 border-r border-zinc-200 align-middle">
                      {renderCell(row.relevancia)}
                    </td>
                    <td className="p-1.5 border-r border-zinc-200 align-middle">
                      {renderCell(row.efectividad)}
                    </td>
                    <td className="p-1.5 border-r border-zinc-200 align-middle">
                      {renderCell(row.eficiencia)}
                    </td>
                    <td className="p-1.5 border-r border-zinc-200 align-middle">
                      {renderCell(row.sostenibilidad)}
                    </td>

                    {/* Spacer partition strip */}
                    <td className="p-0 border-r border-zinc-200 bg-zinc-50"></td>

                    {/* Mejor Global */}
                    <td className="p-1.5 border-r border-zinc-200 align-middle">
                      {renderCell(row.mejorGlobal)}
                    </td>

                    {/* Spacer partition strip */}
                    <td className="p-0 border-r border-zinc-200 bg-zinc-50"></td>

                    {/* Peor Global */}
                    <td className="p-1.5 border-r border-zinc-200 align-middle">
                      {renderCell(row.peorGlobal)}
                    </td>

                    {/* Observations text block nicely flowing with details */}
                    <td className="px-4 py-3 align-middle text-zinc-700 text-xs font-normal leading-relaxed">
                      {row.observaciones}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Styled legends mimicking pure white Dashboard cards with small colored pill alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
        {/* Left Legend: Calificación Criterios */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs hover:border-zinc-300 transition-all">
          <h3 className="text-xs font-bold text-zinc-800 mb-3.5 tracking-wider uppercase">
            Calificación criterios:
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded bg-[#009a4e] flex-shrink-0 shadow-xs"></span>
              <span className="text-xs font-semibold text-zinc-700">E: Excelente</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded bg-[#7cbf46] flex-shrink-0 shadow-xs"></span>
              <span className="text-xs font-semibold text-zinc-700">S: Satisfactorio</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded bg-[#ffb300] flex-shrink-0 shadow-xs"></span>
              <span className="text-xs font-semibold text-zinc-700">PI: Parcialmente insatisfactorio</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded bg-[#e60000] flex-shrink-0 shadow-xs"></span>
              <span className="text-xs font-semibold text-zinc-700">I: Insatisfactorio</span>
            </div>
          </div>
        </div>

        {/* Right Legend: Calificación Global */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs hover:border-zinc-300 transition-all">
          <h3 className="text-xs font-bold text-zinc-800 mb-3.5 tracking-wider uppercase">
            Calificación global:
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded bg-[#009a4e] flex-shrink-0 shadow-xs"></span>
              <span className="text-xs font-semibold text-zinc-700">AS: Altamente satisfactorio</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded bg-[#7cbf46] flex-shrink-0 shadow-xs"></span>
              <span className="text-xs font-semibold text-zinc-700">S: Satisfactorio</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded bg-[#a3e635] flex-shrink-0 shadow-xs"></span>
              <span className="text-xs font-semibold text-zinc-700">PS: Parcialmente satisfactorio</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded bg-[#ffb300] flex-shrink-0 shadow-xs"></span>
              <span className="text-xs font-semibold text-zinc-700">PI: Parcialmente infructuoso</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded bg-[#e60000] flex-shrink-0 shadow-xs"></span>
              <span className="text-xs font-semibold text-zinc-700">I: Infructuoso</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtítulo: Other projects */}
      <div className="mt-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-black">
          Other projects
        </h2>
      </div>

      {/* Tabla Otros proyectos */}
      <div className="bg-white rounded-none sm:rounded-xl shadow-sm border-y sm:border border-zinc-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-spacing-0 min-w-[800px]">
            <thead className="bg-zinc-100 border-b-2 border-zinc-200 text-[10px] font-bold text-zinc-900 uppercase tracking-wider">
              <tr>
                <th className="px-3 py-3 text-center text-zinc-400 font-bold text-[10px] w-12 border-r border-zinc-200">
                  N
                </th>
                <th className="px-4 py-3 border-r border-zinc-200 w-[15%]">
                  Proyecto
                </th>
                <th className="px-4 py-3 border-r border-zinc-200 w-[25%]">
                  Comentario
                </th>
                <th className="px-4 py-3 border-r border-zinc-200 w-[42%]">
                  Plan de acción
                </th>
                <th className="px-4 py-3 w-[18%]">
                  Logística
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-[11px] sm:text-xs font-sans text-zinc-700">
              <tr className="hover:bg-zinc-50/50 transition-colors duration-150">
                <td className="px-3 py-4 text-center text-zinc-400 font-bold border-r border-zinc-200 align-top">
                  1
                </td>
                <td className="px-4 py-4 font-bold text-zinc-900 border-r border-zinc-200 whitespace-nowrap bg-zinc-50/10 align-top">
                  AR-L1248
                </td>
                <td className="px-4 py-4 border-r border-zinc-200 leading-relaxed align-top text-zinc-700">
                  5 Objetivos Específicos (OE) sin indicadores de resultado logrados
                </td>
                <td rowSpan={2} className="px-4 py-4 border-r border-zinc-200 leading-relaxed align-top text-zinc-700 bg-white">
                  <ul className="list-disc pl-4 space-y-2">
                    <li>
                      <strong>Plan de levantamiento de información</strong> (encuestas, fuentes administrativas públicas y confidenciales) para tener información a nivel de resultados y, en peor de los casos, productos, que informan el logro de los OE
                    </li>
                    <li>
                      <strong>Objetivo:</strong> “rango positivo” del PCR publicado (no validado por OVE)
                    </li>
                    <li>
                      <strong>Acercamiento con OVE</strong> para validar el Plan para transparencia y buy-in
                    </li>
                  </ul>
                </td>
                <td rowSpan={2} className="px-4 py-4 leading-relaxed align-top text-zinc-700 bg-white">
                  Reuniones con las contrapartes, UCP, empresas consultoras, dos consultores + consultor de análisis económico
                </td>
              </tr>
              <tr className="hover:bg-zinc-50/50 transition-colors duration-150">
                <td className="px-3 py-4 text-center text-zinc-400 font-bold border-r border-zinc-200 align-top">
                  2
                </td>
                <td className="px-4 py-4 font-bold text-zinc-900 border-r border-zinc-200 whitespace-nowrap bg-zinc-50/10 align-top">
                  BR-L1377
                </td>
                <td className="px-4 py-4 border-r border-zinc-200 leading-relaxed align-top text-zinc-700">
                  se puede identificar 3-4 OE, no tiene indicadores asociados logrados para ninguno de ellos
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
