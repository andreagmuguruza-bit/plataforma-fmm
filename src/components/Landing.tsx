import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingProps {
  onSelectPortfolio: (instrument: 'INV' | 'PBL', isPmr?: boolean) => void;
  onSelectProjectLevel?: () => void;
  onSelectAlerts?: () => void;
  onSelectMidTermEvaluations?: () => void;
  onSelectCriticalProcurement?: () => void;
  totalProjects?: number;
}

interface PortfolioCardItem {
  id: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonColor: string;
  action: () => void;
}

export default function Landing({
  onSelectPortfolio,
  onSelectAlerts,
  onSelectMidTermEvaluations,
  onSelectCriticalProcurement,
  totalProjects
}: LandingProps) {
  const cards: PortfolioCardItem[] = [
    {
      id: 'active-portfolio',
      title: 'Active Portfolio',
      description: "Real-time FMM active portfolio, dynamically updated with new approvals and exits.",
      // IDB Caribbean urban development project image provided by user
      image: '/assets/aistudio/image_38841995.png',
      buttonText: 'Explore Dashboard',
      buttonColor: 'bg-[#009ee3] hover:bg-[#008ecb]',
      action: () => onSelectPortfolio('INV')
    },
    {
      id: 'alerts',
      title: 'Alerts',
      description: 'Scorecard of alerts before and during the execution phase.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=85',
      buttonText: 'View Scorecard',
      buttonColor: 'bg-[#caa932] hover:bg-[#b8982a]',
      action: () => onSelectAlerts && onSelectAlerts()
    },
    {
      id: 'pmr-cycles',
      title: 'PMR Cycles',
      description: 'Portfolio results per PMR cycle.',
      image: '/assets/aistudio/image_16595b5a.png',
      buttonText: 'Explore Cycles',
      buttonColor: 'bg-[#8cb928] hover:bg-[#7ca822]',
      action: () => onSelectPortfolio('INV', true)
    },
    {
      id: 'mid-term-evaluations',
      title: 'Mid-term Evaluations',
      description: 'Mid-term evaluations planned to be executed in the current and next year.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=85',
      buttonText: 'View schedule',
      buttonColor: 'bg-[#4a7288] hover:bg-[#3e6072]',
      action: () => onSelectMidTermEvaluations && onSelectMidTermEvaluations()
    },
    {
      id: 'critical-procurement',
      title: 'Critical Procurement Processes',
      description: 'Procurement processes that require special attention.',
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1000&q=85',
      buttonText: 'Review processes',
      buttonColor: 'bg-[#004e70] hover:bg-[#003d58]',
      action: () => onSelectCriticalProcurement && onSelectCriticalProcurement()
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 lg:px-12 py-3 sm:py-5 max-w-[1180px] mx-auto w-full">
      {/* Title Header with subtle top-to-bottom entrance animation */}
      <div className="text-center mb-4 sm:mb-6 flex flex-col items-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-1.5 tracking-tight"
        >
          <span className="text-[#005173]">Execution</span> Portfolio Tracking
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-xs sm:text-sm text-gray-600 max-w-2xl font-normal"
        >
          Monitor the performance of FMM operations in the execution stage.
        </motion.p>
      </div>

      {/* 5 Cards in a Single Row - Subtle bottom-to-top entrance animation with hover scale, without borders */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 lg:gap-4 items-stretch">
        {cards.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 + idx * 0.08, ease: "easeOut" }}
            onClick={card.action}
            className="group relative rounded-2xl overflow-hidden shadow-md flex flex-col justify-between p-3.5 sm:p-4 h-[225px] transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-2xl cursor-pointer"
          >
            {/* Background Photographic Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
              style={{ backgroundImage: `url(${card.image})` }}
            />

            {/* Exactly the same tone as the landing page hero image (image_c2025288.png) - neutral brand grey [#545A5E]/80, no blue tint */}
            <div className="absolute inset-0 bg-[#545A5E]/80 transition-opacity duration-300 group-hover:bg-[#545A5E]/70 pointer-events-none" />

            {/* Neutral Vignette Gradient for Contrast at Top and Bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/55 pointer-events-none" />

            {/* Content Section: Aligned to the Left and to the TOP of the Card */}
            <div className="relative z-10 flex flex-col items-start text-left w-full">
              {/* Card Title */}
              <h2 className="text-lg sm:text-[19px] lg:text-[20px] font-bold text-white tracking-tight leading-snug drop-shadow-md text-left mb-1.5 group-hover:text-zinc-100 transition-colors">
                {card.title}
              </h2>

              {/* Descriptive Text (cleanly trimmed, complete and left-aligned at top) */}
              <p className="text-white/95 text-[11.5px] sm:text-xs leading-relaxed text-left font-normal drop-shadow-sm">
                {card.description}
              </p>
            </div>

            {/* Action Button at the bottom (borderless, with specific color from reference image) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                card.action();
              }}
              className={`relative z-10 w-full ${card.buttonColor} active:scale-95 text-white py-1.5 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm group-hover:shadow cursor-pointer mt-auto`}
            >
              <span>{card.buttonText}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
