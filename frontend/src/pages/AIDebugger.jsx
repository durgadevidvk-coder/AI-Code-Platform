import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AIDebugger() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [debugResult, setDebugResult] = useState("");

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
          setError(
            "Failed to load projects."
          );
        }
      }
    };

    loadProjects();
  }, [navigate]);

  // ==========================================
  // DEBUG CODE
  // ==========================================

  const debugCode = async () => {
    if (!selectedProject) {
      setError(
        "Please select a project."
      );
      return;
    }

    if (!code.trim()) {
      setError(
        "Please enter the code."
      );
      return;
    }

    if (!errorMessage.trim()) {
      setError(
        "Please enter the error message."
      );
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
    setDebugResult("");

    const debugPrompt = `
You are an expert software debugging assistant.

Analyze the following ${language} code and error message.

Provide a detailed debugging response with:

1. Identify the problem
2. Explain the root cause
3. Explain why the error occurs
4. Provide the corrected code
5. Explain the fix
6. Give best practices to prevent this problem

CODE:

${code}

ERROR MESSAGE:

${errorMessage}
`;

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/ai-requests/",
        {
          project: Number(selectedProject),
          prompt: debugPrompt,
          request_type: "debugging",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Debug response:",
        response.data
      );

      setDebugResult(
        response.data.response
      );

      setSuccess(
        "Debugging completed successfully."
      );

    } catch (err) {
      console.error(
        "Debugging error:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        navigate("/login");
      } else {
        setError(
          err.response?.data?.detail ||
          "Failed to debug code."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // COPY RESULT
  // ==========================================

  const copyResult = async () => {
    if (!debugResult) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        debugResult
      );

      setSuccess(
        "Debug result copied to clipboard."
      );

    } catch (err) {
      console.error(
        "Copy failed:",
        err
      );

      setError(
        "Failed to copy result."
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
            🐛 AI Code Debugger
          </h1>

          <p className="text-slate-400 mt-2">
            Find bugs, understand errors and get corrected code using AI.
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
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3"
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

              <option value="django">
                Django
              </option>

              <option value="html">
                HTML
              </option>

              <option value="css">
                CSS
              </option>

            </select>

          </div>


          {/* CODE */}

          <div className="mb-6">

            <label className="block text-sm font-medium mb-2">
              Code
            </label>

            <textarea
              value={code}
              onChange={(event) =>
                setCode(
                  event.target.value
                )
              }
              placeholder="// Paste code containing the bug..."
              rows="14"
              spellCheck="false"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-5 font-mono text-sm text-green-300 outline-none focus:border-indigo-500 resize-y"
            />

          </div>


          {/* ERROR MESSAGE */}

          <div>

            <label className="block text-sm font-medium mb-2">
              Error Message
            </label>

            <textarea
              value={errorMessage}
              onChange={(event) =>
                setErrorMessage(
                  event.target.value
                )
              }
              placeholder="Paste the error message here..."
              rows="6"
              className="w-full bg-slate-950 border border-red-900 rounded-lg p-5 font-mono text-sm text-red-300 outline-none focus:border-indigo-500 resize-y"
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


          {/* DEBUG BUTTON */}

          <button
            onClick={debugCode}
            disabled={loading}
            className="mt-5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 px-6 py-3 rounded-lg font-semibold transition"
          >
            {loading
              ? "Debugging..."
              : "🐛 Debug Code"}
          </button>

        </div>


        {/* RESULT */}

        {debugResult && (

          <div className="mt-8 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">

            {/* HEADER */}

            <div className="flex items-center justify-between p-5 border-b border-slate-700">

              <h2 className="text-xl font-semibold">
                🐛 Debugging Result
              </h2>

              <button
                onClick={copyResult}
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm"
              >
                📋 Copy
              </button>

            </div>


            {/* RESULT */}

            <div className="p-6">

              <pre className="bg-slate-950 border border-slate-700 rounded-xl p-6 text-slate-300 whitespace-pre-wrap font-mono text-sm leading-6 overflow-x-auto">
                {debugResult}
              </pre>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default AIDebugger;