import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { usePortfolioData } from '../hooks/usePortfolioData';

interface LandingProps {
  onSelectPortfolio: (instrument: 'INV' | 'PBL', isPmr?: boolean) => void;
  onSelectProjectLevel: () => void;
  onSelectAlerts?: () => void;
  totalProjects?: number;
}

export default function Landing({ onSelectPortfolio, onSelectProjectLevel, onSelectAlerts, totalProjects }: LandingProps) {
  const projectCount = totalProjects || 48; // Default to 48 as requested by user if not loaded yet

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-7xl mx-auto w-full">
      <div className="text-center mb-16 flex flex-col items-center">
        <motion.h1 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight"
        >
          <span className="text-[#005173]">Execution</span> Portfolio Tracking
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg sm:text-xl md:text-2xl text-gray-900 max-w-7xl font-normal"
        >
          Monitor the performance of FMM operations in the execution stage.
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        className="flex flex-col sm:flex-row justify-center gap-4 w-full"
      >
        <motion.button 
          onClick={onSelectAlerts}
          whileHover={{ scale: 1.05 }}
          className="bg-[#005173] text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-bold text-base sm:text-lg flex items-center justify-center gap-2 hover:bg-[#003d57] transition-all shadow-md min-w-[200px] sm:min-w-[240px]"
        >
          Alerts <ArrowRight className="w-5 h-5" />
        </motion.button>
        <motion.button 
          onClick={() => onSelectPortfolio('INV')}
          whileHover={{ scale: 1.05 }}
          className="bg-[#005173] text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-bold text-base sm:text-lg flex items-center justify-center gap-2 hover:bg-[#003d57] transition-all shadow-md min-w-[200px] sm:min-w-[240px]"
        >
          Active Portfolio <ArrowRight className="w-5 h-5" />
        </motion.button>
        <motion.button 
          onClick={() => onSelectPortfolio('INV', true)}
          whileHover={{ scale: 1.05 }}
          className="bg-[#005173] text-[#FAFAFA] px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-bold text-base sm:text-lg flex items-center justify-center gap-2 hover:bg-[#003d57] transition-all shadow-md min-w-[200px] sm:min-w-[240px]"
        >
          PMR March Cycle 2026 <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
}
