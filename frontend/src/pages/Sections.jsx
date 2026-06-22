import { useState, useEffect } from 'react';
import Table from '@/layouts/Table';
import FormModal from '@/layouts/FormModal';
import axios from 'axios';
import toast from 'react-hot-toast';
const Sections = () => {
  const [sections, setSections] = useState([]);
  const [streams, setStreams] = useState([]);
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

  useEffect(() => {
    fetchSections();
    fetchStreams();
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

  return (
    <div className="flex">
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-600">Sections</h1>
          <button
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 text-white font-medium shadow hover:from-blue-600 hover:to-blue-700 transition"
          onClick={() => {setEditSection(null);setShowModal(true)}}> Add Section </button>
        </div>
        <Table
          columns={['Name', 'Stream', 'Year', 'Semester', 'Total Students']}
          data={sections.map(section => ({
            ...section,
            stream: section.stream?.name || 'N/A'
          }))}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />

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
            defaultValues={editSection || {}}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default Sections;