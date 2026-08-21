import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AIDocumentation() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  const [documentation, setDocumentation] = useState("");

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
          setSelectedProject(String(response.data[0].id));
        }
      } catch (err) {
        console.error("Error loading projects:", err);

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
  // GENERATE DOCUMENTATION
  // ==========================================

  const generateDocumentation = async () => {
    if (!selectedProject) {
      setError("Please select a project.");
      return;
    }

    if (!code.trim()) {
      setError("Please enter code.");
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
    setDocumentation("");

    const documentationPrompt = `
You are an expert software documentation assistant.

Generate clear, professional developer documentation for the following ${language} code.

Include:

1. Overview
2. Purpose of the code
3. Functions or components
4. Parameters or props
5. Return values
6. Important logic
7. Usage instructions
8. Example usage
9. Important notes
10. Best practice suggestions

Make the documentation easy for another developer to understand and use.

CODE:

${code}
`;

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/ai-requests/",
        {
          project: Number(selectedProject),
          prompt: documentationPrompt,
          request_type: "documentation",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Documentation response:",
        response.data
      );

      setDocumentation(response.data.response);

      setSuccess(
        "Documentation generated successfully."
      );
    } catch (err) {
      console.error(
        "Documentation error:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        navigate("/login");
      } else {
        setError(
          err.response?.data?.detail ||
          "Failed to generate documentation."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // COPY DOCUMENTATION
  // ==========================================

  const copyDocumentation = async () => {
    if (!documentation) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        documentation
      );

      setSuccess(
        "Documentation copied to clipboard."
      );
    } catch (err) {
      console.error(
        "Copy failed:",
        err
      );

      setError(
        "Failed to copy documentation."
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
            📚 AI Documentation Generator
          </h1>

          <p className="text-slate-400 mt-2">
            Generate clear and professional documentation
            for your code using AI.
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

          <div>

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
            onClick={generateDocumentation}
            disabled={loading}
            className="mt-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 px-6 py-3 rounded-lg font-semibold transition"
          >
            {loading
              ? "Generating..."
              : "📚 Generate Documentation"}
          </button>

        </div>


        {/* DOCUMENTATION RESULT */}

        {documentation && (

          <div className="mt-8 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">

            {/* HEADER */}

            <div className="flex items-center justify-between p-5 border-b border-slate-700">

              <h2 className="text-xl font-semibold">
                📚 Generated Documentation
              </h2>

              <button
                onClick={copyDocumentation}
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm"
              >
                📋 Copy
              </button>

            </div>


            {/* RESULT */}

            <div className="p-6">

              <pre className="bg-slate-950 border border-slate-700 rounded-xl p-6 text-slate-300 whitespace-pre-wrap font-mono text-sm leading-6 overflow-x-auto">
                {documentation}
              </pre>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default AIDocumentation;