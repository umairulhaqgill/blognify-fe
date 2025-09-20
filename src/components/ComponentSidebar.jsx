// components/ComponentSidebar.jsx (updated with proper drag implementation)
import { useDrag } from "react-dnd";
import { COMPONENTS } from "../utils/components";

function DraggableItem({ component }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "COMPONENT",
    item: { 
      type: component.type,
      // Include any default data needed
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const getIcon = (type) => {
    switch(type) {
      case "h1": return "📝";
      case "p": return "📄";
      case "button": return "🔘";
      case "image": return "🖼️";
      case "div": return "📦";
      case "section": return "🔲";
      default: return "◻️";
    }
  };

  return (
    <div
      ref={drag}
      className={`p-3 border rounded-lg mb-3 cursor-grab bg-white shadow-sm flex items-center space-x-3
        ${isDragging ? "opacity-50" : "opacity-100"} transition-all hover:shadow-md active:cursor-grabbing`}
    >
      <span className="text-2xl">{getIcon(component.type)}</span>
      <div>
        <div className="font-medium">{component.label}</div>
        <div className="text-xs text-gray-500">{component.type}</div>
      </div>
    </div>
  );
}

export default function ComponentSidebar() {
  return (
    <div className="w-64 bg-white p-4 border-r shadow-inner overflow-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Components</h2>
      <div className="space-y-2">
        {COMPONENTS.map((c) => (
          <DraggableItem key={c.type} component={c} />
        ))}
      </div>
    </div>
  );
}