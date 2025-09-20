// components/Toolbar.jsx (updated)
import { usePage } from "../context/PageContext";
import { useViewMode } from "../context/ViewModeContext";

export default function Toolbar({ showJson, setShowJson, jsonData, setJsonData }) {
  const { pageJson, setPageJson } = usePage();
  const { viewMode, setViewMode } = useViewMode();

  const handleExport = () => {
    const dataStr = JSON.stringify(pageJson, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = "blog-design.json";
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          setPageJson(importedData);
          setJsonData(JSON.stringify(importedData, null, 2));
        } catch (error) {
          alert("Error importing JSON file: " + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleShowJson = () => {
    setJsonData(JSON.stringify(pageJson, null, 2));
    setShowJson(!showJson);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white shadow-md">
      <div className="flex gap-2">
        <button 
          className={`px-3 py-1 rounded ${showJson ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={handleShowJson}
        >
          {showJson ? "Hide JSON" : "Show JSON"}
        </button>
        <label className="px-3 py-1 bg-gray-200 rounded cursor-pointer">
          Import
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
        <button 
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={handleExport}
        >
          Export
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <select className="px-3 py-1 border rounded">
          <option>Light Theme</option>
          <option>Dark Theme</option>
          <option>Custom Theme</option>
        </select>
        
        <div className="flex gap-1 bg-gray-100 p-1 rounded">
          <button 
            className={`px-3 py-1 rounded ${viewMode === "desktop" ? "bg-blue-500 text-white" : ""}`}
            onClick={() => setViewMode("desktop")}
          >
            Desktop
          </button>
          <button 
            className={`px-3 py-1 rounded ${viewMode === "tablet" ? "bg-blue-500 text-white" : ""}`}
            onClick={() => setViewMode("tablet")}
          >
            Tablet
          </button>
          <button 
            className={`px-3 py-1 rounded ${viewMode === "mobile" ? "bg-blue-500 text-white" : ""}`}
            onClick={() => setViewMode("mobile")}
          >
            Mobile
          </button>
        </div>
      </div>
    </div>
  );
}