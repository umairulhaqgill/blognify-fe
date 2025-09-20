// App.jsx (ensure DndProvider is properly set up)
import { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PageProvider } from "./context/PageContext";
import Toolbar from "./components/Toolbar";
import ComponentSidebar from "./components/ComponentSidebar";
import Canvas from "./components/Canvas";
import SettingsSidebar from "./components/SettingsSidebar";
import ViewModeProvider from "./context/ViewModeContext";

function App() {
  const [showJson, setShowJson] = useState(false);
  const [jsonData, setJsonData] = useState("");

  return (
    <PageProvider>
      <ViewModeProvider>
        <DndProvider backend={HTML5Backend}>
          <div className="h-screen flex flex-col">
            <Toolbar 
              showJson={showJson} 
              setShowJson={setShowJson}
              jsonData={jsonData}
              setJsonData={setJsonData}
            />
            {showJson ? (
              <div className="flex-1 p-4 bg-gray-800 overflow-auto">
                <pre className="text-green-400 whitespace-pre-wrap">
                  {jsonData || "No JSON data to display"}
                </pre>
              </div>
            ) : (
              <div className="flex flex-1 overflow-hidden">
                <ComponentSidebar />
                <Canvas />
                <SettingsSidebar />
              </div>
            )}
          </div>
        </DndProvider>
      </ViewModeProvider>
    </PageProvider>
  );
}

export default App;