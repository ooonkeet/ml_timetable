import { useState, useEffect } from 'react';
import Table from '@/layouts/Table';
import FormModal from '@/layouts/FormModal';
import axios from 'axios';
import toast from 'react-hot-toast';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ClassSettings = () => {
  const [classSettings, setClassSettings] = useState([]);
  const [streams, setStreams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editClassSetting, setEditClassSetting] = useState(null);

  // fetch all class settings
  const fetchClassSettings = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/v1/classSettings/getClassInfo`
      );
      console.log('Fetched class settings:', res.data);
      if (Array.isArray(res.data)) {
        setClassSettings(res.data);
      } else {
        console.error(
          'Expected array of class settings but got:',
          typeof res.data
        );
        setClassSettings([]);
      }
    } catch (error) {
      console.error('Error fetching class settings:', error);
      setClassSettings([]);
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
    fetchClassSettings();
    fetchStreams();
  }, []);

  const handleEdit = (classSetting) => {
    setEditClassSetting(classSetting);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/v1/classSettings/${id}`
      );
      await fetchClassSettings();
      toast.success('Class setting deleted successfully!');
    } catch (error) {
      console.error('Failed to delete class setting:', error);
      toast.error('Failed to delete class setting.');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      // Validate required fields
      if (!formData.stream) {
        alert('Please select a stream');
        return;
      }

      if (
        !formData.classDuration ||
        formData.classDuration < 30 ||
        formData.classDuration > 120
      ) {
        alert('Class duration must be between 30 and 120 minutes');
        return;
      }

      // Convert classDays from object to array of selected days
      const classDays = Object.entries(formData.classDays || {})
        .filter(([_, isSelected]) => isSelected)
        .map(([day]) => day);

      if (classDays.length === 0) {
        alert('Please select at least one class day');
        return;
      }

      // Validate break times if either is provided
      if (
        (formData.breakStart && !formData.breakEnd) ||
        (!formData.breakStart && formData.breakEnd)
      ) {
        alert('Both break start and end times must be provided');
        return;
      }

      const submitData = {
        stream: formData.stream,
        classDuration: parseInt(formData.classDuration),
        classDays,
        break: {
          start: formData.breakStart || '',
          end: formData.breakEnd || '',
        },
      };

      if (editClassSetting) {
        // update class setting
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}/api/v1/classSettings/${
            editClassSetting._id
          }`,
          submitData
        );
        toast.success('Class setting updated successfully!');
      } else {
        // create class setting
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/v1/classSettings/createClass`,
          submitData
        );
        toast.success('Class setting created successfully!');
      }
      await fetchClassSettings();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save class setting:', error);
      alert(error.response?.data?.message || 'Failed to save class setting');
    }
  };
  return (
    <div className="flex">
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-700">Class Settings</h1>
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 text-white font-medium shadow hover:from-blue-600 hover:to-blue-700 transition"
            onClick={() => {
              setEditClassSetting(null);
              setShowModal(true);
            }}
          >
            {' '}
            Add Class Settings{' '}
          </button>
        </div>
        <Table
          columns={['Stream', 'Class Duration', 'Break Time', 'Class Days']}
          data={classSettings.map((setting) => ({
            _id: setting._id,
            stream: setting.stream?.name || 'N/A',
            'class duration': setting.classDuration
              ? `${setting.classDuration} minutes`
              : 'N/A',
            'break time':
              setting.break?.start && setting.break?.end
                ? `${setting.break.start} - ${setting.break.end}`
                : 'Not set',
            'class days':
              Array.isArray(setting.classDays) && setting.classDays.length > 0
                ? setting.classDays.join(', ')
                : 'None selected',
          }))}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {showModal && (
          <FormModal
            open={showModal}
            onClose={() => setShowModal(false)}
            title={
              editClassSetting ? 'Edit Class Setting' : 'Add Class Setting'
            }
            fields={[
              {
                name: 'stream',
                label: 'Stream',
                type: 'select',
                required: true,
                options: streams.map((stream) => ({
                  value: stream._id,
                  label: stream.name,
                })),
              },
              {
                name: 'classDuration',
                label: 'Class Duration (minutes)',
                type: 'number',
                required: true,
                props: {
                  min: 30,
                  max: 120,
                  step: 15,
                  placeholder: 'Enter duration between 30-120 minutes',
                },
              },
              {
                name: 'breakStart',
                label: 'Break Start Time',
                type: 'time',
                required: false,
                props: {
                  placeholder: 'HH:mm',
                  pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
                },
              },
              {
                name: 'breakEnd',
                label: 'Break End Time',
                type: 'time',
                required: false,
                props: {
                  placeholder: 'HH:mm',
                  pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
                },
              },
              {
                name: 'classDays',
                label: 'Class Days',
                type: 'checkboxGroup',
                required: true,
                options: WEEKDAYS.map((day) => ({
                  value: day,
                  label: day,
                })),
              },
            ]}
            defaultValues={
              editClassSetting
                ? {
                    stream: editClassSetting.stream?._id || '',
                    classDuration: editClassSetting.classDuration || 45,
                    breakStart: editClassSetting.break?.start || '',
                    breakEnd: editClassSetting.break?.end || '',
                    classDays: WEEKDAYS.reduce(
                      (acc, day) => ({
                        ...acc,
                        [day]:
                          editClassSetting.classDays?.includes(day) || false,
                      }),
                      {}
                    ),
                  }
                : {
                    stream: '',
                    classDuration: 45,
                    breakStart: '',
                    breakEnd: '',
                    classDays: WEEKDAYS.reduce(
                      (acc, day) => ({ ...acc, [day]: false }),
                      {}
                    ),
                  }
            }
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default ClassSettings;
