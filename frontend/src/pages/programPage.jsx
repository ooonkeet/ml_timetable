import { useState, useEffect } from 'react';
import Table from '@/layouts/Table';
import FormModal from '@/layouts/FormModal';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProgram, setEditProgram] = useState(null);

  // fetch all programs
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

  // fetch all universities
  const fetchUniversities = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/university/getUni`
      );
      // map universities to {value, label}
      const uniOptions = res.data.map((u) => ({
        value: u._id,
        label: u.name,
      }));
      setUniversities(uniOptions);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchUniversities();
  }, []);

  const handleEdit = (program) => {
    setEditProgram(program);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/v1/programs/${id}`
      );
      await fetchPrograms();
      toast.success('Program deleted successfully!');
    } catch (error) {
      console.error('Failed to delete program:', error);
      toast.error('Failed to delete program.');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editProgram) {
        // update program
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}/api/v1/programs/${editProgram._id}`,
          formData
        );
        toast.success('Edited successfully!');
      } else {
        // create program
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/v1/programs/createProgram`,
          formData
        );
        toast.success('Program created successfully!');
      }
      fetchPrograms();
    } catch (error) {
      console.error('Failed to save program:', error);
      toast.error(error.response?.data?.message || 'Failed to save program');
    }
  };

  // Filter programs based on selected university
  const filteredPrograms = programs.filter(prog => {
    if (selectedUniversity) {
      const uniId = prog.university?._id || prog.university;
      return uniId === selectedUniversity;
    }
    return true;
  });

  return (
    <div className="flex">
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-700">Programs</h1>
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 text-white font-medium shadow hover:from-blue-600 hover:to-blue-700 transition"
            onClick={() => {
              setEditProgram(null);
              setShowModal(true);
            }}
          >
            Add Program
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 mb-6 flex flex-wrap gap-6 items-center">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">University</label>
            <select
              value={selectedUniversity}
              onChange={e => setSelectedUniversity(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-blue-500 min-w-[200px]"
            >
              <option value="">-- Select University --</option>
              {universities.map(uni => (
                <option key={uni.value} value={uni.value}>
                  {uni.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!selectedUniversity ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-500">
            <p className="text-base font-semibold">
              Please select a University from the filter above to view and manage programs.
            </p>
          </div>
        ) : (
          <Table
            columns={['Name', 'University']}
            data={filteredPrograms}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {showModal && (
          <FormModal
            open={showModal}
            onClose={() => {setShowModal(false);}}
            title={editProgram ? 'Edit Program' : 'Add Program'}
            fields={[
              { name: 'name', label: 'Program Name', type: 'text' },
              {
                name: 'university',
                label: 'University',
                type: 'select',
                options: universities,
              },
            ]}
            defaultValues={
              editProgram
                ? {
                    ...editProgram,
                    university: editProgram.university?._id || editProgram.university
                  }
                : {
                    university: selectedUniversity || '',
                  }
            }
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
