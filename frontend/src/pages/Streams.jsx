import { useState, useEffect } from 'react';
import Table from '@/layouts/Table';
import FormModal from '@/layouts/FormModal';
import axios from 'axios';
import toast from 'react-hot-toast';
const Streams = () => {
  const [streams, setStreams] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editStream, setEditStream] = useState(null);

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

  useEffect(() => {
    fetchStreams();
    fetchPrograms();
  }, []);

  const handleEdit = (stream) => {
    setEditStream(stream);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/v1/streams/${id}`
      );
      fetchStreams();
    } catch (error) {
      console.error('Failed to delete stream:', error);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editStream) {
        // update stream
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}/api/v1/streams/${editStream._id}`,
          formData
        );
        toast.success('Edited successfully!');
      } else {
        // create stream
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/v1/streams/createStream`,
          formData
        );
      }
      fetchStreams();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save stream:', error);
      throw error;
    }
  };

  return (
    <div className="flex">
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-600">Streams</h1>
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 text-white font-medium shadow hover:from-blue-600 hover:to-blue-700 transition"
            onClick={() => {
              setEditStream(null);
              setShowModal(true);
            }}
          >
            {' '}
            Add Stream{' '}
          </button>
        </div>
        <Table
          columns={['Name', 'Program', 'Student Intake', 'Number of Sections']}
          data={streams.map((stream) => ({
            ...stream,
            program: stream.program?.name || 'N/A',
          }))}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {showModal && (
          <FormModal
            open={showModal}
            onClose={() => setShowModal(false)}
            title={editStream ? 'Edit Stream' : 'Add Stream'}
            fields={[
              { name: 'name', label: 'Stream Name', type: 'text' },
              {
                name: 'program',
                label: 'Program',
                type: 'select',
                options: programs.map((program) => ({
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
            defaultValues={editStream || {}}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default Streams;
