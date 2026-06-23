import { useState, useEffect } from 'react';
import Table from '@/layouts/Table';
import FormModal from '@/layouts/FormModal';
import axios from 'axios';
import toast from 'react-hot-toast';
const Sections = () => {
  const [sections, setSections] = useState([]);
  const [streams, setStreams] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedYearSem, setSelectedYearSem] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editSection, setEditSection] = useState(null);

  // fetch all sections
  const fetchSections = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/sections/getSection`
      );
      setSections(res.data);
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

  // fetch all universities for the dropdown filter
  const fetchUniversities = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/university/getUni`
      );
      setUniversities(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSections();
    fetchStreams();
    fetchUniversities();
  }, []);

  const handleEdit = (section) => {
    setEditSection(section);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/v1/sections/${id}`
      );
      fetchSections();
    } catch (error) {
      console.error('Failed to delete section:', error);
    }
  };

  const handleDuplicate = async (row) => {
    const originalSection = sections.find(s => s._id === row._id);
    if (!originalSection) return;

    try {
      const duplicateData = {
        name: `${originalSection.name} Copy`,
        stream: originalSection.stream?._id || originalSection.stream,
        year: Number(originalSection.year),
        semester: Number(originalSection.semester),
        totalStudents: Number(originalSection.totalStudents) || 0
      };

      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/sections/createSection`,
        duplicateData
      );
      toast.success('Section duplicated successfully!');
      fetchSections();
    } catch (error) {
      console.error('Failed to duplicate section:', error);
      toast.error(error.response?.data?.message || 'Failed to duplicate section');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editSection) {
        // update section
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}/api/v1/sections/${editSection._id}`,
          formData
        );
        toast.success('Edited successfully!');
      } else {
        // create section
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/v1/sections/createSection`,
          formData
        );
      }
      fetchSections();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save section:', error);
      throw error;
    }
  };

  // Filter sections based on selected university, stream, year and semester
  const filteredSections = sections.filter(section => {
    // Look up the stream details in the streams array to get fully populated university/program
    const sectionStreamId = section.stream?._id || section.stream;
    const streamDetails = streams.find(s => s._id === sectionStreamId);

    // University filter
    if (selectedUniversity) {
      const uniId = streamDetails?.program?.university?._id || streamDetails?.program?.university;
      if (uniId !== selectedUniversity) return false;
    }

    // Stream filter
    if (selectedStream) {
      if (sectionStreamId !== selectedStream) return false;
    }

    // Year & Semester filter
    if (selectedYearSem) {
      const [year, sem] = selectedYearSem.split('-').map(Number);
      if (section.year !== year || section.semester !== sem) return false;
    }

    return true;
  });

  return (
    <div className="flex">
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-600">Sections</h1>
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 text-white font-medium shadow hover:from-blue-600 hover:to-blue-700 transition"
            onClick={() => {
              setEditSection(null);
              setShowModal(true);
            }}
          >
            Add Section
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 mb-6 flex flex-wrap gap-6 items-center">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">University</label>
            <select
              value={selectedUniversity}
              onChange={e => {
                setSelectedUniversity(e.target.value);
                setSelectedStream('');
                setSelectedYearSem('');
              }}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-blue-500 min-w-[200px]"
            >
              <option value="">-- Select University --</option>
              {universities.map(uni => (
                <option key={uni._id} value={uni._id}>
                  {uni.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stream</label>
            <select
              value={selectedStream}
              onChange={e => {
                setSelectedStream(e.target.value);
                setSelectedYearSem('');
              }}
              disabled={!selectedUniversity}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-blue-500 min-w-[200px] disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">-- Select Stream --</option>
              {streams
                .filter(s => {
                  const uniId = s.program?.university?._id || s.program?.university;
                  return uniId === selectedUniversity;
                })
                .map(str => (
                  <option key={str._id} value={str._id}>
                    {str.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Year & Semester</label>
            <select
              value={selectedYearSem}
              onChange={e => setSelectedYearSem(e.target.value)}
              disabled={!selectedStream}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-blue-500 min-w-[200px] disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">-- Select Year & Semester --</option>
              <option value="1-1">Year 1 - Semester 1</option>
              <option value="1-2">Year 1 - Semester 2</option>
              <option value="2-3">Year 2 - Semester 3</option>
              <option value="2-4">Year 2 - Semester 4</option>
              <option value="3-5">Year 3 - Semester 5</option>
              <option value="3-6">Year 3 - Semester 6</option>
              <option value="4-7">Year 4 - Semester 7</option>
              <option value="4-8">Year 4 - Semester 8</option>
            </select>
          </div>
        </div>

        {!selectedUniversity || !selectedStream || !selectedYearSem ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-500">
            <p className="text-base font-semibold">
              Please select University, Stream, and Year & Semester from the filters above to view and manage sections.
            </p>
          </div>
        ) : (
          <Table
            columns={['Name', 'Stream', 'Year', 'Semester', 'Total Students']}
            data={filteredSections.map(section => ({
              ...section,
              stream: section.stream?.name || 'N/A'
            }))}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />
        )}

        {showModal && (
          <FormModal
            open={showModal}
            onClose={() => setShowModal(false)}
            title={editSection ? 'Edit Section' : 'Add Section'}
            fields={[
              { name: 'name', label: 'Section Name', type: 'text' },
              {
                name: 'stream',
                label: 'Stream',
                type: 'select',
                options: streams.map(stream => ({
                  value: stream._id,
                  label: stream.name
                }))
              },
              {
                name: 'year',
                label: 'Year',
                type: 'number',
                props: {
                  min: 1,
                  max: 4
                }
              },
              {
                name: 'semester',
                label: 'Semester',
                type: 'number',
                props: {
                  min: 1,
                  max: 8
                }
              },
              {
                name: 'totalStudents',
                label: 'Total Students',
                type: 'number',
                props: {
                  min: 0
                }
              }
            ]}
            defaultValues={
              editSection
                ? {
                    ...editSection,
                    stream: editSection.stream?._id || editSection.stream
                  }
                : {
                    stream: selectedStream || '',
                    year: selectedYearSem ? Number(selectedYearSem.split('-')[0]) : '',
                    semester: selectedYearSem ? Number(selectedYearSem.split('-')[1]) : '',
                    totalStudents: 0
                  }
            }
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default Sections;