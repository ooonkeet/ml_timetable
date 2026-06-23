import { useState, useEffect } from 'react';
import Table from '@/layouts/Table';
import FormModal from '@/layouts/FormModal';
import axios from 'axios';
import toast from 'react-hot-toast';
const Streams = () => {
  const [streams, setStreams] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editStream, setEditStream] = useState(null);
  const [modalSelectedUniversity, setModalSelectedUniversity] = useState('');

  // fetch all streams
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

  // fetch all programs for the dropdown
  const fetchPrograms = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/programs/getProgram`
      );
      setPrograms(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // fetch all universities for the dropdown
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
    fetchStreams();
    fetchPrograms();
    fetchUniversities();
  }, []);

  const handleEdit = (stream) => {
    setEditStream(stream);
    const streamProgramId = stream.program?._id || stream.program;
    const programDetails = programs.find(p => p._id === streamProgramId);
    const uniId = programDetails?.university?._id || programDetails?.university;
    setModalSelectedUniversity(uniId || '');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/v1/streams/${id}`
      );
      fetchStreams();
      toast.success('Stream deleted successfully!');
    } catch (error) {
      console.error('Failed to delete stream:', error);
      toast.error('Failed to delete stream.');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const { university, ...submitData } = formData;

      if (editStream) {
        // update stream
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}/api/v1/streams/${editStream._id}`,
          submitData
        );
        toast.success('Edited successfully!');
      } else {
        // create stream
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/v1/streams/createStream`,
          submitData
        );
        toast.success('Stream created successfully!');
      }
      fetchStreams();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save stream:', error);
      toast.error(error.response?.data?.message || 'Failed to save stream');
    }
  };

  // Filter streams based on selected university and program
  const filteredStreams = streams.filter(stream => {
    const streamProgramId = stream.program?._id || stream.program;
    const programDetails = programs.find(p => p._id === streamProgramId);

    // University filter
    if (selectedUniversity) {
      const uniId = programDetails?.university?._id || programDetails?.university;
      if (uniId !== selectedUniversity) return false;
    }

    // Program filter
    if (selectedProgram) {
      if (streamProgramId !== selectedProgram) return false;
    }

    return true;
  });

  return (
    <div className="flex">
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-600">Streams</h1>
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 text-white font-medium shadow hover:from-blue-600 hover:to-blue-700 transition"
            onClick={() => {
              setEditStream(null);
              setModalSelectedUniversity(selectedUniversity || '');
              setShowModal(true);
            }}
          >
            Add Stream
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
                setSelectedProgram('');
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
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Program</label>
            <select
              value={selectedProgram}
              onChange={e => setSelectedProgram(e.target.value)}
              disabled={!selectedUniversity}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-blue-500 min-w-[200px] disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="">-- Select Program --</option>
              {programs
                .filter(p => {
                  const uniId = p.university?._id || p.university;
                  return uniId === selectedUniversity;
                })
                .map(prog => (
                  <option key={prog._id} value={prog._id}>
                    {prog.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {!selectedUniversity || !selectedProgram ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-500">
            <p className="text-base font-semibold">
              Please select University and Program from the filters above to view and manage streams.
            </p>
          </div>
        ) : (
          <Table
            columns={['Name', 'Program', 'Student Intake', 'Number of Sections']}
            data={filteredStreams.map((stream) => ({
              ...stream,
              program: stream.program?.name || 'N/A',
            }))}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {showModal && (
          <FormModal
            open={showModal}
            onClose={() => setShowModal(false)}
            title={editStream ? 'Edit Stream' : 'Add Stream'}
            fields={[
              { name: 'name', label: 'Stream Name', type: 'text' },
              {
                name: 'university',
                label: 'University',
                type: 'select',
                options: universities.map((uni) => ({
                  value: uni._id,
                  label: uni.name,
                })),
                onChange: (value, setValue) => {
                  setModalSelectedUniversity(value);
                  setValue('program', '');
                }
              },
              {
                name: 'program',
                label: 'Program',
                type: 'select',
                options: programs
                  .filter((p) => {
                    const uniId = p.university?._id || p.university;
                    return uniId === modalSelectedUniversity;
                  })
                  .map((program) => ({
                    value: program._id,
                    label: program.name,
                  })),
              },
              {
                name: 'studentIntake',
                label: 'Student Intake',
                type: 'number',
              },
              {
                name: 'numberOfSections',
                label: 'Number of Sections',
                type: 'number',
              },
            ]}
            defaultValues={
              editStream
                ? {
                    ...editStream,
                    university: editStream.program?.university?._id || editStream.program?.university,
                    program: editStream.program?._id || editStream.program
                  }
                : {
                    university: selectedUniversity || '',
                    program: selectedProgram || '',
                  }
            }
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default Streams;
