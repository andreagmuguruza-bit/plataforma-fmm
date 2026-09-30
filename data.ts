import { Project } from './types';

const countries = [
  'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Costa Rica', 
  'Dominican Republic', 'Ecuador', 'El Salvador', 'Guatemala', 'Honduras', 
  'Mexico', 'Nicaragua', 'Panama', 'Paraguay', 'Peru', 'Uruguay'
];

const ttls = [
  'Maria Gonzalez', 'David Chen', 'Sarah Johnson', 'Carlos Mendoza', 
  'Ana Silva', 'Roberto Gomez', 'Elena Rodriguez', 'Javier Morales',
  'Carmen Ortiz', 'Luis Fernandez', 'Patricia Vargas', 'Miguel Torres'
];

const projectThemes = [
  "Fiscal Modernization and Transparency Program",
  "Subnational Revenue Administration Reform",
  "Public Expenditure Management Enhancement",
  "Digital Transformation of Tax Administration",
  "Customs Modernization and Border Control",
  "Debt Management and Fiscal Sustainability",
  "Integrated Financial Management Information System",
  "Strengthening Fiscal Decentralization",
  "Public Procurement System Modernization",
  "Tax Policy and Administration Support",
  "Fiscal Risk Management and Transparency",
  "Enhancing Public Investment Management",
  "Subnational Fiscal Sustainability Program",
  "Modernization of the General Comptroller",
  "Treasury Management and Payment Systems",
  "Fiscal Consolidation and Economic Recovery",
  "Strengthening Macro-Fiscal Frameworks",
  "E-Invoicing and Tax Compliance Initiative",
  "Public Sector Efficiency and Innovation",
  "Fiscal Governance and Accountability Project"
];

const statuses: Project['status'][] = [
  'Not started', 'Pending Interview', 'Pending Q&A', 'Completed'
];

const generateProjects = (): Project[] => {
  const projects: Project[] = [];
  
  // Keep the first 3 projects with specific data for demonstration purposes
  projects.push({
    id: 'BR-L1377',
    name: 'National Prog. to Support the Adm and Fiscal Manag Brazilian Municipios PNAFM III',
    country: 'Brazil',
    ttl: 'Maria Cristina Mac Dowell',
    status: 'Pending Interview',
    isPrefilledByTeam: false,
    validatedByTTLDate: null,
    metadata: {
      investmentAmount: '$148M',
      disbursementPercent: 100,
      elapsedYears: 2.5,
      siScore: 1.8,
    }
  });

  projects.push({
    id: 'PRJ-1002',
    name: 'Digital Transformation of Tax Administration',
    country: 'Peru',
    ttl: 'David Chen',
    status: 'Pending Interview',
    isPrefilledByTeam: false,
    validatedByTTLDate: null,
    metadata: {
      investmentAmount: '$12M',
      disbursementPercent: 65,
      elapsedYears: 4.1,
      siScore: 2.3,
    },
    history: 'Executive History: The Digital Transformation initiative has shown strong progress in its first 4 years. However, past PMRs highlight recurring challenges with vendor procurement for the rural clinic modules. The previous SI score of 85 reflects good overall execution, but unresolved risks remain regarding the interoperability of the new health records system with legacy regional databases.'
  });

  projects.push({
    id: 'PRJ-1003',
    name: 'Subnational Revenue Administration Reform',
    country: 'Brazil',
    ttl: 'Sarah Johnson',
    status: 'Pending Q&A',
    isPrefilledByTeam: false,
    validatedByTTLDate: null,
    metadata: {
      investmentAmount: '$120M',
      disbursementPercent: 15,
      elapsedYears: 1.2,
      siScore: 2.6,
    },
    history: 'Executive History: Early stages of the project show excellent momentum. No major historical risks flagged yet, though initial supervision plans noted potential delays in environmental permitting for the northern sector.',
    transcription: 'Boss: How are we doing on the northern sector permits?\nSarah: We finally got the clearance last week. But now we are facing a supply chain issue with the solar inverters. They are delayed by 3 months.\nBoss: Okay, make sure to document that delay and our mitigation plan to source from the secondary supplier.',
    binnacle: 'Core Insights:\n- Northern sector environmental permits have been cleared.\n- New Challenge: Supply chain delays (3 months) for solar inverters.\n- Next Steps: Execute mitigation plan to source inverters from the secondary supplier.'
  });

  // Generate the remaining 45 projects
  for (let i = 4; i <= 47; i++) {
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    const randomTTL = ttls[Math.floor(Math.random() * ttls.length)];
    const randomTheme = projectThemes[Math.floor(Math.random() * projectThemes.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomInvestment = `$${Math.floor(Math.random() * 150) + 10}M`;
    const randomDisbursement = Math.floor(Math.random() * 100);
    const randomYears = Number((Math.random() * 5 + 0.5).toFixed(1));
    const randomScore = Number((Math.random() * 2.7).toFixed(1));

    projects.push({
      id: `PRJ-${1000 + i}`,
      name: `${randomTheme} - Phase ${Math.floor(Math.random() * 3) + 1}`,
      country: randomCountry,
      ttl: randomTTL,
      status: randomStatus,
      isPrefilledByTeam: false,
      validatedByTTLDate: null,
      metadata: {
        investmentAmount: randomInvestment,
        disbursementPercent: randomDisbursement,
        elapsedYears: randomYears,
        siScore: randomScore,
      }
    });
  }

  return projects;
};

export const initialProjects: Project[] = [
  {
    id: 'BR-L1377',
    name: 'National Prog. to Support the Adm and Fiscal Manag Brazilian Municipios PNAFM III',
    country: 'Brazil',
    ttl: 'Maria Cristina Mac Dowell',
    status: 'Stage III',
    isPrefilledByTeam: false,
    validatedByTTLDate: null,
    metadata: {
      investmentAmount: '$148M',
      disbursementPercent: 100, // Calculated from $148M / $148M approx
      elapsedYears: 1.5,
      siScore: 2.5,
      pmr2025: {
        status: 'Satisfactory',
        score: 2.5
      },
      pmr2026: {
        status: 'Satisfactory',
        score: 2.5
      }
    },
    submissionStatus: 'pending',
    qualitativeData: {
      estadoImplementacion: [
        'Proyecto en su último año de ejecución. A pesar de las dificultades derivadas de la pandemia del covid-19; la ejecución de los subpréstamos realizados a los municipos mantuvo un ritmo de ejecución constante.'
      ],
      productosDestacados: [
        'Sistema de seguimiento de proyectos municipales (sistema de gestión de la UCP)',
        'Catastros municipales'
      ],
      probabilidadObjetivos: [
        'Alta. Se considera que el proyecto cumplirá sus objetivos específicos.'
      ],
      accionesSugeridas: [
        'Se sugiere valorar si no hay una probabilidad media. IR 1 (tiempo de aprobación de proyectos municipales) y 3 (% de municipios que presentan informes de monitoreo de la ejecución oportunamente) están lejos de sus metas.'
      ]
    }
  }
];
