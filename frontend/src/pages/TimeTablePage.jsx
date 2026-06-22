import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TimetableView from '../components/ui/TimetableView';

const BASE = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  Check: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  ),
  Spinner: () => (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  Chevron: () => (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
};

// ─── Step Indicator ────────────────────────────────────────────────────────────
const StepBar = ({ step }) => {
  const steps = [
    { num: 1, label: 'Institution' },
    { num: 2, label: 'Configure' },
    { num: 3, label: 'Faculty' },
    { num: 4, label: 'Generate' },
    { num: 5, label: 'View' },
  ];
  return (
    <div className="flex items-center mb-8">
      {steps.map((s, i) => (
        <React.Fragment key={s.num}>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${step > s.num ? 'bg-emerald-500 border-emerald-500 text-white' :
              step === s.num ? 'bg-white border-indigo-600 text-indigo-600 shadow-md shadow-indigo-100' :
                'bg-white border-slate-200 text-slate-400'
              }`}>
              {step > s.num ? <Icon.Check /> : s.num}
            </div>
            <span className={`text-xs font-medium whitespace-nowrap ${step >= s.num ? 'text-slate-700' : 'text-slate-400'}`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 mb-5 rounded transition-all duration-500 ${step > s.num ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ─── Select Field ──────────────────────────────────────────────────────────────
const SelectField = ({ label, value, onChange, options, disabled, placeholder }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
    >
      <option value="">{placeholder || `-- Select ${label} --`}</option>
      {options.map(opt => (
        <option key={opt._id} value={opt._id}>{opt.name}</option>
      ))}
    </select>
  </div>
);

// ─── Room Tag Input ────────────────────────────────────────────────────────────
const RoomTagInput = ({ label, rooms, onChange, color = 'indigo' }) => {
  const [input, setInput] = useState('');
  const addRoom = () => {
    const trimmed = input.trim();
    if (trimmed && !rooms.includes(trimmed)) {
      onChange([...rooms, trimmed]);
      setInput('');
    }
  };
  const removeRoom = (r) => onChange(rooms.filter(x => x !== r));
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRoom())}
          placeholder={`e.g. ${label.includes('Lab') ? 'Lab1' : 'Room101'}`}
          className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-indigo-400 outline-none"
        />
        <button onClick={addRoom} className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm flex items-center gap-1">
          <Icon.Plus /> Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {rooms.map(r => (
          <span key={r} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${colors[color]}`}>
            {r}
            <button onClick={() => removeRoom(r)} className="hover:opacity-70 transition">×</button>
          </span>
        ))}
        {rooms.length === 0 && <span className="text-xs text-slate-400 italic">No rooms added yet</span>}
      </div>
    </div>
  );
};

