// components/Canvas.jsx (updated with nested drop support)
import { useDrop } from "react-dnd";
import { usePage } from "../context/PageContext";
import { useViewMode } from "../context/ViewModeContext";
import CanvasItem from "./CanvasItem";
import { COMPONENTS } from "../utils/components";

export default function Canvas() {
  const { pageJson, setPageJson, selectedComponentId, setSelectedComponentId } = usePage();
  const { viewMode } = useViewMode();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "COMPONENT",
    drop: (item, monitor) => {
      // Check if we dropped on an existing component or on the canvas
      const didDropOnChild = monitor.didDrop();
      if (didDropOnChild) {
        return; // Let the child handle the drop
      }
      
      // Create a new component from the palette item
      const definition = COMPONENTS.find(c => c.type === item.type);
      const defaultProps = {};
      
      if (definition?.propsSchema) {
        Object.entries(definition.propsSchema).forEach(([key, schema]) => {
          defaultProps[key] = schema.default || "";
        });
      }
      
      setPageJson((prev) => ({
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
      }));
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
      className={`flex-1 bg-gray-100 overflow-auto p-6 ${getCanvasClass()} ${isOver ? 'bg-blue-50' : ''}`}
      style={{ transition: "all 0.3s ease", minHeight: "500px" }}
      onClick={handleCanvasClick}
    >
      <div className={`bg-white rounded-lg shadow-sm min-h-full p-6 ${isOver ? 'border-2 border-dashed border-blue-400' : 'border border-dashed border-gray-300'}`}>
        {pageJson.components.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium mb-2">Your canvas is empty</p>
            <p className="text-gray-400 mb-6">Drag components from the sidebar to start building your blog</p>
            <div className="animate-bounce text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {pageJson.components.map((comp) => (
              <CanvasItem key={comp.id} component={comp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}