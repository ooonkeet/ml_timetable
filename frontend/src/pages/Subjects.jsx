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
        code: parseInt(formData.code),
        name: formData.name.trim(),
        stream: formData.stream,
        type: formData.type.toLowerCase(),
        credits: parseInt(formData.credits),
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

  return (
    <div className="flex">
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-600">Subjects</h1>
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 text-white font-medium shadow hover:from-blue-600 hover:to-blue-700 transition"
            onClick={() => {
              setEditSubject(null);
              setShowModal(true);
            }}
          >
            {' '}
            Add Subject{' '}
          </button>
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
                type: 'number',
                props: {
                  min: 0,
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
      </div>
    </div>
  );
};

export default Subjects;
