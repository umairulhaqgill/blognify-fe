// utils/components.js (updated with children support)
export const COMPONENTS = [
  {
    type: "div",
    label: "Container",
    isContainer: true,
    acceptsChildren: true,
    propsSchema: {
      backgroundColor: { 
        type: "color", 
        label: "Background Color", 
        default: "#ffffff",
        cascade: true
      },
      padding: { 
        type: "select", 
        label: "Padding", 
        options: ["p-0", "p-2", "p-4", "p-6", "p-8"], 
        default: "p-4",
        cascade: true
      },
      margin: { 
        type: "select", 
        label: "Margin", 
        options: ["m-0", "m-2", "m-4", "m-6"], 
        default: "m-0",
        cascade: true
      },
      display: { 
        type: "select", 
        label: "Layout", 
        options: ["block", "flex", "grid"], 
        default: "block",
        cascade: true
      },
      flexDirection: {
        type: "select",
        label: "Flex Direction",
        options: ["flex-row", "flex-col", "flex-row-reverse", "flex-col-reverse"],
        default: "flex-row",
        cascade: true
      },
      flexJustify: {
        type: "select",
        label: "Flex Justify",
        options: ["justify-start", "justify-center", "justify-end", "justify-between", "justify-around"],
        default: "justify-start",
        cascade: true
      },
      flexAlign: {
        type: "select",
        label: "Flex Align",
        options: ["items-start", "items-center", "items-end", "items-stretch"],
        default: "items-start",
        cascade: true
      },
      gridCols: { 
        type: "select", 
        label: "Grid Columns", 
        options: ["grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4"], 
        default: "grid-cols-1",
        cascade: true
      },
      borderRadius: {
        type: "text",
        label: "Border Radius",
        default: "0.25rem",
        cascade: true
      },
      width: {
        type: "text",
        label: "Width",
        default: "100%",
        cascade: true
      },
      height: {
        type: "text",
        label: "Height",
        default: "auto",
        cascade: true
      }
    },
  },
  {
    type: "section",
    label: "Section",
    isContainer: true,
    acceptsChildren: true,
    propsSchema: {
      backgroundColor: { 
        type: "color", 
        label: "Background Color", 
        default: "#f8fafc",
        cascade: true
      },
      padding: { 
        type: "select", 
        label: "Padding", 
        options: ["p-0", "p-4", "p-8", "p-12"], 
        default: "p-8",
        cascade: true
      },
      margin: { 
        type: "select", 
        label: "Margin", 
        options: ["m-0", "m-4", "m-8"], 
        default: "m-0",
        cascade: true
      },
      borderRadius: {
        type: "text",
        label: "Border Radius",
        default: "0.5rem",
        cascade: true
      }
    },
  },
  {
    type: "h1",
    label: "Heading",
    isContainer: false,
    acceptsChildren: true,
    propsSchema: {
      text: { 
        type: "text", 
        label: "Text", 
        default: "Heading Text" 
      },
      textAlign: { 
        type: "select", 
        label: "Align", 
        options: ["text-left", "text-center", "text-right", "text-justify"], 
        default: "text-left",
        cascade: true
      },
      color: { 
        type: "color", 
        label: "Text Color", 
        default: "#000000",
        cascade: true
      },
      backgroundColor: { 
        type: "color", 
        label: "Background Color", 
        default: "transparent",
        cascade: true
      },
      padding: { 
        type: "select", 
        label: "Padding", 
        options: ["p-0", "p-1", "p-2", "p-4"], 
        default: "p-0",
        cascade: true
      },
      margin: { 
        type: "select", 
        label: "Margin", 
        options: ["m-0", "m-1", "m-2", "m-4"], 
        default: "m-0",
        cascade: true
      },
    },
  },
  {
    type: "p",
    label: "Paragraph",
    isContainer: false,
    acceptsChildren: true,
    propsSchema: {
      text: { 
        type: "text", 
        label: "Text", 
        default: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris." 
      },
      color: { 
        type: "color", 
        label: "Text Color", 
        default: "#374151",
        cascade: true
      },
      textAlign: { 
        type: "select", 
        label: "Align", 
        options: ["text-left", "text-center", "text-right", "text-justify"], 
        default: "text-left",
        cascade: true
      },
      backgroundColor: { 
        type: "color", 
        label: "Background Color", 
        default: "transparent",
        cascade: true
      },
      padding: { 
        type: "select", 
        label: "Padding", 
        options: ["p-0", "p-1", "p-2", "p-4"], 
        default: "p-0",
        cascade: true
      },
      margin: { 
        type: "select", 
        label: "Margin", 
        options: ["m-0", "m-1", "m-2", "m-4"], 
        default: "m-0",
        cascade: true
      },
    },
  },
  {
    type: "button",
    label: "Button",
    isContainer: false,
    acceptsChildren: true,
    propsSchema: {
      text: { 
        type: "text", 
        label: "Label", 
        default: "Click Me" 
      },
      backgroundColor: { 
        type: "color", 
        label: "Button Color", 
        default: "#3b82f6" 
      },
      color: { 
        type: "color", 
        label: "Text Color", 
        default: "#ffffff" 
      },
      padding: { 
        type: "select", 
        label: "Padding", 
        options: ["p-1", "p-2", "p-3", "p-4"], 
        default: "p-2" 
      },
      margin: { 
        type: "select", 
        label: "Margin", 
        options: ["m-0", "m-1", "m-2", "m-4"], 
        default: "m-0" 
      },
      borderRadius: {
        type: "text",
        label: "Border Radius",
        default: "0.25rem"
      }
    },
  },
  {
    type: "image",
    label: "Image",
    isContainer: false,
    acceptsChildren: false,
    propsSchema: {
      src: { 
        type: "text", 
        label: "Image URL", 
        default: "/placeholder.svg" 
      },
      alt: { 
        type: "text", 
        label: "Alt Text", 
        default: "Placeholder image" 
      },
      width: {
        type: "text",
        label: "Width",
        default: "100%"
      },
      height: {
        type: "text",
        label: "Height",
        default: "auto"
      },
      padding: { 
        type: "select", 
        label: "Padding", 
        options: ["p-0", "p-1", "p-2", "p-4"], 
        default: "p-0" 
      },
      margin: { 
        type: "select", 
        label: "Margin", 
        options: ["m-0", "m-1", "m-2", "m-4"], 
        default: "m-0" 
      },
      borderRadius: {
        type: "text",
        label: "Border Radius",
        default: "0.25rem"
      }
    },
  },
  {
    type: "span",
    label: "Text Span",
    isContainer: false,
    acceptsChildren: true,
    propsSchema: {
      text: { 
        type: "text", 
        label: "Text", 
        default: "Inline text" 
      },
      color: { 
        type: "color", 
        label: "Text Color", 
        default: "#374151",
        cascade: true
      },
      backgroundColor: { 
        type: "color", 
        label: "Background Color", 
        default: "transparent",
        cascade: true
      },
      fontWeight: {
        type: "select",
        label: "Font Weight",
        options: ["font-normal", "font-bold", "font-light"],
        default: "font-normal"
      },
      fontStyle: {
        type: "select",
        label: "Font Style",
        options: ["not-italic", "italic"],
        default: "not-italic"
      }
    },
  },
];