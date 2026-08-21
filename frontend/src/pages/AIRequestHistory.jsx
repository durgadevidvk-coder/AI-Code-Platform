import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AIRequestHistory() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // ==========================================
  // LOAD AI REQUEST HISTORY
  // ==========================================

  useEffect(() => {
    const loadHistory = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/ai-requests/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("AI Request History:", response.data);

        setRequests(response.data);
      } catch (error) {
        console.error(
          "Error loading AI request history:",
          error
        );

        if (error.response?.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");

          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [navigate]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-slate-400 text-lg">
          Loading AI history...
        </p>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-900 text-white">

      {/* ==========================================
          NAVBAR
      ========================================== */}

      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">

        <div className="max-w-7xl mx-auto flex items-center gap-4">

          <button
            onClick={() => navigate("/dashboard")}
            className="text-slate-300 hover:text-white"
          >
            ← Back
          </button>

          <div className="h-6 w-px bg-slate-700"></div>

          <div>
            <h1 className="text-xl font-bold">
              AI Request History
            </h1>

            <p className="text-slate-400 text-sm">
              View your previous AI requests and responses
            </p>
          </div>

        </div>

      </nav>

      {/* ==========================================
          CONTENT
      ========================================== */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-8">

          <h2 className="text-3xl font-bold">
            🤖 AI History
          </h2>

          <p className="text-slate-400 mt-2">
            {requests.length}{" "}
            {requests.length === 1
              ? "request"
              : "requests"}{" "}
            found.
          </p>

        </div>

        {/* ==========================================
            NO REQUESTS
        ========================================== */}

        {requests.length === 0 ? (

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">

            <div className="text-6xl mb-5">
              🤖
            </div>

            <h3 className="text-xl font-semibold">
              No AI requests yet
            </h3>

            <p className="text-slate-400 mt-2">
              Generate some code using the AI Code Generator
              and your requests will appear here.
            </p>

            <button
              onClick={() =>
                navigate("/ai-code-generator")
              }
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-lg font-medium"
            >
              Open AI Code Generator
            </button>

          </div>

        ) : (

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ==========================================
                REQUEST LIST
            ========================================== */}

            <div className="lg:col-span-1">

              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">

                <div className="p-5 border-b border-slate-700">

                  <h3 className="font-semibold text-lg">
                    Previous Requests
                  </h3>

                </div>

                <div className="p-2 max-h-[650px] overflow-y-auto">

                  {requests.map((request) => (

                    <button
                      key={request.id}
                      onClick={() =>
                        setSelectedRequest(request)
                      }
                      className={`w-full text-left p-4 rounded-lg transition mb-1 ${
                        selectedRequest?.id === request.id
                          ? "bg-indigo-600"
                          : "hover:bg-slate-700"
                      }`}
                    >

                      <p className="font-medium truncate">
                        {request.prompt}
                      </p>

                      <div className="flex items-center justify-between mt-2">

                        <span className="text-xs text-slate-400">
                          {request.request_type ||
                            "Code Generation"}
                        </span>

                        <span className="text-xs text-slate-400">
                          {new Date(
                            request.created_at
                          ).toLocaleDateString()}
                        </span>

                      </div>

                    </button>

                  ))}

                </div>

              </div>

            </div>

            {/* ==========================================
                REQUEST DETAILS
            ========================================== */}

            <div className="lg:col-span-2">

              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden min-h-[650px]">

                {selectedRequest ? (

                  <>

                    {/* HEADER */}

                    <div className="p-5 border-b border-slate-700">

                      <div className="flex items-center justify-between">

                        <div>

                          <h3 className="text-lg font-semibold">
                            AI Request #{selectedRequest.id}
                          </h3>

                          <p className="text-slate-400 text-sm mt-1">
                            {new Date(
                              selectedRequest.created_at
                            ).toLocaleString()}
                          </p>

                        </div>

                        <span className="bg-indigo-600/20 text-indigo-300 px-3 py-1 rounded-full text-sm">
                          {selectedRequest.request_type ||
                            "Code Generation"}
                        </span>

                      </div>

                    </div>

                    {/* PROMPT */}

                    <div className="p-6 border-b border-slate-700">

                      <h4 className="font-semibold mb-3">
                        📝 Prompt
                      </h4>

                      <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-300 whitespace-pre-wrap">
                        {selectedRequest.prompt}
                      </div>

                    </div>

                    {/* RESPONSE */}

                    <div className="p-6">

                      <h4 className="font-semibold mb-3">
                        🤖 AI Response
                      </h4>

                      <pre className="bg-slate-950 border border-slate-700 rounded-lg p-5 text-green-300 font-mono text-sm whitespace-pre-wrap overflow-x-auto max-h-[450px] overflow-y-auto">
                        {selectedRequest.response ||
                          "No response available."}
                      </pre>

                    </div>

                  </>

                ) : (

                  <div className="min-h-[650px] flex items-center justify-center">

                    <div className="text-center">

                      <div className="text-5xl mb-4">
                        🤖
                      </div>

                      <h3 className="text-xl font-semibold">
                        Select an AI request
                      </h3>

                      <p className="text-slate-400 mt-2">
                        Select a request from the left to view
                        the prompt and AI response.
                      </p>

                    </div>

                  </div>

                )}

              </div>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}

export default AIRequestHistory;