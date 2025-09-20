// components/CanvasItem.jsx (updated with nested drop support)
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
      id: component.id,
      type: component.type,
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "COMPONENT",
    drop: (item, monitor) => {
      // Don't allow dropping onto itself
      if (item.id === component.id) return;
      
      // Only allow dropping if this component accepts children
      if (!definition.acceptsChildren) return;
      
      // Create a new component from the dragged item
      const draggedDefinition = COMPONENTS.find(c => c.type === item.type);
      const defaultProps = {};
      
      if (draggedDefinition?.propsSchema) {
        Object.entries(draggedDefinition.propsSchema).forEach(([key, schema]) => {
          defaultProps[key] = schema.default || "";
        });
      }
      
      // Add the new component as a child
      const newComponent = {
        id: `comp-${Date.now()}`,
        type: item.type,
        props: defaultProps,
        children: []
      };
      
      // Update the page JSON with the new child
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
      
      setPageJson(prev => ({
        ...prev,
        components: updateComponentWithChild(prev.components, component.id, newComponent)
      }));
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

  switch (component.type) {
    case "h1":
      return (
        <div 
          ref={dragDropRef}
          style={style} 
          className={`${classNames.join(" ")} ${isDragging ? "opacity-50" : "opacity-100"} 
            ${isOver && definition.acceptsChildren ? 'bg-blue-50 border-blue-200' : ''}
            ${isSelected ? "ring-2 ring-blue-500 ring-inset" : "hover:ring-1 hover:ring-gray-300"} 
            cursor-move rounded transition-all`}
          onClick={handleSelect}
        >
          <h1 className="text-3xl font-bold">{effectiveProps.text || "Heading"}</h1>
          {children}
        </div>
      );
    case "p":
      return (
        <div 
          ref={dragDropRef}
          style={style} 
          className={`${classNames.join(" ")} ${isDragging ? "opacity-50" : "opacity-100"} 
            ${isOver && definition.acceptsChildren ? 'bg-blue-50 border-blue-200' : ''}
            ${isSelected ? "ring-2 ring-blue-500 ring-inset" : "hover:ring-1 hover:ring-gray-300"} 
            cursor-move rounded transition-all`}
          onClick={handleSelect}
        >
          <p>{effectiveProps.text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris."}</p>
          {children}
        </div>
      );
    case "button":
      return (
        <div 
          ref={dragDropRef}
          className={`${isDragging ? "opacity-50" : "opacity-100"} 
            ${isOver && definition.acceptsChildren ? 'bg-blue-50 border-blue-200' : ''}
            ${isSelected ? "ring-2 ring-blue-500 ring-inset" : "hover:ring-1 hover:ring-gray-300"} 
            inline-block cursor-move rounded transition-all`}
          onClick={handleSelect}
        >
          <button
            style={{ 
              backgroundColor: effectiveProps.backgroundColor,
              color: effectiveProps.color || "#ffffff",
              borderRadius: effectiveProps.borderRadius,
              padding: effectiveProps.padding || "0.5rem 1rem"
            }}
            className="font-medium"
          >
            {effectiveProps.text || "Button"}
            {children}
          </button>
        </div>
      );
    case "span":
      return (
        <span 
          ref={dragDropRef}
          style={style} 
          className={`${classNames.join(" ")} ${isDragging ? "opacity-50" : "opacity-100"} 
            ${isOver && definition.acceptsChildren ? 'bg-blue-50 border-blue-200' : ''}
            ${isSelected ? "ring-2 ring-blue-500 ring-inset" : "hover:ring-1 hover:ring-gray-300"} 
            cursor-move rounded transition-all`}
          onClick={handleSelect}
        >
          {effectiveProps.text || "Inline text"}
          {children}
        </span>
      );
    case "image":
      return (
        <div 
          ref={drag}
          className={`${isDragging ? "opacity-50" : "opacity-100"} 
            ${isSelected ? "ring-2 ring-blue-500 ring-inset" : "hover:ring-1 hover:ring-gray-300"} 
            cursor-move rounded overflow-hidden transition-all`}
          onClick={handleSelect}
        >
          <img
            src={effectiveProps.src || "https://via.placeholder.com/400x200"}
            alt={effectiveProps.alt || "Placeholder image"}
            style={{ 
              width: effectiveProps.width || "100%",
              height: effectiveProps.height || "auto",
              borderRadius: effectiveProps.borderRadius
            }}
          />
        </div>
      );
    case "div":
    case "section":
      return (
        <div 
          ref={dragDropRef}
          style={style} 
          className={`${classNames.join(" ")} ${isDragging ? "opacity-50" : "opacity-100"} 
            ${isOver && definition.acceptsChildren ? 'bg-blue-50 border-2 border-dashed border-blue-400' : 'border border-dashed border-gray-300'} 
            cursor-move rounded-lg transition-all min-h-12`}
          onClick={handleSelect}
        >
          {children.length > 0 ? children : <div className="p-4 text-gray-500 text-center">Drop components here</div>}
        </div>
      );
    default:
      return (
        <div 
          ref={dragDropRef}
          style={style} 
          className={`${classNames.join(" ")} ${isDragging ? "opacity-50" : "opacity-100"} 
            ${isOver && definition.acceptsChildren ? 'bg-blue-50 border-blue-200' : ''}
            ${isSelected ? "ring-2 ring-blue-500 ring-inset" : "hover:ring-1 hover:ring-gray-300"} 
            cursor-move rounded transition-all`}
          onClick={handleSelect}
        >
          {children || <div className="p-2">Unknown component: {component.type}</div>}
        </div>
      );
  }
}