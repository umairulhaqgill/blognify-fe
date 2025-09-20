// components/SettingsSidebar.jsx (modern UI design)
import { useState } from "react";
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

function findComponentById(components, id) {
  for (const comp of components) {
    if (comp.id === id) return comp;
    if (comp.children) {
      const found = findComponentById(comp.children, id);
      if (found) return found;
    }
  }
  return null;
}

function findParentProps(components, childId, parent = null) {
  for (const comp of components) {
    if (comp.id === childId) {
      return parent ? parent.props : {};
    }
    if (comp.children && comp.children.length > 0) {
      const found = findParentProps(comp.children, childId, comp);
      if (found) return found;
    }
  }
  return null;
}

function updateComponentRecursively(components, componentId, newProps) {
  return components.map((comp) => {
    if (comp.id === componentId) {
      return { ...comp, props: newProps };
    }
    if (comp.children) {
      return {
        ...comp,
        children: updateComponentRecursively(comp.children, componentId, newProps),
      };
    }
    return comp;
  });
}

function deleteComponentRecursively(components, componentId) {
  return components.filter(comp => {
    if (comp.id === componentId) {
      return false;
    }
    if (comp.children && comp.children.length > 0) {
      comp.children = deleteComponentRecursively(comp.children, componentId);
    }
    return true;
  });
}

export default function SettingsSidebar() {
  const { pageJson, setPageJson, selectedComponentId, setSelectedComponentId } = usePage();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!selectedComponentId) {
    return (
      <div className="w-80 bg-gradient-to-b from-white to-gray-50 border-l border-gray-200/50 shadow-lg overflow-auto">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Component Settings</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Click on any component in the canvas to customize its properties and styling options.
          </p>
        </div>
      </div>
    );
  }

  const selected = findComponentById(pageJson.components, selectedComponentId);
  if (!selected) {
    setSelectedComponentId(null);
    return null;
  }

  const definition = COMPONENTS.find((c) => c.type === selected.type);
  if (!definition) {
    return (
      <div className="w-80 bg-gradient-to-b from-white to-gray-50 border-l border-gray-200/50 shadow-lg overflow-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-3">Settings</h2>
          <p className="text-gray-500">Unknown component type.</p>
        </div>
      </div>
    );
  }

  const parentProps = findParentProps(pageJson.components, selectedComponentId);
  const effectiveProps = mergeInheritedProps(selected, parentProps);

  const updateComponentProps = (componentId, newProps) => {
    const updatedComponents = updateComponentRecursively(
      pageJson.components,
      componentId,
      newProps
    );
    setPageJson({ ...pageJson, components: updatedComponents });
  };

  const handleDeleteComponent = () => {
    const updatedComponents = deleteComponentRecursively(
      pageJson.components,
      selectedComponentId
    );
    setPageJson({ ...pageJson, components: updatedComponents });
    setSelectedComponentId(null);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const getComponentIcon = (type) => {
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

  const getComponentGradient = (type) => {
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
    <div className="w-80 bg-gradient-to-b from-white to-gray-50 border-l border-gray-200/50 shadow-lg overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${getComponentGradient(selected.type)} rounded-xl flex items-center justify-center shadow-lg`}>
              <span className="text-white font-bold text-sm">{getComponentIcon(selected.type)}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{definition.label}</h2>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{selected.type}</p>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 group"
            title="Delete component"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Component</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Are you sure you want to delete this <strong>{definition.label}</strong> component? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteComponent}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Children Info */}
        {definition.acceptsChildren && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200/50">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Container Element</h4>
                <p className="text-sm text-blue-700 mb-2">
                  This component can contain other components. Drag elements onto it to nest them.
                </p>
                {selected.children && selected.children.length > 0 && (
                  <div className="inline-flex items-center space-x-2 bg-blue-500/10 rounded-lg px-3 py-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-xs font-medium text-blue-800">
                      {selected.children.length} child component{selected.children.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Properties */}
        {definition.propsSchema ? (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Properties
            </h3>
            {Object.entries(definition.propsSchema).map(([key, schema]) => {
              const inherited =
                schema.cascade &&
                selected.props[key] === undefined &&
                parentProps?.[key];

              return (
                <div key={key} className="space-y-2">
                  <label className="flex items-center justify-between text-sm font-semibold text-gray-700">
                    <span>{schema.label}</span>
                    {inherited && (
                      <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                        Inherited
                      </span>
                    )}
                  </label>

                  {schema.type === "text" && (
                    <input
                      type="text"
                      value={selected.props[key] || ""}
                      onChange={(e) =>
                        updateComponentProps(selectedComponentId, {
                          ...selected.props,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder={inherited ? `Inherited: ${parentProps[key]}` : `Enter ${schema.label.toLowerCase()}`}
                    />
                  )}

                  {schema.type === "color" && (
                    <div className="flex items-center space-x-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
                      <input
                        type="color"
                        value={selected.props[key] || "#ffffff"}
                        onChange={(e) =>
                          updateComponentProps(selectedComponentId, {
                            ...selected.props,
                            [key]: e.target.value,
                          })
                        }
                        className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-700">
                          {selected.props[key] || (inherited ? parentProps[key] : "#ffffff")}
                        </div>
                        <div className="text-xs text-gray-500">Click to change color</div>
                      </div>
                    </div>
                  )}

                  {schema.type === "select" && (
                    <select
                      value={selected.props[key] || ""}
                      onChange={(e) =>
                        updateComponentProps(selectedComponentId, {
                          ...selected.props,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    >
                      <option value="">Select {schema.label}</option>
                      {schema.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.replace(/^(p-|m-|text-|flex-|grid-cols-|justify-|items-|font-)/g, '').replace(/-/g, ' ')}
                        </option>
                      ))}
                    </select>
                  )}

                  {schema.type === "number" && (
                    <input
                      type="number"
                      value={selected.props[key] || ""}
                      onChange={(e) =>
                        updateComponentProps(selectedComponentId, {
                          ...selected.props,
                          [key]: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      placeholder={inherited ? `Inherited: ${parentProps[key]}` : `Enter ${schema.label.toLowerCase()}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No editable properties available for this component.</p>
          </div>
        )}

        {/* Component Info */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/50">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
            Component Info
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium text-gray-800 font-mono">{selected.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ID:</span>
              <span className="font-medium text-gray-800 font-mono text-xs">{selected.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Container:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                definition.acceptsChildren 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {definition.acceptsChildren ? "Yes" : "No"}
              </span>
            </div>
            {selected.children && (
              <div className="flex justify-between">
                <span className="text-gray-600">Children:</span>
                <span className="font-medium text-gray-800">{selected.children.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
