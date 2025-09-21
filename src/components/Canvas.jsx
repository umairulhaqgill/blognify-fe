// components/Canvas.jsx (fixed with proper rearrangement support)
import { useDrop } from "react-dnd";
import { usePage } from "../context/PageContext";
import { useViewMode } from "../context/ViewModeContext";
import CanvasItem from "./CanvasItem";
import { COMPONENTS } from "../utils/components";

export default function Canvas() {
  const { pageJson, setPageJson, selectedComponentId, setSelectedComponentId } = usePage();
  const { viewMode } = useViewMode();

  // Helper function to remove a component from anywhere in the tree
  const removeComponentById = (components, targetId) => {
    return components.reduce((acc, comp) => {
      if (comp.id === targetId) {
        return acc; // Skip this component (remove it)
      }
      
      const updatedComp = { ...comp };
      if (comp.children && comp.children.length > 0) {
        updatedComp.children = removeComponentById(comp.children, targetId);
      }
      
      acc.push(updatedComp);
      return acc;
    }, []);
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "COMPONENT",
    drop: (item, monitor) => {
      // Check if we dropped on an existing component or on the canvas
      const didDropOnChild = monitor.didDrop();
      if (didDropOnChild) {
        return; // Let the child handle the drop
      }
      
      setPageJson((prev) => {
        // Check if this is an existing component being moved (has an ID)
        if (item.id) {
          // Find the component being moved
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

          const componentToMove = findComponentById(prev.components, item.id);
          if (!componentToMove) return prev;

          // Remove the component from its current position
          const componentsWithoutMoved = removeComponentById(prev.components, item.id);
          
          // Add it to the end of the root level
          return {
            ...prev,
            components: [...componentsWithoutMoved, componentToMove],
          };
        } else {
          // This is a new component from the sidebar
          const definition = COMPONENTS.find(c => c.type === item.type);
          const defaultProps = {};
          
          if (definition?.propsSchema) {
            Object.entries(definition.propsSchema).forEach(([key, schema]) => {
              defaultProps[key] = schema.default || "";
            });
          }
          
          return {
            ...prev,
            components: [
              ...prev.components,
              { 
                id: `comp-${Date.now()}`,
                type: item.type, 
                props: defaultProps,
                children: item.children || [] 
              },
            ],
          };
        }
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

  return (
    <div 
      ref={drop} 
      className={`flex-1 bg-gradient-to-br from-slate-50 to-gray-100 overflow-auto p-8 ${getCanvasClass()}`}
      style={{ transition: "all 0.3s ease", minHeight: "500px" }}
      onClick={handleCanvasClick}
    >
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