import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AICodeGenerator() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");

  const [prompt, setPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  const [fileName, setFileName] = useState("");
  const [fileLanguage, setFileLanguage] = useState("jsx");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

        console.log("Projects:", response.data);

        setProjects(response.data);

        // Automatically select first project
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
  // GENERATE CODE
  // ==========================================

  const generateCode = async () => {
    if (!selectedProject) {
      setError("Please select a project.");
      return;
    }

    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setGeneratedCode("");

    const token = localStorage.getItem("access");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/ai-requests/",
        {
          project: Number(selectedProject),
          prompt: prompt,
          request_type: "code_generation",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("AI response:", response.data);

      setGeneratedCode(response.data.response);

    } catch (err) {
      console.error("AI generation error:", err);

      if (err.response?.status === 401) {
        setError(
          "Your login session has expired. Please login again."
        );
      } else {
        setError(
          err.response?.data?.detail ||
          "Failed to generate code."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SAVE GENERATED CODE TO PROJECT
  // ==========================================

  const saveToProject = async () => {
    if (!selectedProject) {
      setError("Please select a project.");
      return;
    }

    if (!fileName.trim()) {
      setError("Please enter a file name.");
      return;
    }

    if (!generatedCode.trim()) {
      setError("Please generate code first.");
      return;
    }

    const token = localStorage.getItem("access");

    if (!token) {
      navigate("/login");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/files/",
        {
          project: Number(selectedProject),
          name: fileName.trim(),
          language: fileLanguage,
          content: generatedCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("File saved:", response.data);

      setSuccess(
        `${fileName} was successfully saved to the project.`
      );

      // Clear filename after saving
      setFileName("");

    } catch (err) {
      console.error("Error saving file:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/login");
      } else {
        setError(
          err.response?.data
            ? JSON.stringify(err.response.data)
            : "Failed to save code to project."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // COPY CODE
  // ==========================================

  const copyCode = async () => {
    if (!generatedCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedCode);
      setSuccess("Code copied to clipboard.");
    } catch (err) {
      console.error("Copy failed:", err);
      setError("Failed to copy code.");
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">

          <button
            onClick={() => navigate("/dashboard")}
            className="text-slate-400 hover:text-white mb-5"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold">
            🤖 AI Code Generator
          </h1>

          <p className="text-slate-400 mt-2">
            Describe what you want to build and let AI generate the code.
          </p>

        </div>


        {/* Generator Card */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg">

          {/* Select Project */}
          <div className="mb-6">

            <label className="block text-sm font-medium mb-2">
              Select Project
            </label>

            <select
              value={selectedProject}
              onChange={(event) =>
                setSelectedProject(event.target.value)
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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


          {/* Prompt */}
          <div>

            <label className="block text-sm font-medium mb-2">
              What do you want to build?
            </label>

            <textarea
              value={prompt}
              onChange={(event) =>
                setPrompt(event.target.value)
              }
              placeholder="Example: Create a React e-commerce product page with product image, price, rating and Add to Cart button."
              rows="6"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

          </div>


          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg">
              {error}
            </div>
          )}


          {/* Success */}
          {success && (
            <div className="mt-4 bg-green-500/10 border border-green-500 text-green-400 p-3 rounded-lg">
              {success}
            </div>
          )}


          {/* Generate */}
          <button
            onClick={generateCode}
            disabled={loading}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 px-6 py-3 rounded-lg font-semibold transition"
          >
            {loading
              ? "Generating..."
              : "✨ Generate Code"}
          </button>

        </div>


        {/* Generated Code */}
        {generatedCode && (

          <div className="mt-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">

              <h2 className="text-xl font-semibold">
                Generated Code
              </h2>

              <button
                onClick={copyCode}
                className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm"
              >
                📋 Copy
              </button>

            </div>


            {/* Code */}
            <pre className="bg-black rounded-xl p-6 overflow-x-auto text-sm leading-6 border border-slate-700 whitespace-pre-wrap">
              <code>
                {generatedCode}
              </code>
            </pre>


            {/* Save Section */}
            <div className="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-6">

              <h3 className="text-lg font-semibold mb-4">
                💾 Save Generated Code
              </h3>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* File Name */}
                <div>

                  <label className="block text-sm font-medium mb-2">
                    File Name
                  </label>

                  <input
                    type="text"
                    value={fileName}
                    onChange={(event) =>
                      setFileName(event.target.value)
                    }
                    placeholder="Example: ProductPage.jsx"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-indigo-500"
                  />

                </div>


                {/* Language */}
                <div>

                  <label className="block text-sm font-medium mb-2">
                    Language
                  </label>

                  <select
                    value={fileLanguage}
                    onChange={(event) =>
                      setFileLanguage(event.target.value)
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-indigo-500"
                  >

                    <option value="jsx">
                      React JSX
                    </option>

                    <option value="javascript">
                      JavaScript
                    </option>

                    <option value="typescript">
                      TypeScript
                    </option>

                    <option value="python">
                      Python
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

                    <option value="java">
                      Java
                    </option>

                  </select>

                </div>

              </div>


              {/* Save */}
              <button
                onClick={saveToProject}
                disabled={saving}
                className="mt-5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 px-6 py-3 rounded-lg font-semibold transition"
              >
                {saving
                  ? "Saving..."
                  : "💾 Save to Project"}
              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default AICodeGenerator;