import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CompareContext = createContext();

/**
 * @hook useCompare
 * @description Access the comparison engine state and actions.
 */
export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) throw new Error('useCompare must be used within a CompareProvider');
  return context;
};

/**
 * @provider CompareProvider
 * @description Manages a queue of candidates selected for comparison.
 * Persists selection to localStorage to prevent data loss on refresh.
 */
export const CompareProvider = ({ children }) => {
  const [selectedCandidates, setSelectedCandidates] = useState(() => {
    try {
      const saved = localStorage.getItem('election_compare_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('election_compare_queue', JSON.stringify(selectedCandidates));
  }, [selectedCandidates]);

  /**
   * @action toggleCompare
   * @description Adds or removes a candidate from the comparison queue.
   * Limits queue to exactly 2 candidates.
   */
  const toggleCompare = useCallback((candidate) => {
    setSelectedCandidates(prev => {
      const exists = prev.some(c => c.name === candidate.name && c.party === candidate.party);
      
      if (exists) {
        return prev.filter(c => !(c.name === candidate.name && c.party === candidate.party));
      }
      
      if (prev.length >= 2) {
        // Option: Replace the last one or just return. Returning for stability.
        return prev;
      }
      
      return [...prev, candidate];
    });
  }, []);

  /**
   * @action clearCompare
   * @description Empties the comparison queue.
   */
  const clearCompare = useCallback(() => {
    setSelectedCandidates([]);
  }, []);

  const value = {
    selectedCandidates,
    toggleCompare,
    clearCompare
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
};
