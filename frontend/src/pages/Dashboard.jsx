import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard({ onLogout }) {
  const navigate = useNavigate();

  const [aiRequests, setAiRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
const [showProjectModal, setShowProjectModal] = useState(false);
const [projectName, setProjectName] = useState("");
const [projectDescription, setProjectDescription] = useState("");
const [creatingProject, setCreatingProject] = useState(false);
  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================
  useEffect(() => {
    const fetchDashboardData = async () => {
      const accessToken = localStorage.getItem("access");

      if (!accessToken) {
        navigate("/login");
        return;
      }

      try {
        // Fetch AI Requests
        const aiResponse = await axios.get(
          "http://127.0.0.1:8000/api/ai-requests/",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        console.log("AI Requests:", aiResponse.data);

        setAiRequests(aiResponse.data);

        // Fetch Projects
        const projectResponse = await axios.get(
          "http://127.0.0.1:8000/api/projects/",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        console.log("Projects:", projectResponse.data);

        setProjects(projectResponse.data);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");

          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);


  // ==========================================
  // LOGOUT
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    if (onLogout) {
      onLogout();
    }

    navigate("/login");
  };

const handleCreateProject = async (event) => {
  event.preventDefault();

  if (!projectName.trim()) {
    return;
  }

  const accessToken = localStorage.getItem("access");

  if (!accessToken) {
    navigate("/login");
    return;
  }

  setCreatingProject(true);

  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/projects/",
      {
        name: projectName,
        description: projectDescription,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Project created:", response.data);

    setProjects((previousProjects) => [
      ...previousProjects,
      response.data,
    ]);

    setProjectName("");
    setProjectDescription("");

    setShowProjectModal(false);

  } catch (error) {
    console.error("Error creating project:", error);
  } finally {
    setCreatingProject(false);
  }
};
  return (
    <div className="min-h-screen bg-slate-900 text-white">

      {/* ==========================================
          NAVBAR
      ========================================== */}

      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold">
            AI
          </div>

          <h1 className="text-xl font-bold">
            AI Developer Workspace
          </h1>

        </div>


        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition"
        >
          Logout
        </button>

      </nav>


      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <main className="max-w-7xl mx-auto px-6 py-10">


        {/* ==========================================
            WELCOME
        ========================================== */}

        <div className="mb-10">

          <h2 className="text-4xl font-bold">
            Welcome back! 👋
          </h2>

          <p className="text-slate-400 mt-2">
            Build, analyze and improve your code using AI.
          </p>

        </div>


        {/* ==========================================
            STATISTICS
        ========================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">


          {/* Projects */}

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">

            <p className="text-slate-400">
              Projects
            </p>

            <h3 className="text-3xl font-bold mt-2">
              {projects.length}
            </h3>

          </div>


          {/* AI Requests */}

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">

            <p className="text-slate-400">
              AI Requests
            </p>

            <h3 className="text-3xl font-bold mt-2">
              {aiRequests.length}
            </h3>

          </div>


          {/* Generated Code */}

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">

            <p className="text-slate-400">
              Generated Code
            </p>

            <h3 className="text-3xl font-bold mt-2">

              {
                aiRequests.filter(
                  (request) => request.response
                ).length
              }

            </h3>

          </div>

        </div>


        {/* ==========================================
            AI CODE GENERATOR
        ========================================== */}

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8">

          <div className="max-w-3xl">

            <div className="text-4xl mb-4">
              🤖
            </div>

            <h2 className="text-3xl font-bold mb-3">
              AI Code Generator
            </h2>

            <p className="text-indigo-100 mb-6">
              Describe what you want to build and let AI generate
              production-ready code for you.
            </p>

            <button
              onClick={() => navigate("/ai-generator")}
              className="bg-white text-indigo-700 hover:bg-slate-100 px-6 py-3 rounded-lg font-semibold transition"
            >
              ✨ Start Generating Code
            </button>

<button
  onClick={() => navigate("/ai-analysis")}
  className="ml-3 bg-white/10 text-white hover:bg-white/20 border border-white/20 px-6 py-3 rounded-lg font-semibold transition"
>
  🔍 Analyze Code
</button>

<button
  onClick={() => navigate("/ai-debugger")}
  className="ml-3 bg-red-500/20 text-red-200 hover:bg-red-500/30 border border-red-300/20 px-6 py-3 rounded-lg font-semibold transition"
>
  🐛 Debug Code
</button>


<button
  onClick={() => navigate("/ai-documentation")}
  className="mt-4 bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg font-medium transition"
>
  📚 AI Documentation
</button>

<button
  onClick={() => navigate("/ai-improvement")}
  className="mt-4 bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg font-medium transition"
>
  ✨ Improve Code
</button>

<div className="mt-6">
  <button
    onClick={() => navigate("/ai-history")}
    className="bg-slate-900/60 hover:bg-slate-900 border border-white/20 hover:border-white/40 px-5 py-3 rounded-lg font-semibold transition"
  >
    🕘 View AI Request History
  </button>
</div>
          </div>

        </div>


        {/* ==========================================
            RECENT AI REQUESTS
        ========================================== */}

        <div className="mt-10">

          <div className="mb-5">

            <h2 className="text-2xl font-bold">
              Recent AI Requests
            </h2>

            <p className="text-slate-400 text-sm mt-1">
              Your previous AI code generation requests
            </p>

          </div>


          {/* Loading */}

          {loading && (

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">

              <p className="text-slate-400">
                Loading request history...
              </p>

            </div>

          )}


          {/* No Requests */}

          {!loading && aiRequests.length === 0 && (

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">

              <div className="text-4xl mb-3">
                🤖
              </div>

              <h3 className="text-lg font-semibold">
                No AI requests yet
              </h3>

              <p className="text-slate-400 mt-2">
                Generate your first piece of code using the AI Code Generator.
              </p>

              <button
                onClick={() => navigate("/ai-generator")}
                className="mt-5 bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-lg font-medium"
              >
                Generate Code
              </button>

            </div>

          )}


          {/* Request List */}

          {!loading && aiRequests.length > 0 && (

            <div className="space-y-4">

              {aiRequests.map((request) => (

                <div
                  key={request.id}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-indigo-500 transition"
                >

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">


                    {/* Request Details */}

                    <div className="flex-1">

                      <h3 className="text-lg font-semibold">
                        {request.prompt}
                      </h3>


                      <div className="flex flex-wrap items-center gap-3 mt-3">

                        <span className="bg-indigo-600/20 text-indigo-300 px-3 py-1 rounded-full text-xs">

                          {request.request_type === "code_generation"
                            ? "Code Generation"
                            : request.request_type}

                        </span>


                        <span className="text-slate-500 text-sm">

                          {new Date(
                            request.created_at
                          ).toLocaleString()}

                        </span>

                      </div>

                    </div>


                    {/* View Code */}

                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-lg font-medium transition"
                    >
                      View Code
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>


        {/* ==========================================
            MY PROJECTS
        ========================================== */}

        <div className="mt-10">

          <div className="flex items-center justify-between mb-5">

            <div>

              <h2 className="text-2xl font-bold">
                My Projects
              </h2>

              <p className="text-slate-400 text-sm mt-1">
                Manage your development projects
              </p>

            </div>
<button
    onClick={() => setShowProjectModal(true)}
    className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-lg font-medium transition"
  >
    + New Project
  </button>
          </div>


          {/* No Projects */}

          {projects.length === 0 ? (

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">

              <div className="text-4xl mb-3">
                📁
              </div>

              <h3 className="text-lg font-semibold">
                No projects yet
              </h3>

              <p className="text-slate-400 mt-2">
                Create your first project to get started.
              </p>

            </div>

          ) : (

            /* Project Cards */

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {projects.map((project) => (

                <div
                  key={project.id}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-indigo-500 transition"
                >

                  <div className="text-3xl mb-4">
                    📁
                  </div>


                  <h3 className="text-xl font-semibold">
                    {project.name}
                  </h3>


                  <p className="text-slate-400 text-sm mt-2">
                    {project.description ||
                      "No description provided."}
                  </p>


                  <p className="text-slate-500 text-xs mt-4">

                    Created:{" "}

                    {new Date(
                      project.created_at
                    ).toLocaleDateString()}

                  </p>

<button
  onClick={() => navigate(`/project/${project.id}`)}
  className="mt-5 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition"
>
  Open Project
</button>

                </div>

              ))}

            </div>

          )}

        </div>

      </main>


      {/* ==========================================
          VIEW CODE MODAL
      ========================================== */}

      {selectedRequest && (

        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">


          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col">


            {/* Modal Header */}

            <div className="flex items-center justify-between p-6 border-b border-slate-700">

              <div>

                <h2 className="text-xl font-bold">
                  Generated Code
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  {selectedRequest.prompt}
                </p>

              </div>


              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ✕
              </button>

            </div>


            {/* Generated Code */}

            <div className="p-6 overflow-auto">

              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-5 overflow-x-auto text-sm text-green-300 whitespace-pre-wrap">
                {selectedRequest.response ||
                  "No generated code available."}
              </pre>

            </div>


            {/* Modal Footer */}

            <div className="p-6 border-t border-slate-700 flex justify-end">

              <button
                onClick={() => setSelectedRequest(null)}
                className="bg-slate-700 hover:bg-slate-600 px-5 py-2 rounded-lg"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

{showProjectModal && (

  <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">

    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg">

      <div className="flex items-center justify-between p-6 border-b border-slate-700">

        <div>

          <h2 className="text-xl font-bold">
            Create New Project
          </h2>

          <p className="text-slate-400 text-sm mt-1">
            Create a new development project.
          </p>

        </div>

        <button
          onClick={() => setShowProjectModal(false)}
          className="text-slate-400 hover:text-white text-2xl"
        >
          ✕
        </button>

      </div>


      <form
        onSubmit={handleCreateProject}
        className="p-6 space-y-5"
      >

        <div>

          <label className="block text-sm font-medium mb-2">
            Project Name
          </label>

          <input
            type="text"
            value={projectName}
            onChange={(event) =>
              setProjectName(event.target.value)
            }
            placeholder="Example: AI Login App"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-indigo-500"
          />

        </div>


        <div>

          <label className="block text-sm font-medium mb-2">
            Description
          </label>

          <textarea
            value={projectDescription}
            onChange={(event) =>
              setProjectDescription(event.target.value)
            }
            placeholder="Describe your project..."
            rows="5"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 resize-none"
          />

        </div>


        <div className="flex justify-end gap-3">

          <button
            type="button"
            onClick={() => setShowProjectModal(false)}
            className="bg-slate-700 hover:bg-slate-600 px-5 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={creatingProject}
            className="bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-lg font-medium"
          >
            {creatingProject
              ? "Creating..."
              : "Create Project"}
          </button>

        </div>

      </form>

    </div>

  </div>

)}



    </div>
  );
}

export default Dashboard;