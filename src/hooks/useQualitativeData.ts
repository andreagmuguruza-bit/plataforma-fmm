import { useState, useEffect, useCallback, useRef } from 'react';
import { Project, User } from '../types';

export const GOOGLE_APPS_SCRIPT_URL = 
  (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GOOGLE_APPS_SCRIPT_URL || 
  'https://script.google.com/macros/s/AKfycbx6ZqbarSBQgr2dukCC5TclKm0YAKxAPsc2XdqVSP80DniqJ9c1LTcWzlMb6-UWUpGW/exec';

export const formatDDMMMYY = (d: Date = new Date()): string => {
  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = String(d.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
};

export interface QualitativeFormData {
  estadoImplementacion: string[];
  productosDestacados: string[];
  probabilidadObjetivos: string[];
  accionesSugeridas: string[];
  fechaEvaluacionIntermedia: string;
  fechaTalleresArranque: string;
  temasCriticosSimulador: string;
  verificadorContenidos: string;
}

export function normalizeArrayField(val: unknown, fallback: string[] = []): string[] {
  if (Array.isArray(val)) {
    return val.map(item => String(item).trim()).filter(Boolean);
  }
  if (typeof val === 'string' && val.trim()) {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed.map(item => String(item).trim()).filter(Boolean);
      }
    } catch {
      // not JSON string
    }
    const lines = val
      .split('\n')
      .map(l => l.replace(/^[-*•]\s*/, '').trim())
      .filter(Boolean);
    if (lines.length > 0) return lines;
    return [val.trim()];
  }
  return fallback;
}

export function normalizeStringField(val: unknown, fallback: string = ''): string {
  if (typeof val === 'string') return val;
  if (val !== undefined && val !== null) return String(val);
  return fallback;
}

export function parseRemoteProjectData(resJson: any, projectId: string, operationNumber?: string) {
  if (!resJson || typeof resJson !== 'object') return null;

  // 1. Exact projectId key
  let projectEntry = resJson[projectId];

  // 2. Exact operationNumber key
  if (!projectEntry && operationNumber) {
    projectEntry = resJson[operationNumber];
  }

  // 3. Normalized case-insensitive lookup
  if (!projectEntry) {
    const targetKeys = [projectId, operationNumber]
      .filter(Boolean)
      .map(k => String(k).trim().toUpperCase());
    
    const matchingKey = Object.keys(resJson).find(k =>
      targetKeys.includes(k.trim().toUpperCase())
    );
    if (matchingKey) {
      projectEntry = resJson[matchingKey];
    }
  }

  // 4. Common root containers
  if (!projectEntry) {
    projectEntry = resJson.formData || resJson.data || resJson.qualitativeData;
  }

  // 5. If resJson itself contains the fields
  if (!projectEntry && (
    'estadoImplementacion' in resJson || 
    'isPrefilledByTeam' in resJson || 
    'validatedByTTLDate' in resJson
  )) {
    projectEntry = resJson;
  }

  if (!projectEntry) return null;

  const remoteData = (
    typeof projectEntry === 'object' && 
    projectEntry !== null && 
    'formData' in projectEntry && 
    projectEntry.formData
  ) ? projectEntry.formData : projectEntry;

  return { projectEntry, remoteData };
}

