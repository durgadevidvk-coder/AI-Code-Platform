import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AICodeGenerator from "./pages/AICodeGenerator";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import AIRequestHistory from "./pages/AIRequestHistory";
import AICodeAnalysis from "./pages/AICodeAnalysis";
import AIDebugger from "./pages/AIDebugger";
import AIDocumentation from "./pages/AIDocumentation";
import AICodeImprovement from "./pages/AICodeImprovement";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
  path="/ai-generator"
  element={
    <ProtectedRoute>
      <AICodeGenerator />
    </ProtectedRoute>
  }
/>

        {/* Project Workspace */}

        
<Route
  path="/project/:projectId"
  element={
    <ProtectedRoute>
      <ProjectWorkspace />
    </ProtectedRoute>
  }
/>
<Route
  path="/ai-history"
  element={
    <ProtectedRoute>
      <AIRequestHistory />
    </ProtectedRoute>
  }
/>

<Route
  path="/ai-analysis"
  element={
    <ProtectedRoute>
      <AICodeAnalysis />
    </ProtectedRoute>
  }
/>

<Route
  path="/ai-debugger"
  element={
    <ProtectedRoute>
      <AIDebugger />
    </ProtectedRoute>
  }
/>

<Route
  path="/ai-documentation"
  element={
    <ProtectedRoute>
      <AIDocumentation />
    </ProtectedRoute>
  }
/>


<Route
  path="/ai-improvement"
  element={
    <ProtectedRoute>
      <AICodeImprovement />
    </ProtectedRoute>
  }
/>



        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;