// ─── Faculty Assignment Card ───────────────────────────────────────────────────
const FacultyCard = ({ faculty, index, subjects, sectionNames,facultyList, onChange, onRemove }) => {
  const updateField = (field, val) => onChange(index, { ...faculty, [field]: val });

  const toggleAssignment = (subjectName, sectionName, type) => {
    const existing = faculty.assignments.find(
      a => a.subjectName === subjectName && a.sections.includes(sectionName)
    );
    let newAssignments = [...faculty.assignments];

    if (existing) {
      newAssignments = newAssignments.map(a => {
        if (a.subjectName === subjectName) {
          const newA = { ...a };
          if (type === 'theory') newA.teachesTheory = !a.teachesTheory;
          if (type === 'lab') newA.teachesLab = !a.teachesLab;
          // If both false and section is this one, remove section
          if (!newA.teachesTheory && !newA.teachesLab) {
            newA.sections = newA.sections.filter(s => s !== sectionName);
          }
          return newA;
        }
        return a;
      }).filter(a => a.sections.length > 0 || a.teachesTheory || a.teachesLab);
    } else {
      // Add new assignment
      const existingSubj = newAssignments.find(a => a.subjectName === subjectName);
      if (existingSubj) {
        newAssignments = newAssignments.map(a => {
          if (a.subjectName === subjectName) {
            return {
              ...a,
              sections: [...new Set([...a.sections, sectionName])],
              teachesTheory: type === 'theory' ? true : a.teachesTheory,
              teachesLab: type === 'lab' ? true : a.teachesLab,
            };
          }
          return a;
        });
      } else {
        newAssignments.push({
          subjectName,
          sections: [sectionName],
          teachesTheory: type === 'theory',
          teachesLab: type === 'lab',
        });
      }
    }
    updateField('assignments', newAssignments);
  };

  const isAssigned = (subjectName, sectionName, type) => {
    const a = faculty.assignments.find(
      a => a.subjectName === subjectName && a.sections.includes(sectionName)
    );
    if (!a) return false;
    return type === 'theory' ? a.teachesTheory : a.teachesLab;
  };

  const uniqueSubjects = [...new Set(faculty.assignments.map(a => a.subjectName))];
  const isTakenByAnotherFaculty = (
  subjectName,
  sectionName,
  type
  ) => {
    return facultyList.some((f, fIdx) => {
      if (fIdx === index) return false; // ignore current faculty

        return f.assignments.some(a =>
        a.subjectName === subjectName &&
        a.sections.includes(sectionName) &&
        (
          (type === 'theory' && a.teachesTheory) ||
          (type === 'lab' && a.teachesLab)
        )
      );
    });
  };

  return (
    <div className="border-2 border-slate-200 rounded-xl p-5 bg-white hover:border-indigo-200 transition group">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {faculty.abbr || '?'}
        </div>
        <div className="flex-1 grid grid-cols-2 gap-3">
          <input
            type="text"
            value={faculty.name}
            onChange={e => updateField('name', e.target.value)}
            placeholder="Faculty Full Name"
            className="px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-indigo-400 outline-none font-medium"
          />
          <input
            type="text"
            value={faculty.abbr}
            onChange={e => updateField('abbr', e.target.value.toUpperCase().slice(0, 5))}
            placeholder="Abbr (e.g. JD)"
            className="px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-indigo-400 outline-none font-mono uppercase"
          />
        </div>
        <button onClick={() => onRemove(index)} className="text-slate-300 hover:text-red-400 transition p-1 opacity-0 group-hover:opacity-100">
          <Icon.Trash />
        </button>
      </div>

      {/* Assignment Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left p-2 font-semibold text-slate-600 rounded-tl-lg">Subject</th>
              {sectionNames.map(sec => (
                <th key={sec} colSpan={2} className="text-center p-2 font-semibold text-slate-600">
                  Sec {sec}
                </th>
              ))}
            </tr>
            <tr className="bg-slate-50/50">
              <th className="p-2"></th>
              {sectionNames.map(sec => (
                <React.Fragment key={sec}>
                  <th className="p-1 text-center text-slate-400 font-normal">Theory</th>
                  <th className="p-1 text-center text-slate-400 font-normal">Lab</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {subjects.map(subj => (
              <tr key={subj.name} className="border-t border-slate-100 hover:bg-slate-50/50">
                <td className="p-2 font-medium text-slate-700">{subj.name}
                  <span className="ml-1 text-slate-400 font-mono">({subj.code})</span>
                </td>
                {sectionNames.map(sec => (
                  <React.Fragment key={sec}>
                    <td className="p-1 text-center">
                      {subj.type === 'theory' ? (
                        <button
                          disabled={
                            isTakenByAnotherFaculty(subj.name, sec, 'theory')
                          }
                          onClick={() => toggleAssignment(subj.name, sec, 'theory')}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center mx-auto transition ${isAssigned(subj.name, sec, 'theory')
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : isTakenByAnotherFaculty(subj.name, sec, 'theory')
                            ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-50'
                            : 'border-slate-300 hover:border-indigo-400'
                            }`}
                        >
                          {isAssigned(subj.name, sec, 'theory') && <Icon.Check />}
                        </button>
                      ) : <span className="text-slate-200">—</span>}
                    </td>
                    <td className="p-1 text-center">
                      {subj.type === 'lab' ? (
                        <button
                          onClick={() => toggleAssignment(subj.name, sec, 'lab')}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center mx-auto transition ${isAssigned(subj.name, sec, 'lab')
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : isTakenByAnotherFaculty(subj.name, sec, 'lab')
                            ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-50'
                            : 'border-slate-300 hover:border-purple-400'
                            }`}
                        >
                          {isAssigned(subj.name, sec, 'lab') && <Icon.Check />}
                        </button>
                      ) : <span className="text-slate-200">—</span>}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const TimeTablePage = () => {
  const [step, setStep] = useState(1);

  // Selection
  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [streams, setStreams] = useState([]);
  const [dbSections, setDbSections] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedStream, setSelectedStream] = useState(null);

  // Config
  const [sectionsCount, setSectionsCount] = useState(2);
  const [periodsPerDay, setPeriodsPerDay] = useState(8);
  const [breakPeriod, setBreakPeriod] = useState(4);
  const [workingDays, setWorkingDays] = useState(5);
  const [theoryRooms, setTheoryRooms] = useState(['Room101', 'Room102']);
  const [labRooms, setLabRooms] = useState(['Lab1']);
  const [subjects, setSubjects] = useState([]);

  // Faculty
  const [facultyList, setFacultyList] = useState([]);

  // Result
  const [generationData, setGenerationData] = useState(null);

  // Feasibility prediction (ML)
  const [feasibility, setFeasibility] = useState(null); // { feasible_probability: number } | null
  const [checkingFeasibility, setCheckingFeasibility] = useState(false);

  // UI
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const BASE = import.meta.env.VITE_BASE_URL;
  const sectionNames = dbSections.length > 0
    ? dbSections.map(s => s.name)
    : Array.from({ length: sectionsCount }, (_, i) => String.fromCharCode(65 + i));

  // Load universities
  useEffect(() => {
    axios.get(`${BASE}/api/v1/university/getUni`)
      .then(r => setUniversities(r.data || []))
      .catch(() => setError('Failed to load universities'));
  }, []);

  // Load programs
  useEffect(() => {
    if (!selectedUniversity) { setPrograms([]); setSelectedProgram(null); return; }
    setLoading(true);
    axios.get(`${BASE}/api/v1/programs/getProgram?universityId=${selectedUniversity._id}`)
      .then(r => setPrograms(r.data || []))
      .catch(() => setPrograms([]))
      .finally(() => setLoading(false));
  }, [selectedUniversity]);

  // Load streams based on program directly
  useEffect(() => {
    if (!selectedProgram) { setStreams([]); setSelectedStream(null); return; }
    setLoading(true);
    axios.get(`${BASE}/api/v1/streams/getstreams`)
      .then(r => {
        const filtered = (r.data || []).filter(s => {
          const progId = s.program?._id || s.program;
          return progId === selectedProgram._id;
        });
        setStreams(filtered);
      })
      .catch(() => setStreams([]))
      .finally(() => setLoading(false));
  }, [selectedProgram]);

  // Load sections based on stream directly
  useEffect(() => {
    if (!selectedStream) { setDbSections([]); return; }
    setLoading(true);
    axios.get(`${BASE}/api/v1/sections/getSection`)
      .then(r => {
        const filtered = (r.data || []).filter(s => {
          const strId = s.stream?._id || s.stream;
          return strId === selectedStream._id;
        });
        setDbSections(filtered);
        setSectionsCount(filtered.length);
        if (filtered.length > 0) {
          setSelectedSection(filtered[0]);
        } else {
          setSelectedSection(null);
        }
      })
      .catch(() => setDbSections([]))
      .finally(() => setLoading(false));
  }, [selectedStream]);

  // ── Step 1 → 2: Load section subjects ──────────────────────────────────────
  const handleProceed = async () => {
    if (!selectedUniversity || !selectedProgram || !selectedStream) {
      setError('Please select University, Program, and Stream');
      return;
    }
    if (dbSections.length === 0) {
      setError('Selected stream has no sections defined. Please add sections for this stream first.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const subjectsRes = await axios.get(`${BASE}/api/v1/subjects/getSubjects?streamId=${selectedStream._id}`);
      const subjectsData = subjectsRes.data;
      if (!Array.isArray(subjectsData) || subjectsData.length === 0) {
        setError('No subjects found for this stream. Add subjects for the selected stream first.');
        return;
      }
      const mappedSubjects = subjectsData.map(s => ({
        name: s.name,
        code: s.code != null ? String(s.code) : s.name.substring(0, 5).toUpperCase(),
        type:s.type,
        credit: s.type==="theory"?(s.credits||0):0,
        lab: s.type === 'lab' ? s.credits || 1 : 0,
      }));
      setSubjects(mappedSubjects);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 → 3: Validate config ────────────────────────────────────────────
  const handleConfigNext = () => {
    if (theoryRooms.length === 0) { setError('Add at least one theory room'); return; }
    if (labRooms.length === 0 && subjects.some(s => s.lab > 0)) { setError('Add at least one lab room (subjects have lab sessions)'); return; }
    if (subjects.length < 1) { setError('Add at least one subject'); return; }
    setError('');
    // Pre-populate faculty if empty
    if (facultyList.length === 0) {
      setFacultyList([{ name: '', abbr: '', assignments: [] }]);
    }
    setStep(3);
  };

  // ── Step 3 → 4: Validate faculty ───────────────────────────────────────────
  const handleFacultyNext = () => {
    for (const f of facultyList) {
      if (!f.name.trim()) { setError('All faculty must have a name'); return; }
      if (!f.abbr.trim()) { setError('All faculty must have an abbreviation'); return; }
    }

    // Check coverage for every subject × section
    for (const subj of subjects) {
      for (const sec of sectionNames) {
        if (subj.type === 'theory') {
          const covered = facultyList.some(f =>
            f.assignments.some(a => a.subjectName === subj.name && a.sections.includes(sec) && a.teachesTheory)
          );
          if (!covered) { setError(`No faculty assigned for theory of "${subj.name}" in Section ${sec}`); return; }
        }
        if (subj.type === 'lab') {
          const covered = facultyList.some(f =>
            f.assignments.some(a => a.subjectName === subj.name && a.sections.includes(sec) && a.teachesLab)
          );
          if (!covered) { setError(`No faculty assigned for lab of "${subj.name}" in Section ${sec}`); return; }
        }
      }
    }
    setError('');
    setStep(4);
  };

  // ── Shared payload builder (used by both feasibility check and real generate) ─
  const buildPayload = () => {
    const theoryRoomAssignments = [];
    const labRoomAssignments = [];
    subjects.forEach((subj, idx) => {
      sectionNames.forEach(sec => {
        if (subj.type === 'theory') {
          theoryRoomAssignments.push({
            subjectName: subj.name,
            sectionName: sec,
            roomName: theoryRooms[idx % theoryRooms.length],
          });
        }
        if (subj.type === 'lab') {
          labRoomAssignments.push({
            subjectName: subj.name,
            sectionName: sec,
            roomName: labRooms[idx % labRooms.length],
          });
        }
      });
    });

    return {
      sectionsCount,
      sections: sectionNames,
      theoryRooms,
      labRooms,
      theoryRoomAssignments,
      labRoomAssignments,
      subjects,
      faculty: facultyList,
      periodsPerDay,
      breakPeriod,
      workingDays,
    };
  };

  // ── ML feasibility pre-check ────────────────────────────────────────────────
  const checkFeasibility = async () => {
    setCheckingFeasibility(true);
    try {
      const res = await axios.post(`${BASE}/api/v1/timetable/predict-feasibility`, buildPayload());
      setFeasibility(res.data); // expects { feasible_probability: number }
    } catch (err) {
      setFeasibility(null); // fail silently — this is just a hint, not critical
    } finally {
      setCheckingFeasibility(false);
    }
  };

  // Run the feasibility check automatically when the user reaches Step 4
  useEffect(() => {
    if (step === 4) {
      checkFeasibility();
    }
  }, [step]);

  // ── Generate Timetable ─────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const userId = localStorage.getItem('userId') || '';

      const payload = {
        universityId: selectedUniversity._id,
        programId: selectedProgram._id,
        sectionId: selectedSection._id,
        streamId: selectedStream?._id || '',
        userId,
        ...buildPayload(),
      };

      const response = await axios.post(`${BASE}/api/v1/timetable/schedule`, payload);
      setGenerationData(response.data.data);
      setStep(5);
    } catch (err) {
      const data = err.response?.data;
      const detail = data?.details?.detail ?? data?.detail ?? data?.error;
      const msg = Array.isArray(detail) ? detail[0]?.msg : detail;
      setError(msg || (err.response ? `Server error (${err.response.status})` : 'Network error — could not reach server'));
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setStep(1); setSelectedUniversity(null); setSelectedProgram(null);
    setSelectedSection(null); setSelectedStream(null);
    setSubjects([]); setFacultyList([]); setGenerationData(null);
    setFeasibility(null);
    setError(''); setSuccess('');
  };

  const addFaculty = () => setFacultyList(prev => [...prev, { name: '', abbr: '', assignments: [] }]);
  const updateFaculty = (idx, updated) => setFacultyList(prev => prev.map((f, i) => i === idx ? updated : f));
  const removeFaculty = (idx) => setFacultyList(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="min-h-screen bg-[#f8f7ff]" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Icon.Calendar />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-none">Schedura</h1>
            <p className="text-xs text-slate-500 mt-0.5">Timetable Generator</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <StepBar step={step} />

        {/* Error / Success Alerts */}
        {error && (
          <div className="mb-6 flex gap-3 items-start p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <Icon.Alert />
            <div>
              <p className="font-semibold text-sm">Error</p>
              <p className="text-sm mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600 font-bold text-lg leading-none">×</button>
          </div>
        )}
        {success && (
          <div className="mb-6 flex gap-3 items-center p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
            <Icon.Check />
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* ══════════════ STEP 1: INSTITUTION ══════════════ */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Select Institution</h2>
            <p className="text-slate-500 text-sm mb-8">Choose the university, program, and stream for which you want to generate a timetable.</p>

            <div className="grid md:grid-cols-2 gap-6">
              <SelectField
                label="University"
                value={selectedUniversity?._id || ''}
                onChange={e => setSelectedUniversity(universities.find(u => u._id === e.target.value) || null)}
                options={universities}
                placeholder="-- Select University --"
              />
              <SelectField
                label="Program"
                value={selectedProgram?._id || ''}
                onChange={e => setSelectedProgram(programs.find(p => p._id === e.target.value) || null)}
                options={programs}
                disabled={!selectedUniversity}
                placeholder="-- Select Program --"
              />
              <SelectField
                label="Stream"
                value={selectedStream?._id || ''}
                onChange={e => setSelectedStream(streams.find(s => s._id === e.target.value) || null)}
                options={streams}
                disabled={!selectedProgram}
                placeholder="-- Select Stream --"
              />
            </div>

            {/* Selection Summary */}
            {selectedStream && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex flex-wrap gap-4">
                {[
                  { label: 'University', value: selectedUniversity?.name },
                  { label: 'Program', value: selectedProgram?.name },
                  { label: 'Stream', value: selectedStream?.name },
                  dbSections.length > 0 && { label: 'Sections', value: dbSections.map(s => s.name).join(', ') },
                ].filter(Boolean).map(item => (
                  <div key={item.label}>
                    <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-semibold text-indigo-800">{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleProceed}
              disabled={!selectedUniversity || !selectedProgram || !selectedStream || loading}
              className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              {loading ? <><Icon.Spinner /> Loading...</> : <>Continue to Configure <Icon.Chevron /></>}
            </button>
          </div>
        )}

        {/* ══════════════ STEP 2: CONFIGURE ══════════════ */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Selection summary bar */}
            <div className="bg-indigo-600 text-white rounded-xl px-6 py-3 flex flex-wrap gap-6 text-sm">
              <span><strong>{selectedUniversity?.name}</strong></span>
              <span>·</span>
              <span>{selectedProgram?.name}</span>
              <span>·</span>
              <span>Stream: <strong>{selectedStream?.name}</strong></span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Schedule Configuration</h2>
              <p className="text-slate-500 text-sm mb-8">Configure the schedule parameters and rooms. These will be sent to the Python scheduler.</p>

              {/* Schedule Parameters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Sections Count', value: sectionsCount, set: setSectionsCount, min: 1, max: 6, hint: 'From DB', readOnly: true },
                  { label: 'Periods / Day', value: periodsPerDay, set: setPeriodsPerDay, min: 8, max: 12, hint: '8–12' },
                  { label: 'Break After Period', value: breakPeriod, set: setBreakPeriod, min: 1, max: periodsPerDay - 1, hint: '1-indexed' },
                  { label: 'Working Days', value: workingDays, set: setWorkingDays, min: 1, max: 6, hint: '1–6' },
                ].map(f => (
                  <div key={f.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{f.label}</label>
                    <input
                      type="number"
                      min={f.min} max={f.max}
                      value={f.value}
                      onChange={e => !f.readOnly && f.set(Number(e.target.value))}
                      readOnly={f.readOnly}
                      className={`w-full bg-white border-2 border-slate-200 rounded-lg px-3 py-2 text-lg font-bold text-slate-800 text-center focus:border-indigo-400 outline-none ${f.readOnly ? 'bg-slate-100 cursor-not-allowed text-slate-400' : ''}`}
                    />
                    <p className="text-xs text-slate-400 text-center mt-1">{f.hint}</p>
                  </div>
                ))}
              </div>

              {/* Section Names Preview */}
              <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sections that will be generated</p>
                <div className="flex gap-2 flex-wrap">
                  {sectionNames.map(s => (
                    <span key={s} className="px-3 py-1 bg-indigo-100 text-indigo-700 font-bold rounded-full text-sm">{s}</span>
                  ))}
                </div>
              </div>

              {/* Rooms */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <RoomTagInput label="Theory Rooms" rooms={theoryRooms} onChange={setTheoryRooms} color="indigo" />
                <RoomTagInput label="Lab Rooms" rooms={labRooms} onChange={setLabRooms} color="purple" />
              </div>

              {/* Subjects Preview */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
                  Subjects from Section ({subjects.length})
                  {(subjects.length < 4 || subjects.length > 6) && (
                    <span className="ml-2 text-red-500 normal-case font-normal">⚠ Scheduler requires 4–6 subjects</span>
                  )}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {subjects.map(s => (
                    <div key={s.name} className="p-3 border-2 border-slate-100 rounded-xl bg-slate-50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-slate-800">{s.name}</span>
                        <span className="text-xs font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">{s.code}</span>
                      </div>
                      <div className="flex gap-3 text-xs text-slate-500">
                        <span className="text-indigo-600 font-medium">{s.credit} Theory</span>
                        {s.lab > 0 && <span className="text-purple-600 font-medium">{s.lab} Lab</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition">
                  ← Back
                </button>
                <button onClick={handleConfigNext} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2">
                  Continue to Faculty <Icon.Chevron />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ STEP 3: FACULTY ══════════════ */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-indigo-600 text-white rounded-xl px-6 py-3 flex flex-wrap gap-6 text-sm">
              <span><strong>{selectedUniversity?.name}</strong></span>
              <span>·</span>
              <span>{selectedProgram?.name}</span>
              <span>·</span>
              <span>Stream: <strong>{selectedStream?.name}</strong></span>
              <span>·</span>
              <span>{sectionsCount} sections · {periodsPerDay} periods · {workingDays} days</span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Faculty Assignments</h2>
                  <p className="text-slate-500 text-sm mt-1">Assign faculty to subjects and sections. Faculty may teach multiple subjects if the schedule permits.</p>
                </div>
                <button onClick={addFaculty} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition whitespace-nowrap">
                  <Icon.Plus /> Add Faculty
                </button>
              </div>

              {/* Coverage legend */}
              <div className="flex gap-4 text-xs text-slate-500 mb-6 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded border-2 bg-indigo-600 border-indigo-600 inline-block"></span> Theory class assigned
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded border-2 bg-purple-600 border-purple-600 inline-block"></span> Lab class assigned
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded border-2 border-slate-300 inline-block"></span> Not assigned
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-slate-300">—</span> Not applicable
                </span>
              </div>

              <div className="space-y-4">
                {facultyList.map((f, idx) => (
                  <FacultyCard
                    key={idx}
                    faculty={f}
                    index={idx}
                    subjects={subjects}
                    sectionNames={sectionNames}
                    facultyList={facultyList}
                    onChange={updateFaculty}
                    onRemove={removeFaculty}
                  />
                ))}
                {facultyList.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-4xl mb-3">👤</p>
                    <p className="font-medium">No faculty added yet</p>
                    <p className="text-sm mt-1">Click "Add Faculty" to get started</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(2)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition">
                  ← Back
                </button>
                <button onClick={handleFacultyNext} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2">
                  Continue to Generate <Icon.Chevron />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ STEP 4: GENERATE ══════════════ */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Review & Generate</h2>

              {/* Feasibility (ML) check banner */}
              {checkingFeasibility && (
                <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm flex items-center gap-2">
                  <Icon.Spinner /> Checking feasibility...
                </div>
              )}

              {!checkingFeasibility && feasibility && (
                <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${
                  feasibility.feasible_probability >= 0.7
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : feasibility.feasible_probability >= 0.4
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <Icon.Alert />
                  <div>
                    <p className="font-semibold text-sm">
                      Feasibility check: {Math.round(feasibility.feasible_probability * 100)}% likely to succeed
                    </p>
                    {feasibility.feasible_probability < 0.7 && (
                      <p className="text-sm mt-0.5">
                        This configuration looks tight. Consider adding more theory/lab rooms or faculty before
                        generating — it may take longer or fail.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Stream', value: selectedStream?.name },
                  { label: 'Sections', value: `${sectionsCount} (${sectionNames.join(', ')})` },
                  { label: 'Subjects', value: subjects.length },
                  { label: 'Faculty', value: facultyList.length },
                  { label: 'Theory Rooms', value: theoryRooms.join(', ') },
                  { label: 'Lab Rooms', value: labRooms.join(', ') },
                  { label: 'Periods/Day', value: periodsPerDay },
                  { label: 'Working Days', value: workingDays },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-sm font-bold text-slate-800">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Faculty Summary */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">Faculty Summary</h3>
                <div className="space-y-2">
                  {facultyList.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {f.abbr}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{f.name}</p>
                        <p className="text-xs text-slate-500">
                          {[...new Set(f.assignments.map(a => a.subjectName))].join(', ') || 'No subjects assigned'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6 text-center mb-6">
                <p className="text-slate-600 mb-2 text-sm">Ready to generate an optimized, conflict-free timetable using</p>
                <p className="font-bold text-indigo-700 text-lg">OR-Tools Constraint Programming</p>
                <p className="text-slate-500 text-xs mt-1">This may take 10–30 seconds</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(3)} disabled={generating} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition disabled:opacity-50">
                  ← Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                >
                  {generating ? <><Icon.Spinner /> Generating...</> : '✨ Generate Timetable'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ STEP 5: VIEW ══════════════ */}
        {step === 5 && generationData && (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                <Icon.Check />
              </div>
              <div>
                <p className="font-semibold text-emerald-800">Timetable Generated & Saved!</p>
                <p className="text-sm text-emerald-600">Your timetable has been saved to the database successfully.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Generated Timetable</h2>
                <div className="flex gap-2">
                  <button onClick={() => window.print()} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition">
                    🖨 Print
                  </button>
                  <button onClick={handleReset} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition">
                    ✨ New Timetable
                  </button>
                </div>
              </div>
              <TimetableView schedule={generationData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTablePage;