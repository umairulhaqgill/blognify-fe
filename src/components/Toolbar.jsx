// components/Toolbar.jsx (modern UI design)
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

  const ButtonStyle = ({ active, gradient, children, ...props }) => (
    <button 
      className={`relative px-4 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 ${
        active 
          ? `bg-gradient-to-r ${gradient} text-white shadow-lg shadow-blue-500/25` 
          : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-gray-900 border border-gray-200/50 hover:border-gray-300/50 shadow-sm hover:shadow-md'
      }`}
      {...props}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/50 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Left section - Actions */}
        <div className="flex items-center space-x-4">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3 mr-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PageBuilder
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            <ButtonStyle 
              active={showJson} 
              gradient="from-green-500 to-emerald-600"
              onClick={handleShowJson}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span>{showJson ? "Hide JSON" : "Show JSON"}</span>
              </div>
            </ButtonStyle>

            <label className="relative cursor-pointer group">
              <ButtonStyle gradient="from-blue-500 to-cyan-600">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span>Import</span>
                </div>
              </ButtonStyle>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>

            <ButtonStyle 
              gradient="from-purple-500 to-pink-600"
              onClick={handleExport}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Export</span>
              </div>
            </ButtonStyle>
          </div>
        </div>
        
        {/* Right section - Theme and View */}
        <div className="flex items-center space-x-6">
          {/* View mode selector */}
          <div className="flex items-center space-x-3">
            <div className="flex bg-white/70 backdrop-blur-sm rounded-xl p-1 border border-gray-200/50 shadow-sm">
              {[
                { mode: "desktop", icon: "🖥️", label: "Desktop" },
                { mode: "tablet", icon: "📱", label: "Tablet" }, 
                { mode: "mobile", icon: "📱", label: "Mobile" }
              ].map(({ mode, icon, label }) => (
                <button 
                  key={mode}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === mode
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                  onClick={() => setViewMode(mode)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">{icon}</span>
                    <span>{label}</span>
                  </div>
                  {viewMode === mode && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg blur opacity-30 -z-10"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle bottom gradient */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
    </div>
  );
}