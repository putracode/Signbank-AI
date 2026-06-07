import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";

import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

import api, { API_URL } from "../services/api";

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType);

function AdminGlossaryPage() {
  const [terms, setTerms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [formData, setFormData] = useState({
    termName: "",
    categoryId: "",
    description: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTerms = terms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(terms.length / itemsPerPage);

  useEffect(() => {
    fetchTerms();
    fetchCategories();
  }, []);

  const fetchTerms = async () => {
    try {
      const { data } = await api.get("/glosarium");
      setTerms(data.data.glosariums);
      setCurrentPage(1); // Reset page on fetch
    } catch (err) {
      console.error("Gagal mengambil data istilah:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories");
      setCategories(data.data.categories);
    } catch (err) {
      console.error("Gagal mengambil data kategori:", err);
    }
  };

  const handleOpenModal = (term = null) => {
    if (term) {
      setEditingTerm(term);
      setFormData({
        termName: term.termName,
        categoryId: term.categoryId || "",
        description: term.description,
      });
    } else {
      setEditingTerm(null);
      setFormData({ termName: "", categoryId: "", description: "" });
    }
    setThumbnailFile(null);
    setVideoFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.categoryId) {
      toast.error("Silakan pilih kategori!");
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    data.append("termName", formData.termName);
    data.append("categoryId", formData.categoryId);
    data.append("description", formData.description);
    if (thumbnailFile) data.append("thumbnail", thumbnailFile);
    if (videoFile) data.append("video", videoFile);

    const url = editingTerm
      ? `${API_URL}/glosarium/${editingTerm.id}`
      : `${API_URL}/glosarium`;
    const method = editingTerm ? "PUT" : "POST";

    try {
      let token = localStorage.getItem("accessToken");
      
      let response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (response.status === 401) {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const refreshRes = await fetch(`${API_URL}/authentications`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          });
          
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newToken = refreshData.data.accessToken;
            localStorage.setItem("accessToken", newToken);
            
            response = await fetch(url, {
              method: method,
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
              body: data,
            });
          } else {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/admin/login";
            throw new Error("Sesi Anda telah berakhir, silakan login kembali.");
          }
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Gagal menyimpan data (Status: ${response.status})`);
      }

      toast.success(editingTerm ? "Istilah berhasil diperbarui!" : "Istilah berhasil ditambahkan!");
      setIsModalOpen(false);
      fetchTerms();
    } catch (err) {
      toast.error(`Error: ${err.message}`);
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
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kelola Glosarium</h2>
          <p className="text-gray-500">Tambah, ubah, atau hapus istilah keuangan</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-md text-center"
        >
          + Tambah Istilah
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">Memuat data...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
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
                {currentTerms.map((term) => (
                  <tr key={term.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{term.termName}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-100">
                        {term.categoryName || "Tanpa Kategori"}
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
                {terms.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center text-gray-400">
                      Belum ada istilah yang ditambahkan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${
                    currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Berikutnya
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Menampilkan <span className="font-medium">{indexOfFirstItem + 1}</span> hingga{" "}
                    <span className="font-medium">{Math.min(indexOfLastItem, terms.length)}</span> dari{" "}
                    <span className="font-medium">{terms.length}</span> istilah
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                        currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <span className="sr-only">Sebelumnya</span>
                      &lt;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        aria-current={currentPage === page ? "page" : undefined}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 ${
                          currentPage === page
                            ? "z-10 bg-blue-700 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                        currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <span className="sr-only">Berikutnya</span>
                      &gt;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
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

export default AdminGlossaryPage;
