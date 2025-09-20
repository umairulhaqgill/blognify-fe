import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import { usePage } from "../context/PageContext";

export default function DragDropCanvasWrapper() {
  const { pageJson, setPageJson } = usePage();

  if (!pageJson?.components) {
    return <div className="flex-1 p-4 bg-gray-100">No components yet</div>;
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = pageJson.components.findIndex((c) => c.id === active.id);
      const newIndex = pageJson.components.findIndex((c) => c.id === over.id);
      setPageJson({
        ...pageJson,
        components: arrayMove(pageJson.components, oldIndex, newIndex),
      });
    }
  };

  return (
    <div className="flex-1 bg-gray-100 p-4">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={pageJson.components.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {pageJson.components.map((component) => (
            <SortableItem key={component.id} id={component.id}>
              <div className="p-4 bg-white shadow rounded mb-2">{component.type}</div>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
