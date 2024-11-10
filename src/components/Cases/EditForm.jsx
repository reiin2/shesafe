import React, { useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import { useSelector, useDispatch } from "react-redux";
import "react-quill/dist/quill.snow.css";
import { fetchCategories } from "../../features/categoriesSlice";
import { fetchJournal, fetchCaseDetails, postCase, postCaseDraft } from "../../features/casesSlice";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";

function EditForm() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const journal = useSelector((state) => state.cases?.journal || []);
  const categories = useSelector((state) => state.categories?.category || []);
  const selectedCase = useSelector((state) => state.cases?.selectedCase || null);

  const [selectedJournal, setSelectedJournal] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const quillRef = useRef(null);
  const FontAttributor = Quill.import("attributors/class/font");
  FontAttributor.whitelist = ["Nunito Sans"];
  Quill.register(FontAttributor, true);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3] }],
      ["bold", "italic", "underline", "strike"],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ],
  };

  // Fetch data once when component mounts or when caseId changes
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchJournal());

    // Pastikan caseId ada sebelum memanggil fetchCaseDetails
    if (caseId) {
      dispatch(fetchCaseDetails(caseId));
    }
  }, [dispatch, caseId]);

  // Update state when selectedCase changes
  useEffect(() => {
    if (selectedCase) {
      // Mengupdate state dengan data yang diterima
      setTitle(selectedCase.title || "");
      setMessage(selectedCase.message || "");
      setSelectedCategory(selectedCase.category || "");
      setSelectedJournal(selectedCase.journal || "");  // Menambahkan jurnal yang terkait

      if (quillRef.current) {
        quillRef.current.getEditor().setText(selectedCase.description || "");
      }
    }
  }, [selectedCase]);

  const handleSubmit = async (isDraft = false) => {
    const dataCase = {
      title,
      description: quillRef.current.getEditor().getText(),
      category: selectedCategory,
      journal: selectedJournal,
      message,
      isApproved: isDraft ? "Draft" : "Submitted",
    };

    try {
      if (isDraft) {
        await dispatch(postCaseDraft(dataCase));
      } else {
        await dispatch(postCase(dataCase));
      }

      Swal.fire({
        icon: "success",
        title: isDraft ? "Draft Berhasil Disimpan!" : "Kasus Telah Diajukan!",
        text: isDraft
          ? "Draft kasus Anda berhasil disimpan, Anda bisa melanjutkan pengajuan nanti."
          : "Kasus Anda telah diajukan untuk ditinjau.",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/journal/mycases");
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: error.message || "Terdapat masalah dalam menyimpan atau mengajukan kasus. Silakan coba lagi.",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="mt-10 flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <label htmlFor="journal" className="font-bold">
          Pilih Jurnal Terkait
        </label>
        <select
          value={selectedJournal || ""}
          onChange={(e) => setSelectedJournal(e.target.value)}
          className="bg-[#f5f5f5] px-5 py-3 pr-12 rounded-[10px] appearance-none focus:outline-none"
          id="journal">
          <option value="">Pilih Jurnal</option>
          {journal.length > 0 ? (
            journal.map((item) => (
              <option key={item._id} value={item._id}>
                {item.title}
              </option>
            ))
          ) : (
            <option value="" disabled>Tidak ada jurnal tersedia</option>
          )}
        </select>
      </div>

      <div className="flex flex-col gap-4">
        <label htmlFor="category" className="font-bold">
          Pilih Kategori Kasus Kejadian
        </label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#f5f5f5] px-5 py-3 pr-12 rounded-[10px] appearance-none focus:outline-none">
          <option value="">Pilih Kategori</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Input untuk Judul */}
      <div className="flex flex-col gap-4">
        <label htmlFor="title" className="font-bold">Judul Kasus</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-5 py-3 rounded-[10px] bg-[#f5f5f5] text-black placeholder:text-gray-400 focus:outline-none"
          placeholder="Masukkan judul kasus"
        />
      </div>

      {/* Quill Editor untuk Ringkasan */}
      <div className="flex flex-col gap-4">
        <label htmlFor="description" className="font-bold">Ringkasan Kasus</label>
        <ReactQuill ref={quillRef} className="bg-[#f5f5f5] rounded-[10px] border-0" theme="snow" modules={modules} />
      </div>

      <div className="flex flex-col gap-4">
        <label htmlFor="message" className="font-bold">Pesan Tambahan (opsional)</label>
        <input
          type="text"
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="px-5 py-3 rounded-[10px] bg-[#f5f5f5] text-black placeholder:text-gray-400 focus:outline-none"
          placeholder="Masukkan pesan tambahan"
        />
      </div>

      <div className="flex flex-row justify-between gap-4">
        <button onClick={() => handleSubmit(true)} className="border-2 border-[#04395E] px-5 py-3 rounded-[10px] text-[#04395E]">
          Simpan Draft
        </button>
        <button onClick={() => handleSubmit()} className="bg-[#ba324f] text-white px-5 py-3 rounded-[10px]">
          Ajukan Kasus
        </button>
      </div>
    </div>
  );
}

export default EditForm;

