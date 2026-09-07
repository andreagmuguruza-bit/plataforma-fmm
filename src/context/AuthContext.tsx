import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';

export const SHARED_PASSWORD = 'efectividad2026';

export interface PredefinedUserConfig {
  username: string;
  aliases?: string[];
  name: string;
  email: string;
  role: UserRole;
  allowedRoles?: UserRole[];
  ttlName?: string;
  isDualRole?: boolean;
}

export const PREDEFINED_USERS: PredefinedUserConfig[] = [
  // 1. General FMM
  {
    username: 'fmm',
    name: 'FMM Team',
    email: 'fmm@iadb.org',
    role: 'GENERAL_FMM'
  },

  // 2. Effectiveness Team
  {
    username: 'axelradics',
    aliases: ['axel radics', 'gustavo axel radics'],
    name: 'Gustavo Axel Radics',
    email: 'AXELRADICS@IADB.ORG',
    role: 'EFFECTIVENESS_TEAM'
  },
  {
    username: 'hectormendoza',
    aliases: ['hector mendoza', 'hector agustin mendoza'],
    name: 'Hector Agustin Mendoza',
    email: 'HMENDOZA@IADB.ORG',
    role: 'EFFECTIVENESS_TEAM'
  },
  {
    username: 'andreaguardia',
    aliases: ['andrea guardia', 'andrea guardia muguruza'],
    name: 'Andrea Guardia Muguruza',
    email: 'ANDREAGUA@IADB.ORG',
    role: 'EFFECTIVENESS_TEAM'
  },
  {
    username: 'elisadestefano',
    aliases: ['elisa destefano', 'maria elisa destefano', 'maria elisa de stefano'],
    name: 'Maria Elisa De Stefano',
    email: 'MDESTEFANO@IADB.ORG',
    role: 'EFFECTIVENESS_TEAM'
  },
  {
    username: 'susanaroman',
    aliases: ['susana roman', 'susana roman sanchez'],
    name: 'Susana Roman Sanchez',
    email: 'SROMAN@IADB.ORG',
    role: 'EFFECTIVENESS_TEAM'
  },

  // 3. Division Chief
  {
    username: 'martaruiz',
    aliases: ['marta ruiz', 'marta ruiz arranz', 'marta ruiz-arranz'],
    name: 'Marta Ruiz-Arranz',
    email: 'mruizarranz@IADB.ORG',
    role: 'DIVISION_CHIEF'
  },

  // 4. TTLs
  {
    username: 'martinardanaz',
    aliases: ['martin ardanaz', 'martin jorge ardanaz'],
    name: 'Martin Ardanaz',
    email: 'MARTINA@iadb.org',
    role: 'TTL',
    ttlName: 'ARDANAZ, MARTIN JORGE'
  },
  {
    username: 'monicacalijuri',
    aliases: ['monica calijuri'],
    name: 'Monica Calijuri',
    email: 'MCALIJURI@IADB.ORG',
    role: 'TTL',
    ttlName: 'CALIJURI, MONICA'
  },
  {
    username: 'jessicachamorro',
    aliases: ['jessica chamorro'],
    name: 'Jessica Chamorro',
    email: 'JESSICACH@IADB.ORG',
    role: 'TTL',
    ttlName: 'CHAMORRO MONTES, JESSICA ANDREA DEL CARME'
  },
  {
    username: 'sergiociavolih',
    aliases: ['sergio ciavolih', 'sergio ciavolih mota'],
    name: 'Sergio Ciavolih',
    email: 'SERGIOCI@IADB.ORG',
    role: 'TTL',
    ttlName: 'CIAVOLIH MOTA, SERGIO RICARDO'
  },
  {
    username: 'juanluisgomez',
    aliases: ['juan luis gomez', 'juan luis gomez reino'],
    name: 'Juan Luis Gomez',
    email: 'jgomezreino@IADB.ORG',
    role: 'TTL',
    ttlName: 'GOMEZ REINO, JUAN LUIS'
  },
  {
    username: 'carlosgoncalves',
    aliases: ['carlos goncalves', 'carlos eduardo goncalves'],
    name: 'Carlos Goncalves',
    email: 'cgoncalves@iadb.org',
    role: 'TTL',
    ttlName: 'GONCALVES, CARLOS EDUARDO'
  },
  {
    username: 'ubaldogonzalez',
    aliases: ['ubaldo gonzalez', 'ubaldo gonzalez de frutos'],
    name: 'Ubaldo Gonzalez',
    email: 'UBALDOG@IADB.ORG',
    role: 'TTL',
    ttlName: 'GONZALEZ DE FRUTOS, UBALDO JESUS'
  },
  {
    username: 'leslieharper',
    aliases: ['leslie harper', 'leslie elizabeth harper'],
    name: 'Leslie Harper',
    email: 'LESLIEHA@iadb.org',
    role: 'TTL',
    ttlName: 'HARPER, LESLIE ELIZABETH'
  },
  {
    username: 'zoilallempen',
    aliases: ['zoila llempen', 'zoila llempen lopez'],
    name: 'Zoila Llempen',
    email: 'ZOILAL@IADB.ORG',
    role: 'TTL',
    ttlName: 'LLEMPEN LOPEZ, ZOILA CRISTINA'
  },
  {
    username: 'oscarlora',
    aliases: ['oscar lora', 'oscar lora rocha'],
    name: 'Oscar Lora',
    email: 'OLORAROCHA@iadb.org',
    role: 'TTL',
    ttlName: 'LORA ROCHA, OSCAR'
  },
  {
    username: 'cristinamacdowell',
    aliases: ['cristina macdowell', 'cristina mac dowell', 'maria cristina mac dowell'],
    name: 'Maria Cristina Mac Dowell',
    email: 'mmacdowell@IADB.ORG',
    role: 'TTL',
    ttlName: 'MARIA CRISTINA MAC DOWELL'
  },
  {
    username: 'andremartinez',
    aliases: ['andre martinez', 'andre martinez fritscher'],
    name: 'Andre Martinez',
    email: 'ANDREMA@IADB.ORG',
    role: 'TTL',
    ttlName: 'MARTINEZ FRITSCHER, ANDRE CARLOS'
  },
  {
    username: 'renatamotta',
    aliases: ['renata motta', 'renata motta cafe'],
    name: 'Renata Motta',
    email: 'RMOTTACAFE@IADB.ORG',
    role: 'TTL',
    ttlName: 'MOTTA CAFE, RENATA'
  },
  {
    username: 'andresmunoz',
    aliases: ['andres munoz', 'andres munoz miranda'],
    name: 'Andres Munoz',
    email: 'ANDRESMU@iadb.org',
    role: 'TTL',
    ttlName: 'MUNOZ MIRANDA, ANDRES FELIPE'
  },
  {
    username: 'gerardoreyes',
    aliases: ['gerardo reyes', 'gerardo reyes tagle', 'gerardo reyes-tagle'],
    name: 'Gerardo Reyes',
    email: 'GERARDOR@iadb.org',
    role: 'TTL',
    ttlName: 'REYES-TAGLE, GERARDO'
  },
  {
    username: 'arielzaltsman',
    aliases: ['ariel zaltsman', 'teodoro ariel zaltsman'],
    name: 'Ariel Zaltsman',
    email: 'TEODOROZ@iadb.org',
    role: 'TTL',
    ttlName: 'ZALTSMAN, TEODORO ARIEL'
  },

  // 5. Dual Role
  {
    username: 'anastasiyayarygina',
    aliases: ['anastasiya yarygina', 'anastasiya yarygina udovenko'],
    name: 'Anastasiya Yarygina',
    email: 'ANASTASIYAY@IADB.ORG',
    role: 'EFFECTIVENESS_TEAM',
    allowedRoles: ['EFFECTIVENESS_TEAM', 'TTL'],
    isDualRole: true,
    ttlName: 'YARYGINA UDOVENKO, ANASTASIYA'
  }
];

