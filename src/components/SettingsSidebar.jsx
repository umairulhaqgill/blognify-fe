// components/SettingsSidebar.jsx
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
      return false; // Remove this component
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
      <div className="w-64 bg-gray-100 p-4 border-l overflow-auto">
        <h2 className="text-lg font-semibold mb-3">Settings</h2>
        <p className="text-gray-500">Select a component to edit its settings.</p>
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
      <div className="w-64 bg-gray-100 p-4 border-l overflow-auto">
        <h2 className="text-lg font-semibold mb-3">Settings</h2>
        <p className="text-gray-500">Unknown component type.</p>
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

  return (
    <div className="w-64 bg-gray-100 p-4 border-l overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Settings - {definition.label}</h2>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-red-500 hover:text-red-700 p-1 rounded"
          title="Delete component"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this {definition.label} component? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteComponent}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {definition.acceptsChildren && (
        <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Children</h3>
          <p className="text-xs text-blue-600">
            This component can contain other components. Drag and drop components onto it to nest them.
          </p>
          {selected.children && selected.children.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-blue-800 font-medium">
                Contains {selected.children.length} child component(s)
              </p>
            </div>
          )}
        </div>
      )}

      {definition.propsSchema ? (
        <div className="space-y-4">
          {Object.entries(definition.propsSchema).map(([key, schema]) => {
            const inherited =
              schema.cascade &&
              selected.props[key] === undefined &&
              parentProps?.[key];

            return (
              <div key={key} className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  {schema.label}{" "}
                  {inherited && (
                    <span className="text-xs text-gray-500">(Inherited)</span>
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
                    className="w-full p-2 border rounded"
                    placeholder={inherited ? `Inherited: ${parentProps[key]}` : ""}
                  />
                )}

                {schema.type === "color" && (
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={selected.props[key] || "#ffffff"}
                      onChange={(e) =>
                        updateComponentProps(selectedComponentId, {
                          ...selected.props,
                          [key]: e.target.value,
                        })
                      }
                      className="w-10 h-10 border rounded"
                    />
                    <span className="ml-2 text-sm">
                      {selected.props[key] || (inherited ? parentProps[key] : "#ffffff")}
                    </span>
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
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select {schema.label}</option>
                    {schema.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
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
                    className="w-full p-2 border rounded"
                    placeholder={inherited ? `Inherited: ${parentProps[key]}` : ""}
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">No editable properties for this component.</p>
      )}

      {/* Component Info Section */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Component Info</h3>
        <div className="text-xs text-gray-500 space-y-1">
          <div>Type: {selected.type}</div>
          <div>ID: {selected.id}</div>
          <div>Accepts Children: {definition.acceptsChildren ? "Yes" : "No"}</div>
          {selected.children && (
            <div>Child Count: {selected.children.length}</div>
          )}
        </div>
      </div>
    </div>
  );
}