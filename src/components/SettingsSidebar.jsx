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

export default function SettingsSidebar() {
  const { pageJson, setPageJson, selectedComponentId } = usePage();

  if (!selectedComponentId) {
    return (
      <div className="w-64 bg-gray-100 p-4 border-l">
        <h2 className="text-lg font-semibold mb-3">Settings</h2>
        <p className="text-gray-500">Select a component to edit its settings.</p>
      </div>
    );
  }

  const selected = findComponentById(pageJson.components, selectedComponentId);
  if (!selected) return null;

  const definition = COMPONENTS.find((c) => c.type === selected.type);
  if (!definition) return null;

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

  return (
    <div className="w-64 bg-gray-100 p-4 border-l overflow-auto">
      <h2 className="text-lg font-semibold mb-3">Settings - {definition.label}</h2>
      {definition.propsSchema ? (
        Object.entries(definition.propsSchema).map(([key, schema]) => {
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
                <input
                  type="color"
                  value={selected.props[key] || "#ffffff"}
                  onChange={(e) =>
                    updateComponentProps(selectedComponentId, {
                      ...selected.props,
                      [key]: e.target.value,
                    })
                  }
                  className="w-full h-10 border rounded"
                />
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
            </div>
          );
        })
      ) : (
        <p className="text-gray-500">No editable properties for this component.</p>
      )}
    </div>
  );
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
