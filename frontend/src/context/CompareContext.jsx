import React, { createContext, useContext, useState } from 'react';

const CompareContext = createContext();

export const useCompare = () => useContext(CompareContext);

export const CompareProvider = ({ children }) => {
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  const toggleCompare = (candidate) => {
    setSelectedCandidates(prev => {
      const exists = prev.find(c => c.name === candidate.name && c.party === candidate.party);
      if (exists) {
        return prev.filter(c => c.name !== candidate.name || c.party !== candidate.party);
      }
      if (prev.length >= 2) return prev; // Limit to 2
      return [...prev, candidate];
    });
  };

  const clearCompare = () => setSelectedCandidates([]);

  return (
    <CompareContext.Provider value={{ selectedCandidates, toggleCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};
