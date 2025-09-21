// components/ComponentSidebar.jsx (modern UI design)
import { useDrag } from "react-dnd";
import { COMPONENTS } from "../utils/components";

function DraggableItem({ component }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "COMPONENT",
    item: { 
      type: component.type,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const getIcon = (type) => {
    switch(type) {
      case "h1": return "H1";
      case "p": return "¶";
      case "button": return "▭";
      case "image": return "🖼";
      case "div": return "⬜";
      case "section": return "▦";
      case "span": return "T";
      default: return "◻";
    }
  };

  const getGradient = (type) => {
    switch(type) {
      case "h1": return "from-purple-500 to-pink-500";
      case "p": return "from-blue-500 to-cyan-500";
      case "button": return "from-green-500 to-emerald-500";
      case "image": return "from-yellow-500 to-orange-500";
      case "div": return "from-gray-500 to-slate-600";
      case "section": return "from-indigo-500 to-purple-500";
      case "span": return "from-rose-500 to-pink-500";
      default: return "from-gray-400 to-gray-500";
    }
  };

  return (
    <div
      ref={drag}
      className={`group relative overflow-hidden rounded-xl transition-all duration-300 cursor-grab active:cursor-grabbing
        ${isDragging 
          ? "opacity-40 scale-95 rotate-3" 
          : "opacity-100 hover:scale-105 hover:-rotate-1"
        } 
        bg-white shadow-md hover:shadow-xl border border-gray-100 hover:border-gray-200`}
    >
      {/* Gradient background overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(component.type)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      <div className="relative p-4 flex items-center space-x-4">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getGradient(component.type)} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
          <span className="text-white font-bold text-lg">{getIcon(component.type)}</span>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
            {component.label}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            {component.type}
          </div>
          {component.acceptsChildren && (
            <div className="text-xs text-blue-600 font-medium mt-1">
              • Container
            </div>
          )}
        </div>

        {/* Drag indicator */}
        <div className="opacity-40 group-hover:opacity-80 transition-opacity">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </div>
      </div>

      {/* Subtle animation line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
}

export default function ComponentSidebar() {
  return (
    <div className="w-80 bg-gradient-to-b from-[#fcfcfc] to-gray-50 border-r border-gray-200 shadow-lg overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#fcfcfc]/80 backdrop-blur-sm border-b border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#f75a0b] rounded-lg flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">Components</h2>
            <p className="text-sm text-gray-600">Drag to add to canvas</p>
          </div>
        </div>
      </div>

      {/* Component categories */}
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Layout
          </h3>
          <div className="space-y-3">
            {COMPONENTS.filter(c => c.isContainer).map((c) => (
              <DraggableItem key={c.type} component={c} />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4 flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            Content
          </h3>
          <div className="space-y-3">
            {COMPONENTS.filter(c => !c.isContainer).map((c) => (
              <DraggableItem key={c.type} component={c} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer tip */}
      <div className="sticky bottom-0 bg-gradient-to-t from-blue-50 to-transparent p-6">
        <div className="bg-blue-50/50 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">Pro Tip</p>
              <p className="text-xs text-blue-600">
                Drag components onto containers to nest them. Click components on the canvas to edit their properties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}