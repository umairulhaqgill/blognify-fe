// components/CanvasItem.jsx (fixed with proper rearrangement support)
import { useDrag, useDrop } from "react-dnd";
import { usePage } from "../context/PageContext";
import { COMPONENTS } from "../utils/components";

function mergeInheritedProps(component, parentProps) {
  const definition = COMPONENTS.find((c) => c.type === component.type);
  if (!definition?.propsSchema) return component.props;

  const merged = { ...component.props };

  for (const [key, schema] of Object.entries(definition.propsSchema)) {
    if (schema.cascade && parentProps?.[key] && !component.props[key]) {
      merged[key] = parentProps[key];
    }
  }

  return merged;
}

export default function CanvasItem({ component, parentProps }) {
  const { setSelectedComponentId, selectedComponentId, pageJson, setPageJson } = usePage();
  const definition = COMPONENTS.find((c) => c.type === component.type);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "COMPONENT",
    item: { 
      id: component.id,  // Include the ID to identify this as an existing component
      type: component.type,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

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
      // Don't allow dropping onto itself
      if (item.id === component.id) return;
      
      // Only allow dropping if this component accepts children
      if (!definition.acceptsChildren) return;
      
      setPageJson(prev => {
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
          
          // Add it as a child of this component
          const updateComponentWithChild = (components, targetId, newChild) => {
            return components.map(comp => {
              if (comp.id === targetId) {
                return {
                  ...comp,
                  children: [...(comp.children || []), newChild]
                };
              }
              if (comp.children && comp.children.length > 0) {
                return {
                  ...comp,
                  children: updateComponentWithChild(comp.children, targetId, newChild)
                };
              }
              return comp;
            });
          };
          
          return {
            ...prev,
            components: updateComponentWithChild(componentsWithoutMoved, component.id, componentToMove)
          };
        } else {
          // This is a new component from the sidebar
          const draggedDefinition = COMPONENTS.find(c => c.type === item.type);
          const defaultProps = {};
          
          if (draggedDefinition?.propsSchema) {
            Object.entries(draggedDefinition.propsSchema).forEach(([key, schema]) => {
              defaultProps[key] = schema.default || "";
            });
          }
          
          const newComponent = {
            id: `comp-${Date.now()}`,
            type: item.type,
            props: defaultProps,
            children: []
          };
          
          // Add the new component as a child
          const updateComponentWithChild = (components, targetId, newChild) => {
            return components.map(comp => {
              if (comp.id === targetId) {
                return {
                  ...comp,
                  children: [...(comp.children || []), newChild]
                };
              }
              if (comp.children && comp.children.length > 0) {
                return {
                  ...comp,
                  children: updateComponentWithChild(comp.children, targetId, newChild)
                };
              }
              return comp;
            });
          };
          
          return {
            ...prev,
            components: updateComponentWithChild(prev.components, component.id, newComponent)
          };
        }
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }));

  // Merge parent props with this component's props
  const effectiveProps = mergeInheritedProps(component, parentProps);

  const style = {};
  const classNames = [];

  // Apply props
  if (effectiveProps.padding) classNames.push(effectiveProps.padding);
  if (effectiveProps.margin) classNames.push(effectiveProps.margin);
  if (effectiveProps.display === "grid") classNames.push("grid", effectiveProps.gridCols);
  if (effectiveProps.display === "flex") classNames.push("flex", effectiveProps.flexDirection, effectiveProps.flexJustify, effectiveProps.flexAlign);
  if (effectiveProps.backgroundColor) style.backgroundColor = effectiveProps.backgroundColor;
  if (effectiveProps.color) style.color = effectiveProps.color;
  if (effectiveProps.textAlign) classNames.push(effectiveProps.textAlign);
  if (effectiveProps.borderRadius) style.borderRadius = effectiveProps.borderRadius;
  if (effectiveProps.width) style.width = effectiveProps.width;
  if (effectiveProps.height) style.height = effectiveProps.height;
  if (effectiveProps.fontWeight) classNames.push(effectiveProps.fontWeight);
  if (effectiveProps.fontStyle) classNames.push(effectiveProps.fontStyle);

  const children = component.children?.map((child) => (
    <CanvasItem key={child.id} component={child} parentProps={effectiveProps} />
  ));

  const handleSelect = (e) => {
    e.stopPropagation();
    setSelectedComponentId(component.id);
  };

  const isSelected = selectedComponentId === component.id;

  // Set up drag and drop for this component
  const dragDropRef = (node) => {
    drag(node);
    drop(node);
  };

  // Visual feedback for drag state
  const dragStyles = {
    opacity: isDragging ? 0.6 : 1,
    transform: isDragging ? 'rotate(2deg) scale(1.05)' : 'rotate(0deg) scale(1)',
    transition: 'all 0.2s ease',
    filter: isDragging ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))' : 'none'
  };

  const selectionStyles = isSelected 
    ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg transform scale-[1.02]" 
    : "hover:ring-2 hover:ring-gray-300/50 hover:shadow-md";

  const containerDropStyles = isOver && definition.acceptsChildren 
    ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-dashed border-blue-400 shadow-lg' 
    : '';

  switch (component.type) {
    case "h1":
      return (
        <div 
          ref={dragDropRef}
          style={{...style, ...dragStyles}} 
          className={`${classNames.join(" ")} ${containerDropStyles} ${selectionStyles}
            cursor-move rounded-xl transition-all duration-300 p-4 bg-white/80 backdrop-blur-sm border border-gray-200/50`}
          onClick={handleSelect}
        >
          <h1 className="text-3xl font-bold leading-tight">{effectiveProps.text || "Heading"}</h1>
          {children.length > 0 && (
            <div className="mt-4 space-y-2">{children}</div>
          )}
        </div>
      );
    case "p":
      return (
        <div 
          ref={dragDropRef}
          style={{...style, ...dragStyles}} 
          className={`${classNames.join(" ")} ${containerDropStyles} ${selectionStyles}
            cursor-move rounded-xl transition-all duration-300 p-4 bg-white/80 backdrop-blur-sm border border-gray-200/50`}
          onClick={handleSelect}
        >
          <p className="leading-relaxed">{effectiveProps.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris."}</p>
          {children.length > 0 && (
            <div className="mt-3 space-y-2">{children}</div>
          )}
        </div>
      );
    case "button":
      return (
        <div 
          ref={dragDropRef}
          style={dragStyles}
          className={`${containerDropStyles} ${selectionStyles}
            inline-block cursor-move rounded-xl transition-all duration-300`}
          onClick={handleSelect}
        >
          <button
            style={{ 
              backgroundColor: effectiveProps.backgroundColor,
              color: effectiveProps.color || "#ffffff",
              borderRadius: effectiveProps.borderRadius,
              padding: effectiveProps.padding || "0.75rem 1.5rem"
            }}
            className="font-medium shadow-md hover:shadow-lg transition-shadow duration-200 border border-black/10"
          >
            {effectiveProps.text || "Button"}
          </button>
          {children.length > 0 && (
            <div className="mt-2 space-y-1">{children}</div>
          )}
        </div>
      );
    case "span":
      return (
        <span 
          ref={dragDropRef}
          style={{...style, ...dragStyles}} 
          className={`${classNames.join(" ")} ${containerDropStyles} ${selectionStyles}
            cursor-move rounded-lg transition-all duration-300 inline-block px-2 py-1 bg-white/80 backdrop-blur-sm border border-gray-200/50`}
          onClick={handleSelect}
        >
          {effectiveProps.text || "Inline text"}
          {children.length > 0 && <span className="ml-2">{children}</span>}
        </span>
      );
    case "image":
      return (
        <div 
          ref={drag}
          style={{width: effectiveProps.width || "100%", ...dragStyles}} 
          className={`${selectionStyles}
            cursor-move rounded-xl overflow-hidden transition-all duration-300 bg-white/80 backdrop-blur-sm border border-gray-200/50`}
          onClick={handleSelect}
        >
          <img
            src={effectiveProps.src || "https://via.placeholder.com/400x200"}
            alt={effectiveProps.alt || "Placeholder image"}
            style={{ 
              width: "100%",
              height: effectiveProps.height || "auto",
              borderRadius: effectiveProps.borderRadius
            }}
            className="block"
          />
        </div>
      );
    case "div":
    case "section":
      return (
        <div 
          ref={dragDropRef}
          style={{...style, ...dragStyles}} 
          className={`${classNames.join(" ")} 
            ${isOver && definition.acceptsChildren 
              ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-dashed border-blue-400 shadow-lg' 
              : 'border-2 border-dashed border-gray-300/50 hover:border-gray-400/50'
            } 
            ${selectionStyles}
            cursor-move rounded-2xl transition-all duration-300 min-h-20 bg-white/40 backdrop-blur-sm`}
          onClick={handleSelect}
        >
          {children.length > 0 ? (
            <div className="p-4 space-y-4">{children}</div>
          ) : (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm font-medium">
                  {isOver ? "Drop component here" : "Drop components here"}
                </p>
              </div>
            </div>
          )}
        </div>
      );
    default:
      return (
        <div 
          ref={dragDropRef}
          style={{...style, ...dragStyles}} 
          className={`${classNames.join(" ")} ${containerDropStyles} ${selectionStyles}
            cursor-move rounded-xl transition-all duration-300 p-4 bg-white/80 backdrop-blur-sm border border-gray-200/50`}
          onClick={handleSelect}
        >
          {children.length > 0 ? (
            <div className="space-y-2">{children}</div>
          ) : (
            <div className="p-2 text-gray-500">Unknown component: {component.type}</div>
          )}
        </div>
      );
  }
}