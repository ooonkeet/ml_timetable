import { useState, useEffect } from 'react';
import Table from '@/layouts/Table';
import FormModal from '@/layouts/FormModal';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [universities, setUniversities] = useState([]);
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
    }
    fetchPrograms();
  };

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
            {' '}
            Add Program{' '}
          </button>
        </div>
        <Table
          columns={['Name', 'University']}
          data={programs}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

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
            defaultValues={editProgram || {}}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
