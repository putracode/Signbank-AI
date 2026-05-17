import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";

import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

import api from "../services/api";

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType);

function AdminDashboardPage() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [formData, setFormData] = useState({
    termName: "",
    category: "",
    description: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const { data } = await api.get("/glosarium");
      setTerms(data.data.glosariums);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/admin/login");
  };

  const handleOpenModal = (term = null) => {
    if (term) {
      setEditingTerm(term);
      setFormData({
        termName: term.termName,
        category: term.category,
        description: term.description,
      });
    } else {
      setEditingTerm(null);
      setFormData({ termName: "", category: "", description: "" });
    }
    setThumbnailFile(null);
    setVideoFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const data = new FormData();
    data.append("termName", formData.termName);
    data.append("category", formData.category);
    data.append("description", formData.description);
    if (thumbnailFile) data.append("thumbnail", thumbnailFile);
    if (videoFile) data.append("video", videoFile);

    try {
      if (editingTerm) {
        await api.put(`/glosarium/${editingTerm.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Istilah berhasil diperbarui!");
      } else {
        await api.post("/glosarium", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Istilah berhasil ditambahkan!");
      }
      setIsModalOpen(false);
      fetchTerms();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Gagal menyimpan data";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1d4ed8",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      borderRadius: "1rem",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/glosarium/${id}`);
        toast.success("Istilah berhasil dihapus!");
        fetchTerms();
      } catch (err) {
        toast.error("Gagal menghapus data");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-blue-700">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="text-red-600 font-medium hover:underline"
        >
          Logout
        </button>
      </nav>

      <main className="p-6 lg:p-10 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Kelola Glosarium</h2>
            <p className="text-gray-500">Tambah, ubah, atau hapus istilah keuangan</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-md"
          >
            + Tambah Istilah
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">Memuat data...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">Istilah</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">Kategori</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">Deskripsi</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {terms.map((term) => (
                  <tr key={term.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{term.termName}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-100">
                        {term.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 line-clamp-1 max-w-xs">
                      {term.description}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleOpenModal(term)}
                        className="text-blue-700 text-sm font-bold hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(term.id)}
                        className="text-red-600 text-sm font-bold hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-start p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl my-8">
            <h3 className="text-2xl font-bold mb-6">
              {editingTerm ? "Edit Istilah" : "Tambah Istilah Baru"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Istilah</label>
                <input
                  type="text"
                  required
                  value={formData.termName}
                  onChange={(e) => setFormData({ ...formData, termName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail (Gambar)</label>
                <FilePond
                  files={thumbnailFile ? [thumbnailFile] : []}
                  onupdatefiles={(fileItems) => {
                    setThumbnailFile(fileItems[0]?.file || null);
                  }}
                  allowMultiple={false}
                  maxFiles={1}
                  labelIdle='Seret & letakkan gambar atau <span class="filepond--label-action">Telusuri</span>'
                  acceptedFileTypes={["image/*"]}
                  imagePreviewHeight={170}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video (Bahasa Isyarat)</label>
                <FilePond
                  files={videoFile ? [videoFile] : []}
                  onupdatefiles={(fileItems) => {
                    setVideoFile(fileItems[0]?.file || null);
                  }}
                  allowMultiple={false}
                  maxFiles={1}
                  labelIdle='Seret & letakkan video atau <span class="filepond--label-action">Telusuri</span>'
                  acceptedFileTypes={["video/*"]}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-bold hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-bold text-white transition-colors flex items-center justify-center gap-2 ${
                    isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;