export function useQualitativeData(
  project: Project,
  onUpdate?: (updatedProject: Project) => void
) {
  const [qualitativeData, setQualitativeData] = useState<QualitativeFormData>(() => ({
    estadoImplementacion: project.qualitativeData?.estadoImplementacion || [],
    productosDestacados: project.qualitativeData?.productosDestacados || [],
    probabilidadObjetivos: project.qualitativeData?.probabilidadObjetivos || [],
    accionesSugeridas: project.qualitativeData?.accionesSugeridas || [],
    fechaEvaluacionIntermedia: project.qualitativeData?.fechaEvaluacionIntermedia || '',
    fechaTalleresArranque: project.qualitativeData?.fechaTalleresArranque || '',
    temasCriticosSimulador: project.qualitativeData?.temasCriticosSimulador || '',
    verificadorContenidos: project.qualitativeData?.verificadorContenidos || '',
  }));

  const [isPrefilledByTeam, setIsPrefilledByTeam] = useState<boolean>(project.isPrefilledByTeam);
  const [validatedByTTLDate, setValidatedByTTLDate] = useState<string | null>(project.validatedByTTLDate);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const projectRef = useRef(project);
  projectRef.current = project;

  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const fetchQualitativeData = useCallback(async () => {
    const currentProj = projectRef.current;
    if (!currentProj?.id || !GOOGLE_APPS_SCRIPT_URL) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const queryUrl = `${GOOGLE_APPS_SCRIPT_URL}${GOOGLE_APPS_SCRIPT_URL.includes('?') ? '&' : '?'}action=getProject&projectId=${encodeURIComponent(currentProj.id)}&_t=${Date.now()}`;
      const response = await fetch(queryUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const resJson = await response.json();
        const parsed = parseRemoteProjectData(resJson, currentProj.id, currentProj.operationNumber);

        if (parsed && parsed.remoteData && typeof parsed.remoteData === 'object') {
          const { projectEntry, remoteData } = parsed;

          const newQualitative: QualitativeFormData = {
            estadoImplementacion: normalizeArrayField(
              remoteData.estadoImplementacion,
              currentProj.qualitativeData?.estadoImplementacion || []
            ),
            productosDestacados: normalizeArrayField(
              remoteData.productosDestacados,
              currentProj.qualitativeData?.productosDestacados || []
            ),
            probabilidadObjetivos: normalizeArrayField(
              remoteData.probabilidadObjetivos,
              currentProj.qualitativeData?.probabilidadObjetivos || []
            ),
            accionesSugeridas: normalizeArrayField(
              remoteData.accionesSugeridas,
              currentProj.qualitativeData?.accionesSugeridas || []
            ),
            fechaEvaluacionIntermedia: normalizeStringField(
              remoteData.fechaEvaluacionIntermedia,
              currentProj.qualitativeData?.fechaEvaluacionIntermedia || ''
            ),
            fechaTalleresArranque: normalizeStringField(
              remoteData.fechaTalleresArranque,
              currentProj.qualitativeData?.fechaTalleresArranque || ''
            ),
            temasCriticosSimulador: normalizeStringField(
              remoteData.temasCriticosSimulador,
              currentProj.qualitativeData?.temasCriticosSimulador || ''
            ),
            verificadorContenidos: normalizeStringField(
              remoteData.verificadorContenidos,
              currentProj.qualitativeData?.verificadorContenidos || ''
            ),
          };

          const rawPrefilled = remoteData.isPrefilledByTeam ?? (projectEntry && projectEntry.isPrefilledByTeam) ?? resJson.isPrefilledByTeam;
          const rawValidated = remoteData.validatedByTTLDate ?? (projectEntry && projectEntry.validatedByTTLDate) ?? resJson.validatedByTTLDate;

          const resolvedPrefilled = rawPrefilled !== undefined
            ? (rawPrefilled === true || rawPrefilled === 'true' || rawPrefilled === 'TRUE' || rawPrefilled === 1)
            : currentProj.isPrefilledByTeam;

          const resolvedValidated = rawValidated !== undefined
            ? (rawValidated && String(rawValidated).trim() !== '' && String(rawValidated).toLowerCase() !== 'null' ? String(rawValidated) : null)
            : currentProj.validatedByTTLDate;

          setQualitativeData(newQualitative);
          setIsPrefilledByTeam(resolvedPrefilled);
          setValidatedByTTLDate(resolvedValidated);

          const updated: Project = {
            ...currentProj,
            isPrefilledByTeam: resolvedPrefilled,
            validatedByTTLDate: resolvedValidated,
            qualitativeData: newQualitative
          };

          if (onUpdateRef.current) {
            onUpdateRef.current(updated);
          }
        }
      } else {
        setError(`Failed to fetch from Google Apps Script (HTTP ${response.status})`);
      }
    } catch (err: any) {
      console.warn('Notice: Error fetching qualitative data from Google Apps Script:', err);
      setError(err?.message || 'Error fetching qualitative data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch whenever project.id changes
  useEffect(() => {
    fetchQualitativeData();
  }, [project.id, fetchQualitativeData]);

  const saveData = useCallback(async ({
    qualitativeDataToSave,
    currentUser,
    formattedDate
  }: {
    qualitativeDataToSave: QualitativeFormData;
    currentUser: User;
    formattedDate: string;
  }) => {
    const currentProj = projectRef.current;
    setIsSaving(true);

    const updatedProject: Project = {
      ...currentProj,
      qualitativeData: { ...qualitativeDataToSave }
    };

    if (currentUser.role === 'EFFECTIVENESS_TEAM') {
      updatedProject.isPrefilledByTeam = true;
      updatedProject.validatedByTTLDate = null;
    } else if (currentUser.role === 'TTL') {
      updatedProject.isPrefilledByTeam = true;
      updatedProject.validatedByTTLDate = formattedDate;
    }

    // Immediately update local hook state
    setQualitativeData(qualitativeDataToSave);
    setIsPrefilledByTeam(updatedProject.isPrefilledByTeam);
    setValidatedByTTLDate(updatedProject.validatedByTTLDate);

    // Update parent state
    if (onUpdateRef.current) {
      onUpdateRef.current(updatedProject);
    }

    try {
      const formData = {
        estadoImplementacion: qualitativeDataToSave.estadoImplementacion,
        productosDestacados: qualitativeDataToSave.productosDestacados,
        probabilidadObjetivos: qualitativeDataToSave.probabilidadObjetivos,
        accionesSugeridas: qualitativeDataToSave.accionesSugeridas,
        fechaEvaluacionIntermedia: qualitativeDataToSave.fechaEvaluacionIntermedia,
        fechaTalleresArranque: qualitativeDataToSave.fechaTalleresArranque,
        temasCriticosSimulador: qualitativeDataToSave.temasCriticosSimulador,
        verificadorContenidos: qualitativeDataToSave.verificadorContenidos,
        isPrefilledByTeam: updatedProject.isPrefilledByTeam,
        validatedByTTLDate: updatedProject.validatedByTTLDate,
        operationNumber: currentProj.operationNumber || '',
        projectName: currentProj.name,
        country: currentProj.country || currentProj.countryName || '',
        ttl: currentProj.ttl || '',
        user: {
          username: currentUser.id || currentUser.name,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role
        },
        role: currentUser.role,
        actionType: currentUser.role === 'EFFECTIVENESS_TEAM' ? 'prefilling' : 'validation',
        timestamp: new Date().toISOString(),
        formattedDate: formattedDate
      };

      const payload = {
        projectId: currentProj.id,
        formData: formData,
        action: 'saveQualitativeData'
      };

      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      return { success: true, updatedProject };
    } catch (err) {
      console.warn('Google Apps Script persistence notice (saved in local memory):', err);
      return { success: true, updatedProject };
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    qualitativeData,
    setQualitativeData,
    isPrefilledByTeam,
    validatedByTTLDate,
    isLoading,
    isSaving,
    error,
    refetch: fetchQualitativeData,
    saveData
  };
}
