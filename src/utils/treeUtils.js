// utils/treeUtils.js
export const insertChildById = (components, targetId, newChild) => {
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
        children: insertChildById(comp.children, targetId, newChild)
      };
    }
    return comp;
  });
};
