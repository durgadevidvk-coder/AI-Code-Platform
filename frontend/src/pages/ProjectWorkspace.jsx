import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Editor from "@monaco-editor/react";

function ProjectWorkspace() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(true);

  // Editing and saving
  const [editedContent, setEditedContent] = useState("");
  const [savingFile, setSavingFile] = useState(false);

  // Copy
  const [copyingFile, setCopyingFile] = useState(false);

  // Create File Modal
  const [showFileModal, setShowFileModal] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileLanguage, setFileLanguage] = useState("javascript");
  const [fileContent, setFileContent] = useState("");
  const [creatingFile, setCreatingFile] = useState(false);

  // Rename File Modal
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameFileName, setRenameFileName] = useState("");
  const [renamingFile, setRenamingFile] = useState(false);

  // Delete File
  const [deletingFile, setDeletingFile] = useState(false);

  // ==========================================
  // GET MONACO LANGUAGE
  // ==========================================

  const getEditorLanguage = (language, fileName) => {
    const name = fileName?.toLowerCase() || "";

    if (name.endsWith(".jsx")) return "javascript";
    if (name.endsWith(".tsx")) return "typescript";
    if (name.endsWith(".ts")) return "typescript";
    if (name.endsWith(".js")) return "javascript";
    if (name.endsWith(".py")) return "python";
    if (name.endsWith(".html")) return "html";
    if (name.endsWith(".css")) return "css";
    if (name.endsWith(".json")) return "json";
    if (name.endsWith(".java")) return "java";

    switch (language?.toLowerCase()) {
      case "jsx":
        return "javascript";

      case "javascript":
      case "js":
        return "javascript";

      case "typescript":
      case "ts":
        return "typescript";

      case "python":
        return "python";

      case "html":
        return "html";

      case "css":
        return "css";

      case "json":
        return "json";

      case "java":
        return "java";

      case "django":
        return "python";

      default:
        return "javascript";
    }
  };

  // ==========================================
  // LOAD PROJECT
  // ==========================================

  useEffect(() => {
    const loadProject = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        navigate("/login");
        return;
      }

      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        // GET PROJECT
        const projectResponse = await axios.get(
          `http://127.0.0.1:8000/api/projects/${projectId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Project:", projectResponse.data);

        setProject(projectResponse.data);

        // GET ALL FILES
        const filesResponse = await axios.get(
          "http://127.0.0.1:8000/api/files/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("All files:", filesResponse.data);

        // FILTER CURRENT PROJECT FILES
        const projectFiles = filesResponse.data.filter(
          (file) =>
            String(file.project) === String(projectId)
        );

        console.log("Project files:", projectFiles);

        setFiles(projectFiles);

        // SELECT FIRST FILE
        if (projectFiles.length > 0) {
          setSelectedFile(projectFiles[0]);
          setEditedContent(projectFiles[0].content || "");
        }
      } catch (error) {
        console.error("Error loading project:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");

          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, navigate]);

  // ==========================================
  // SELECT FILE
  // ==========================================

  const handleSelectFile = (file) => {
    setSelectedFile(file);
    setEditedContent(file.content || "");
  };

  // ==========================================
  // CREATE NEW FILE
  // ==========================================

  const handleCreateFile = async (event) => {
    event.preventDefault();

    if (!fileName.trim()) {
      alert("Please enter a file name.");
      return;
    }

    const token = localStorage.getItem("access");

    if (!token) {
      navigate("/login");
      return;
    }

    setCreatingFile(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/files/",
        {
          project: projectId,
          name: fileName.trim(),
          language: fileLanguage,
          content: fileContent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("File created:", response.data);

      // Add new file
      setFiles((previousFiles) => [
        ...previousFiles,
        response.data,
      ]);

      // Select new file
      setSelectedFile(response.data);

      // Load content
      setEditedContent(response.data.content || "");

      // Clear form
      setFileName("");
      setFileLanguage("javascript");
      setFileContent("");

      // Close modal
      setShowFileModal(false);

      alert("File created successfully!");
    } catch (error) {
      console.error("Error creating file:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        navigate("/login");
        return;
      }

      alert(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Failed to create file."
      );
    } finally {
      setCreatingFile(false);
    }
  };

  // ==========================================
  // SAVE FILE
  // ==========================================

  const handleSaveFile = async () => {
    if (!selectedFile) {
      return;
    }

    const token = localStorage.getItem("access");

    if (!token) {
      navigate("/login");
      return;
    }

    setSavingFile(true);

    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/files/${selectedFile.id}/`,
        {
          content: editedContent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("File saved:", response.data);

      // Update selected file
      setSelectedFile(response.data);

      // Update file list
      setFiles((previousFiles) =>
        previousFiles.map((file) =>
          file.id === response.data.id
            ? response.data
            : file
        )
      );

      // Keep editor updated
      setEditedContent(response.data.content || "");

      alert("File saved successfully!");
    } catch (error) {
      console.error("Error saving file:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        navigate("/login");
        return;
      }

      alert(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Failed to save file."
      );
    } finally {
      setSavingFile(false);
    }
  };

  // ==========================================
  // COPY FILE
  // ==========================================

  const handleCopyFile = async () => {
    if (!editedContent) {
      alert("There is no code to copy.");
      return;
    }

    try {
      setCopyingFile(true);

      await navigator.clipboard.writeText(editedContent);

      alert("Code copied to clipboard!");
    } catch (error) {
      console.error("Copy failed:", error);

      alert("Failed to copy code.");
    } finally {
      setCopyingFile(false);
    }
  };

  // ==========================================
  // RENAME FILE
  // ==========================================

  const handleRenameFile = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      return;
    }

    if (!renameFileName.trim()) {
      alert("Please enter a file name.");
      return;
    }

    const token = localStorage.getItem("access");

    if (!token) {
      navigate("/login");
      return;
    }

    setRenamingFile(true);

    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/files/${selectedFile.id}/`,
        {
          name: renameFileName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("File renamed:", response.data);

      // Update selected file
      setSelectedFile(response.data);

      // Update file list
      setFiles((previousFiles) =>
        previousFiles.map((file) =>
          file.id === response.data.id
            ? response.data
            : file
        )
      );

      // Close modal
      setShowRenameModal(false);
      setRenameFileName("");

      alert("File renamed successfully!");
    } catch (error) {
      console.error("Error renaming file:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        navigate("/login");
        return;
      }

      alert(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Failed to rename file."
      );
    } finally {
      setRenamingFile(false);
    }
  };

  // ==========================================
  // DELETE FILE
  // ==========================================

  const handleDeleteFile = async () => {
    if (!selectedFile) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${selectedFile.name}"?`
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("access");

    if (!token) {
      navigate("/login");
      return;
    }

    setDeletingFile(true);

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/files/${selectedFile.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("File deleted:", selectedFile.id);

      // Remove deleted file
      const remainingFiles = files.filter(
        (file) => file.id !== selectedFile.id
      );

      setFiles(remainingFiles);

      // Select another file if available
      if (remainingFiles.length > 0) {
        setSelectedFile(remainingFiles[0]);

        setEditedContent(
          remainingFiles[0].content || ""
        );
      } else {
        setSelectedFile(null);
        setEditedContent("");
      }

      alert("File deleted successfully!");
    } catch (error) {
      console.error("Error deleting file:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        navigate("/login");
        return;
      }

      alert(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Failed to delete file."
      );
    } finally {
      setDeletingFile(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-slate-400 text-lg">
          Loading project...
        </p>
      </div>
    );
  }

  // ==========================================
  // PROJECT NOT FOUND
  // ==========================================

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">

          <div className="text-5xl mb-4">
            📁
          </div>

          <h2 className="text-2xl font-bold">
            Project not found
          </h2>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-5 bg-indigo-600 hover:bg-indigo-700 px-5 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>

        </div>
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
              {project.name}
            </h1>

            <p className="text-slate-400 text-sm">
              Project Workspace
            </p>

          </div>

        </div>

      </nav>

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* PROJECT HEADER */}

        <div className="mb-8">

          <h2 className="text-3xl font-bold">
            📁 {project.name}
          </h2>

          <p className="text-slate-400 mt-2">
            {project.description ||
              "Manage your project files and code."}
          </p>

        </div>

        {/* ==========================================
            WORKSPACE
        ========================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ==========================================
              FILE SIDEBAR
          ========================================== */}

          <div className="lg:col-span-1">

            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">

              {/* FILE HEADER */}

              <div className="p-5 border-b border-slate-700">

                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="font-semibold text-lg">
                      Code Files
                    </h3>

                    <p className="text-slate-400 text-sm mt-1">
                      {files.length}{" "}
                      {files.length === 1
                        ? "file"
                        : "files"}
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setShowFileModal(true)
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 w-9 h-9 rounded-lg text-xl"
                    title="Create new file"
                  >
                    +
                  </button>

                </div>

              </div>

              {/* FILE LIST */}

              {files.length === 0 ? (

                <div className="p-6 text-center">

                  <div className="text-4xl mb-3">
                    📄
                  </div>

                  <p className="text-slate-400 text-sm">
                    No code files yet.
                  </p>

                  <button
                    onClick={() =>
                      setShowFileModal(true)
                    }
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm"
                  >
                    + Create File
                  </button>

                </div>

              ) : (

                <div className="p-2">

                  {files.map((file) => (

                    <button
                      key={file.id}
                      onClick={() =>
                        handleSelectFile(file)
                      }
                      className={`w-full text-left p-4 rounded-lg transition ${
                        selectedFile?.id === file.id
                          ? "bg-indigo-600"
                          : "hover:bg-slate-700"
                      }`}
                    >

                      <div className="flex items-center gap-3">

                        <span className="text-xl">
                          📄
                        </span>

                        <div className="min-w-0">

                          <p className="font-medium truncate">
                            {file.name}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            {file.language ||
                              "Unknown"}
                          </p>

                        </div>

                      </div>

                    </button>

                  ))}

                </div>

              )}

            </div>

          </div>

          {/* ==========================================
              CODE AREA
          ========================================== */}

          <div className="lg:col-span-3">

            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">

              {selectedFile ? (

                <>

                  {/* FILE HEADER */}

                  <div className="flex items-center justify-between p-5 border-b border-slate-700">

                    <div>

                      <h3 className="text-lg font-semibold">
                        {selectedFile.name}
                      </h3>

                      <p className="text-slate-400 text-sm mt-1">
                        {selectedFile.language ||
                          "Unknown language"}
                      </p>

                    </div>

                    {/* ACTION BUTTONS */}

                    <div className="flex items-center gap-2">

                      {/* RENAME */}

                      <button
                        onClick={() => {
                          setRenameFileName(
                            selectedFile.name
                          );

                          setShowRenameModal(true);
                        }}
                        className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-medium transition"
                      >
                        ✏️ Rename
                      </button>

                      {/* DELETE */}

                      <button
                        onClick={handleDeleteFile}
                        disabled={deletingFile}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition"
                      >
                        {deletingFile
                          ? "Deleting..."
                          : "🗑️ Delete"}
                      </button>

                      {/* SAVE */}

                      <button
                        onClick={handleSaveFile}
                        disabled={savingFile}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed px-5 py-2 rounded-lg font-medium transition"
                      >
                        {savingFile
                          ? "Saving..."
                          : "💾 Save"}
                      </button>

                    </div>

                  </div>

                  {/* ==========================================
                      MONACO CODE EDITOR
                  ========================================== */}

                  <div className="p-6">

                    <div className="bg-slate-950 border border-slate-700 rounded-xl overflow-hidden">

                      {/* EDITOR TOOLBAR */}

                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">

                        <div className="flex items-center gap-2">

                          <span className="w-3 h-3 rounded-full bg-red-500"></span>

                          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>

                          <span className="w-3 h-3 rounded-full bg-green-500"></span>

                          <span className="ml-3 text-sm text-slate-400">
                            {selectedFile.name}
                          </span>

                        </div>

                        {/* COPY */}

                        <button
                          onClick={handleCopyFile}
                          disabled={copyingFile}
                          className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-sm transition"
                        >
                          {copyingFile
                            ? "Copied!"
                            : "📋 Copy"}
                        </button>

                      </div>

                      {/* MONACO */}

                      <Editor
                        height="500px"
                        language={getEditorLanguage(
                          selectedFile.language,
                          selectedFile.name
                        )}
                        value={editedContent}
                        onChange={(value) =>
                          setEditedContent(value || "")
                        }
                        theme="vs-dark"
                        options={{
                          minimap: {
                            enabled: true,
                          },

                          fontSize: 14,

                          wordWrap: "on",

                          automaticLayout: true,

                          lineNumbers: "on",

                          scrollBeyondLastLine: false,

                          smoothScrolling: true,

                          cursorBlinking: "smooth",

                          padding: {
                            top: 15,
                            bottom: 15,
                          },

                          tabSize: 2,

                          insertSpaces: true,

                          formatOnPaste: true,

                          formatOnType: true,
                        }}
                      />

                    </div>

                  </div>

                </>

              ) : (

                <div className="min-h-[500px] flex items-center justify-center">

                  <div className="text-center">

                    <div className="text-5xl mb-4">
                      📄
                    </div>

                    <h3 className="text-xl font-semibold">
                      Select a file
                    </h3>

                    <p className="text-slate-400 mt-2">
                      Select a code file from the left.
                    </p>

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      </main>

      {/* ==========================================
          CREATE FILE MODAL
      ========================================== */}

      {showFileModal && (

        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">

          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg">

            {/* HEADER */}

            <div className="flex items-center justify-between p-6 border-b border-slate-700">

              <div>

                <h2 className="text-xl font-bold">
                  Create New Code File
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  Add a file to your project.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowFileModal(false)
                }
                className="text-slate-400 hover:text-white text-2xl"
              >
                ✕
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleCreateFile}
              className="p-6 space-y-5"
            >

              {/* FILE NAME */}

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
                  placeholder="Example: App.jsx"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-indigo-500"
                />

              </div>

              {/* LANGUAGE */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Language
                </label>

                <select
                  value={fileLanguage}
                  onChange={(event) =>
                    setFileLanguage(event.target.value)
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-indigo-500"
                >

                  <option value="javascript">
                    JavaScript
                  </option>

                  <option value="jsx">
                    React JSX
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

                  <option value="typescript">
                    TypeScript
                  </option>

                  <option value="json">
                    JSON
                  </option>

                </select>

              </div>

              {/* CONTENT */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Code
                </label>

                <textarea
                  value={fileContent}
                  onChange={(event) =>
                    setFileContent(event.target.value)
                  }
                  placeholder="Write your code here..."
                  rows="8"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 resize-none font-mono text-sm"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowFileModal(false)
                  }
                  className="bg-slate-700 hover:bg-slate-600 px-5 py-2 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingFile}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 px-5 py-2 rounded-lg font-medium"
                >
                  {creatingFile
                    ? "Creating..."
                    : "Create File"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ==========================================
          RENAME FILE MODAL
      ========================================== */}

      {showRenameModal && selectedFile && (

        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">

          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md">

            {/* HEADER */}

            <div className="flex items-center justify-between p-6 border-b border-slate-700">

              <div>

                <h2 className="text-xl font-bold">
                  Rename File
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  Change the name of your code file.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowRenameModal(false)
                }
                className="text-slate-400 hover:text-white text-2xl"
              >
                ✕
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleRenameFile}
              className="p-6 space-y-5"
            >

              <div>

                <label className="block text-sm font-medium mb-2">
                  File Name
                </label>

                <input
                  type="text"
                  value={renameFileName}
                  onChange={(event) =>
                    setRenameFileName(
                      event.target.value
                    )
                  }
                  autoFocus
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-indigo-500"
                />

              </div>

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setShowRenameModal(false)
                  }
                  className="bg-slate-700 hover:bg-slate-600 px-5 py-2 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={renamingFile}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 px-5 py-2 rounded-lg font-medium"
                >
                  {renamingFile
                    ? "Renaming..."
                    : "Rename"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default ProjectWorkspace;