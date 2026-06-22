import { useState, useEffect } from 'react';
import Table from '@/layouts/Table';
import FormModal from '@/layouts/FormModal';
import axios from 'axios';
import toast from 'react-hot-toast';
const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [streams, setStreams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [parsedSubjects, setParsedSubjects] = useState([]);
  const [selectedUploadStream, setSelectedUploadStream] = useState('');
  const [parsing, setParsing] = useState(false);

  // fetch all subjects
  const fetchSubjects = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/subjects/getSubjects`
      );
      console.log(res.data);
      setSubjects(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // fetch all streams for the dropdown
  const fetchStreams = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/streams/getstreams`
      );

      setStreams(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchStreams();
  }, []);

  const handleEdit = (subject) => {
    setEditSubject(subject);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/v1/subjects/subject/${id}`
      );
      await fetchSubjects();
      toast.success('Subject deleted successfully!');
    } catch (error) {
      console.error('Failed to delete subject:', error);
      toast.error('Failed to delete subject.');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      // Validate required fields
      if (
        !formData.code ||
        !formData.name ||
        !formData.stream ||
        !formData.type ||
        !formData.credits
      ) {
        alert('Please fill in all required fields');
        return;
      }

      // Calculate totalClassesPerWeek based on type and credits
      const totalClassesPerWeek =
        formData.type === 'theory'
          ? parseInt(formData.credits)
          : parseInt(formData.credits) * 2;

      const submitData = {
        code: String(formData.code).trim(),
        name: formData.name.trim(),
        stream: formData.stream,
        type: formData.type.toLowerCase(),
        credits: Number(formData.credits),
        totalClassesPerWeek,
      };

      if (editSubject) {
        // update subject
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}/api/v1/subjects/subject/${
            editSubject._id
          }`,
          submitData
        );
        toast.success('Edited successfully!');
      } else {
        // create subject
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/v1/subjects/createSubject`,
          submitData
        );
      }
      await fetchSubjects();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save subject:', error);
      alert(error.response?.data?.message || 'Failed to save subject');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large (max 5MB)");
      return;
    }

    setParsing(true);
    const loadingToast = toast.loading("Uploading and parsing syllabus document...");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Content = reader.result;
        const mimeType = file.type;

        try {
          const res = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/api/v1/subjects/parseSyllabus`,
            { fileData: base64Content, mimeType }
          );

          if (res.data?.subjects && Array.isArray(res.data.subjects)) {
            setParsedSubjects(res.data.subjects);
            setShowPreviewModal(true);
            toast.success("Syllabus parsed successfully!", { id: loadingToast });
          } else {
            throw new Error("No subjects found in document");
          }
        } catch (err) {
          console.error(err);
          const errorMsg = err.response?.data?.message || err.message || "Failed to parse syllabus";
          toast.error(errorMsg, { id: loadingToast });
          if (err.response?.data?.setupInstruction) {
            alert(err.response.data.setupInstruction);
          }
        } finally {
          setParsing(false);
          e.target.value = null;
        }
      };
    } catch (err) {
      console.error(err);
      toast.error("Failed to read file", { id: loadingToast });
      setParsing(false);
    }
  };

  const handleBulkSave = async () => {
    if (!selectedUploadStream) {
      toast.error("Please select a stream for the subjects");
      return;
    }

    for (const s of parsedSubjects) {
      if (!s.code || !s.code.trim()) {
        toast.error("All subjects must have a subject code");
        return;
      }
      if (s.code.trim().length > 15) {
        toast.error(`Subject code "${s.code}" exceeds 15 characters limit`);
        return;
      }
      if (!s.name || !s.name.trim()) {
        toast.error("All subjects must have a name");
        return;
      }
    }

    const saveToast = toast.loading("Saving subjects to database...");
    try {
      const subjectsToSave = parsedSubjects.map(s => ({
        code: s.code.trim(),
        name: s.name.trim(),
        type: s.type.toLowerCase(),
        credits: Number(s.credits) || 0,
        totalClassesPerWeek: Number(s.totalClassesPerWeek) || 0,
        stream: selectedUploadStream
      }));

      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/subjects/createSubjectsBulk`,
        { subjects: subjectsToSave }
      );

      toast.success(`Successfully added ${subjectsToSave.length} subjects!`, { id: saveToast });
      setShowPreviewModal(false);
      setParsedSubjects([]);
      setSelectedUploadStream('');
      fetchSubjects();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to save subjects", { id: saveToast });
    }
  };

  return (
    <div className="flex">
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-600">Subjects</h1>
          <div className="flex items-center gap-3">
            <label className="px-4 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-sm shadow-sm cursor-pointer hover:bg-indigo-100 transition flex items-center gap-1.5">
              📁 {parsing ? "Parsing..." : "Upload Syllabus"}
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={handleFileUpload}
                disabled={parsing}
                className="hidden"
              />
            </label>
            <button
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 text-white font-medium shadow hover:from-blue-600 hover:to-blue-700 transition"
              onClick={() => {
                setEditSubject(null);
                setShowModal(true);
              }}
            >
              Add Subject
            </button>
          </div>
        </div>
        <Table
          columns={[
            'Code',
            'Name',
            'Stream',
            'Type',
            'Credits',
            'Classes/Week',
          ]}
          data={subjects.map((subject) => ({
            _id: subject._id,
            code: subject.code || 'N/A',
            name: subject.name || 'N/A',
            stream: subject.stream?.name || 'N/A',
            type: subject.type
              ? subject.type.charAt(0).toUpperCase() + subject.type.slice(1)
              : 'N/A',
            credits: subject.credits || '0',
            'classes per week': subject.totalClassesPerWeek || '0',
          }))}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {showModal && (
          <FormModal
            open={showModal}
            onClose={() => setShowModal(false)}
            title={editSubject ? 'Edit Subject' : 'Add Subject'}
            fields={[
              {
                name: 'code',
                label: 'Subject Code',
                type: 'text',
                props: {
                  maxLength: 15,
                },
              },
              {
                name: 'name',
                label: 'Subject Name',
                type: 'text',
              },
              {
                name: 'stream',
                label: 'Stream',
                type: 'select',
                options: streams.map((stream) => ({
                  value: stream._id,
                  label: stream.name,
                })),
              },
              {
                name: 'type',
                label: 'Subject Type',
                type: 'select',
                options: [
                  { value: 'theory', label: 'Theory' },
                  { value: 'lab', label: 'Lab' },
                ],
              },
              {
                name: 'credits',
                label: 'Credits',
                type: 'number',
                props: {
                  min: 0,
                  max: 5,
                },
              },
              {
                name: 'totalClassesPerWeek',
                label: 'Classes per Week',
                type: 'number',
                props: {
                  min: 0,
                  max: 10,
                  readOnly: true,
                },
              },
            ]}
            defaultValues={{
              ...editSubject,
              totalClassesPerWeek: editSubject
                ? editSubject.totalClassesPerWeek
                : 0,
            }}
            onSubmit={handleSubmit}
          />
        )}

        {showPreviewModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-100">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Verify Extracted Subjects</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Gemini has extracted {parsedSubjects.length} subjects from your syllabus. Please review them below.</p>
                </div>
                <button 
                  onClick={() => { setShowPreviewModal(false); setParsedSubjects([]); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-900">Select Stream for these subjects</h4>
                    <p className="text-xs text-indigo-700 mt-0.5">All extracted subjects will be added under the selected stream.</p>
                  </div>
                  <select
                    value={selectedUploadStream}
                    onChange={e => setSelectedUploadStream(e.target.value)}
                    className="px-4 py-2.5 bg-white border-2 border-indigo-200 rounded-lg text-sm text-slate-800 font-semibold focus:border-indigo-500 outline-none min-w-[200px]"
                  >
                    <option value="">-- Select Stream --</option>
                    {streams.map(str => (
                      <option key={str._id} value={str._id}>{str.name} ({str.program?.name || 'N/A'})</option>
                    ))}
                  </select>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="p-3 w-28">Subject Code</th>
                        <th className="p-3">Subject Name</th>
                        <th className="p-3 w-28">Type</th>
                        <th className="p-3 w-20">Credits</th>
                        <th className="p-3 w-20">Classes/Week</th>
                        <th className="p-3 w-16 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedSubjects.map((subj, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="p-2">
                            <input
                              type="text"
                              value={subj.code}
                              maxLength={15}
                              onChange={e => {
                                const val = e.target.value;
                                setParsedSubjects(prev => prev.map((s, i) => i === idx ? { ...s, code: val } : s));
                              }}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-slate-800 font-mono font-bold focus:border-indigo-400 outline-none uppercase"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={subj.name}
                              onChange={e => {
                                const val = e.target.value;
                                setParsedSubjects(prev => prev.map((s, i) => i === idx ? { ...s, name: val } : s));
                              }}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-slate-800 font-semibold focus:border-indigo-400 outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={subj.type}
                              onChange={e => {
                                const val = e.target.value;
                                setParsedSubjects(prev => prev.map((s, i) => i === idx ? { ...s, type: val } : s));
                              }}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-slate-700 font-medium focus:border-indigo-400 outline-none"
                            >
                              <option value="theory">Theory</option>
                              <option value="lab">Lab</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.5"
                              value={subj.credits}
                              onChange={e => {
                                const val = Number(e.target.value);
                                setParsedSubjects(prev => prev.map((s, i) => i === idx ? { ...s, credits: val } : s));
                              }}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-slate-800 text-center focus:border-indigo-400 outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={subj.totalClassesPerWeek}
                              onChange={e => {
                                const val = parseInt(e.target.value) || 0;
                                setParsedSubjects(prev => prev.map((s, i) => i === idx ? { ...s, totalClassesPerWeek: val } : s));
                              }}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-slate-800 text-center focus:border-indigo-400 outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => setParsedSubjects(prev => prev.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-red-500 font-bold transition p-1 text-sm"
                              title="Delete Row"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                <button
                  onClick={() => { setShowPreviewModal(false); setParsedSubjects([]); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkSave}
                  disabled={!selectedUploadStream || parsedSubjects.length === 0}
                  className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                  Save All to DB ({parsedSubjects.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subjects;
