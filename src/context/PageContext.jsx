// context/PageContext.jsx (updated with better state management)
import { createContext, useContext, useState } from "react";
import defaultPageJson from "../utils/defaultPageJson";

const PageContext = createContext();

export function PageProvider({ children }) {
  const [pageJson, setPageJson] = useState(defaultPageJson);
  const [selectedComponentId, setSelectedComponentId] = useState(null);

  // Function to safely update pageJson and handle selection
  const updatePageJson = (newPageJson) => {
    setPageJson(newPageJson);
    
    // If the selected component was deleted, clear selection
    if (selectedComponentId && !findComponentById(newPageJson.components, selectedComponentId)) {
      setSelectedComponentId(null);
    }
  };

  // Helper function to find component by ID
  const findComponentById = (components, id) => {
    for (const comp of components) {
      if (comp.id === id) return comp;
      if (comp.children) {
        const found = findComponentById(comp.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const value = {
    pageJson,
    setPageJson: updatePageJson,
    selectedComponentId,
    setSelectedComponentId,
    findComponentById
  };

  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  return useContext(PageContext);
}