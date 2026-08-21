import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AICodeAnalysis() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");

  const [analysis, setAnalysis] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD PROJECTS
  // ==========================================

  useEffect(() => {
    const loadProjects = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/projects/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProjects(response.data);

        if (response.data.length > 0) {
          setSelectedProject(
            String(response.data[0].id)
          );
        }

      } catch (err) {
        console.error(
          "Error loading projects:",
          err
        );

        if (err.response?.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");

          navigate("/login");
        } else {
          setError("Failed to load projects.");
        }
      }
    };

    loadProjects();
  }, [navigate]);

  // ==========================================
  // ANALYZE CODE
  // ==========================================

  const analyzeCode = async () => {
    if (!selectedProject) {
      setError("Please select a project.");
      return;
    }

    if (!code.trim()) {
      setError("Please enter code to analyze.");
      return;
    }

    const token = localStorage.getItem("access");

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setAnalysis("");

    const analysisPrompt = `
Analyze the following ${language} code.

Provide a detailed developer-friendly analysis including:

1. Code quality
2. Bugs or potential errors
3. Security issues
4. Performance issues
5. Best practice improvements
6. Suggestions for cleaner code

Code:

${code}
`;

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/ai-requests/",
        {
          project: Number(selectedProject),
          prompt: analysisPrompt,
          request_type: "code_analysis",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Analysis response:",
        response.data
      );

      setAnalysis(response.data.response);

      setSuccess(
        "Code analysis completed successfully."
      );

    } catch (err) {
      console.error(
        "Code analysis error:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        navigate("/login");
      } else {
        setError(
          err.response?.data?.detail ||
          "Failed to analyze code."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // COPY ANALYSIS
  // ==========================================

  const copyAnalysis = async () => {
    if (!analysis) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        analysis
      );

      setSuccess(
        "Analysis copied to clipboard."
      );

    } catch (err) {
      console.error(
        "Copy failed:",
        err
      );

      setError(
        "Failed to copy analysis."
      );
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-8">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="text-slate-400 hover:text-white mb-5"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold">
            🔍 AI Code Analysis
          </h1>

          <p className="text-slate-400 mt-2">
            Analyze your code for bugs, security,
            performance and best practices.
          </p>

        </div>


        {/* INPUT CARD */}

        <div className="bg-slate-800 rounded-xl p-6">

          {/* PROJECT */}

          <div className="mb-6">

            <label className="block text-sm font-medium mb-2">
              Select Project
            </label>

            <select
              value={selectedProject}
              onChange={(event) =>
                setSelectedProject(
                  event.target.value
                )
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >

              <option value="">
                Select a project
              </option>

              {projects.map((project) => (

                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.name}
                </option>

              ))}

            </select>

          </div>


          {/* LANGUAGE */}

          <div className="mb-6">

            <label className="block text-sm font-medium mb-2">
              Language
            </label>

            <select
              value={language}
              onChange={(event) =>
                setLanguage(
                  event.target.value
                )
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3"
            >

              <option value="javascript">
                JavaScript
              </option>

              <option value="jsx">
                React JSX
              </option>

              <option value="typescript">
                TypeScript
              </option>

              <option value="python">
                Python
              </option>

              <option value="java">
                Java
              </option>

              <option value="html">
                HTML
              </option>

              <option value="css">
                CSS
              </option>

              <option value="django">
                Django
              </option>

            </select>

          </div>


          {/* CODE */}

          <div>

            <label className="block text-sm font-medium mb-2">
              Code to Analyze
            </label>

            <textarea
              value={code}
              onChange={(event) =>
                setCode(
                  event.target.value
                )
              }
              placeholder="// Paste your code here..."
              rows="18"
              spellCheck="false"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-5 font-mono text-sm text-green-300 outline-none focus:border-indigo-500 resize-y"
            />

          </div>


          {/* ERROR */}

          {error && (

            <div className="mt-4 bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg">
              {error}
            </div>

          )}


          {/* SUCCESS */}

          {success && (

            <div className="mt-4 bg-green-500/10 border border-green-500 text-green-400 p-3 rounded-lg">
              {success}
            </div>

          )}


          {/* BUTTON */}

          <button
            onClick={analyzeCode}
            disabled={loading}
            className="mt-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 px-6 py-3 rounded-lg font-semibold"
          >
            {loading
              ? "Analyzing..."
              : "🔍 Analyze Code"}
          </button>

        </div>


        {/* ANALYSIS RESULT */}

        {analysis && (

          <div className="mt-8 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">

            {/* HEADER */}

            <div className="flex items-center justify-between p-5 border-b border-slate-700">

              <h2 className="text-xl font-semibold">
                🔍 Code Analysis Result
              </h2>

              <button
                onClick={copyAnalysis}
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm"
              >
                📋 Copy
              </button>

            </div>


            {/* RESULT */}

            <div className="p-6">

              <pre className="bg-slate-950 border border-slate-700 rounded-xl p-6 text-slate-300 whitespace-pre-wrap font-mono text-sm leading-6 overflow-x-auto">
                {analysis}
              </pre>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default AICodeAnalysis;