const normalizeStr = (str: string) => 
  String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

export function findPredefinedUser(inputUsername: string): PredefinedUserConfig | undefined {
  const norm = normalizeStr(inputUsername);
  if (!norm) return undefined;
  
  return PREDEFINED_USERS.find(user => {
    if (normalizeStr(user.username) === norm) return true;
    if (user.aliases && user.aliases.some(alias => normalizeStr(alias) === norm)) return true;
    return false;
  });
}

interface AuthContextType {
  user: AuthUser | null;
  activeRole: UserRole;
  isLoggedIn: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  setActiveRole: (role: UserRole) => void;
  selectedTTL: string;
  setSelectedTTL: (ttl: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'fmm_auth_user_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading auth session:', e);
    }
    return null;
  });

  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    return user?.activeRole || user?.role || 'GENERAL_FMM';
  });

  const [selectedTTL, setSelectedTTL] = useState<string>(() => {
    return user?.ttlName || '';
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      setActiveRoleState(user.activeRole);
      if (user.ttlName) {
        setSelectedTTL(user.ttlName);
      }
    } else {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = (usernameInput: string, passwordInput: string): { success: boolean; error?: string } => {
    if (!usernameInput || !passwordInput) {
      return { success: false, error: 'Por favor ingresa usuario y contraseña.' };
    }

    if (passwordInput !== SHARED_PASSWORD) {
      return { success: false, error: 'Contraseña incorrecta. Inténtalo de nuevo.' };
    }

    const matched = findPredefinedUser(usernameInput);
    if (!matched) {
      return { success: false, error: 'Usuario no reconocido. Verifica tu usuario.' };
    }

    const authUser: AuthUser = {
      username: matched.username,
      name: matched.name,
      email: matched.email,
      role: matched.role,
      activeRole: matched.role,
      allowedRoles: matched.allowedRoles || [matched.role],
      ttlName: matched.ttlName,
      isDualRole: matched.isDualRole
    };

    setUser(authUser);
    setActiveRoleState(authUser.activeRole);
    if (authUser.ttlName) {
      setSelectedTTL(authUser.ttlName);
    }
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setSelectedTTL('');
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem('fmm_logged_in');
  };

  const setActiveRole = (newRole: UserRole) => {
    if (!user) return;
    if (user.isDualRole && user.allowedRoles?.includes(newRole)) {
      const updated = { ...user, activeRole: newRole };
      setUser(updated);
      setActiveRoleState(newRole);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        isLoggedIn: !!user,
        login,
        logout,
        setActiveRole,
        selectedTTL,
        setSelectedTTL
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
