import TimetableView from '../components/ui/TimetableView'
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
const TimetablePage=()=>{
const [schedule, setSchedule] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedSchedule = localStorage.getItem('timetableData');
    if (savedSchedule) {
      try {
        setSchedule(JSON.parse(savedSchedule));
      } catch (e) {
        console.error("Failed to parse saved timetable data from localStorage", e);
        localStorage.removeItem('timetableData');
        navigate('/input');
      }
    } else {
      // If there's no schedule, redirect to the form page.
      navigate('/input');
    }
  }, [navigate]);

  const handleClear = () => {
    localStorage.removeItem('timetableData');
    navigate('/input');
  };

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg max-w-7xl mx-auto my-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Generated Timetable</h1>
        <Button onClick={handleClear}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back & Edit
        </Button>
      </div>
      <TimetableView schedule={schedule} />
    </div>
  );
}
export default TimetablePage