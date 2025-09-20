// context/ViewModeContext.jsx (new)
import { createContext, useContext, useState } from "react";

const ViewModeContext = createContext();

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return context;
}

export default function ViewModeProvider({ children }) {
  const [viewMode, setViewMode] = useState("desktop");

  const value = {
    viewMode,
    setViewMode
  };

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
}