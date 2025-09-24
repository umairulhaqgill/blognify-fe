// components/Canvas.jsx (updated with delete key support)
import { useDrop } from "react-dnd";
import { usePage } from "../context/PageContext";
import { useViewMode } from "../context/ViewModeContext";
import CanvasItem, { removeComponentById } from "./CanvasItem";
import { COMPONENTS } from "../utils/components";
import { useEffect } from "react";

export default function Canvas() {
  const { pageJson, setPageJson, selectedComponentId, setSelectedComponentId } = usePage();
  const { viewMode } = useViewMode();

  // Add keyboard event listener for delete key
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if Delete or Backspace key is pressed and a component is selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponentId) {
        // Prevent default behavior (like going back in browser)
        e.preventDefault();
        
        // Remove the selected component
        setPageJson(prev => ({
          ...prev,
          components: removeComponentById(prev.components, selectedComponentId)
        }));
        
        // Clear the selection
        setSelectedComponentId(null);
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedComponentId, setPageJson, setSelectedComponentId]);

  // helper to find a component by id
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

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "COMPONENT",
    drop: (item, monitor) => {
      // If dropped inside a child component, let the child handle it
      if (monitor.didDrop()) return;

      setPageJson((prev) => {
        // CASE 1: existing component being moved
        if (item.id) {
          const componentToMove = findComponentById(prev.components, item.id);
          if (!componentToMove) return prev;

          // 🚫 Prevent moving to root unless explicitly allowed
          const def = COMPONENTS.find(c => c.type === componentToMove.type);
          if (def && def.allowRoot === false) {
            return prev; // block drop into root
          }

          // remove from old parent
          const componentsWithoutMoved = removeComponentById(prev.components, item.id);

          // insert at root
          return {
            ...prev,
            components: [...componentsWithoutMoved, componentToMove],
          };
        }

        // CASE 2: new component from sidebar
        const definition = COMPONENTS.find((c) => c.type === item.type);
        if (!definition) return prev;

        // 🚫 Prevent new component at root unless explicitly allowed
        if (definition.allowRoot === false) {
          return prev;
        }

        const defaultProps = {};
        if (definition.propsSchema) {
          Object.entries(definition.propsSchema).forEach(([key, schema]) => {
            defaultProps[key] = schema.default || "";
          });
        }

        const newComponent = {
          id: `comp-${Date.now()}`,
          type: item.type,
          props: defaultProps,
          children: [],
        };

        return {
          ...prev,
          components: [...prev.components, newComponent],
        };
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }));

  const getCanvasClass = () => {
    switch(viewMode) {
      case "desktop": return "w-full";
      case "tablet": return "max-w-3xl mx-auto";
      case "mobile": return "max-w-md mx-auto";
      default: return "w-full";
    }
  };

  const handleCanvasClick = (e) => {
    // Deselect component when clicking on empty canvas area
    if (e.target === e.currentTarget) {
      setSelectedComponentId(null);
    }
  };

  // Add delete hint when a component is selected
  const showDeleteHint = selectedComponentId && pageJson.components.length > 0;

  return (
    <div 
      ref={drop} 
      className={`flex-1 bg-gradient-to-br from-slate-50 to-gray-100 overflow-auto p-8 ${getCanvasClass()}`}
      style={{ transition: "all 0.3s ease", minHeight: "500px" }}
      onClick={handleCanvasClick}
    >
      {/* Delete Key Hint */}
      {showDeleteHint && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-blue-700 text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Press <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">Delete</kbd> or <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">Backspace</kbd> to remove selected component</span>
          </div>
        </div>
      )}
      
      <div className={`bg-white rounded-2xl shadow-xl min-h-full p-8 backdrop-blur-sm border transition-all duration-300 ${
        isOver 
          ? 'border-2 border-dashed border-blue-400 bg-blue-50/50 shadow-2xl transform scale-[1.02]' 
          : 'border border-gray-200/50 hover:shadow-2xl'
      }`}>
        {pageJson.components.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 min-h-96">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-[#f75a0b] rounded-full blur-xl opacity-20 animate-pulse"></div>
              <div className="relative bg-[#f75a0b] rounded-full p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.78 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-[#f75a0b] mb-3">
              Design Your Vision
            </h3>
            <p className="text-gray-500 text-lg mb-4 max-w-md">
              Start building by dragging components from the sidebar
            </p>
            <div className="flex items-center space-x-3 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Drag</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse animation-delay-150"></div>
                <span>Drop</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse animation-delay-300"></div>
                <span>Customize</span>
              </div>
            </div>
            
            {/* Delete key info for when there are components */}
            {selectedComponentId && (
              <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Tip:</strong> Select any component and press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white border border-gray-300 rounded">Delete</kbd> to remove it
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {pageJson.components.map((comp) => (
              <CanvasItem key={comp.id} component={comp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}