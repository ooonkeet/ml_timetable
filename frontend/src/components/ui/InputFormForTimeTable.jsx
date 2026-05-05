import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateSchedule } from "../../api/api";
import { toast } from "react-hot-toast";
import { Plus, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v || 0));

const getInitialData = () => {
  try {
    const saved = localStorage.getItem('inputFormData');
    if (!saved) return null;

    const { data, timestamp } = JSON.parse(saved);
    const TEN_MINUTES = 10 * 60 * 1000;

    if (Date.now() - timestamp > TEN_MINUTES) {
      localStorage.removeItem('inputFormData');
      return null;
    }
    return data;
  } catch (e) {
    console.error("Error loading form data from storage:", e);
    localStorage.removeItem('inputFormData');
    return null;
  }
};

const initialData = getInitialData();

export default function InputFormForTimeTable() {
  const [isLoading, setIsLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [sectionsCount, setSectionsCount] = useState(initialData?.sectionsCount ?? 1); // max 6
  const navigate = useNavigate();
  const [theoryRooms, setTheoryRooms] = useState([]);
  const [labRooms, setLabRooms] = useState([]);
  const [theoryRoomAssignments, setTheoryRoomAssignments] = useState(initialData?.theoryRoomAssignments ?? [{ roomName: "", sections: [""] }]);
  const [labRoomAssignments, setLabRoomAssignments] = useState(initialData?.labRoomAssignments ?? [{ roomName: "", assignments: [{ subjectName: "", sections: [] }] }]);
  const [subjects, setSubjects] = useState(initialData?.subjects ?? [{ name: "", code: "", credit: 1, lab: 0 }]);
  const [faculty, setFaculty] = useState(initialData?.faculty ?? []);
  const [periodsPerDay, setPeriodsPerDay] = useState(initialData?.periodsPerDay ?? 8);
  const [breakPeriod, setBreakPeriod] = useState(initialData?.breakPeriod ?? 4); // 1-indexed

  useEffect(() => {
    const formState = { sectionsCount, theoryRoomAssignments, labRoomAssignments, subjects, faculty, periodsPerDay, breakPeriod };
    const dataToSave = {
      data: formState,
      timestamp: Date.now(),
    };
    localStorage.setItem('inputFormData', JSON.stringify(dataToSave));
  }, [sectionsCount, theoryRoomAssignments, labRoomAssignments, subjects, faculty, periodsPerDay, breakPeriod]);

  // Persists the schedule and navigates to the timetable view.
  const persistAndNavigate = (data) => {
    if (data) {
      localStorage.setItem('timetableData', JSON.stringify(data));
      navigate('/timetable');
    } else {
      localStorage.removeItem('timetableData');
    }
  };

  const handleClearForm = () => {
    setShowClearConfirm(true);
  };

  const confirmClearForm = () => {
    setSectionsCount(1);
    setTheoryRoomAssignments([{ roomName: "", sections: [""] }]);
    setLabRoomAssignments([{ roomName: "", assignments: [{ subjectName: "", sections: [] }] }]);
    setSubjects([{ name: "", code: "", credit: 1, lab: 0 }]);
    setFaculty([]);
    setPeriodsPerDay(8);
    setBreakPeriod(4);
    localStorage.removeItem('inputFormData');
    setShowClearConfirm(false);
    toast.success("Form cleared successfully!");
  };

  // helpers to edit arrays
  const setAt = (arr, idx, val, setter) => {
    const copy = [...arr];
    copy[idx] = val;
    setter(copy);
  };

  const minSubjects = 4;
  const maxSubjects = 6;
  const maxPeriodsPerDay = 12;
  const sectionNames = Array.from({ length: sectionsCount }, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i));

  // add/remove helpers
  const addTheoryRoom = () => setTheoryRoomAssignments([...theoryRoomAssignments, { roomName: "", sections: [""] }]);
  const removeTheoryRoom = (i) => setTheoryRoomAssignments(theoryRoomAssignments.filter((_, idx) => idx !== i));
  const addLabRoom = () => setLabRoomAssignments([...labRoomAssignments, { roomName: "", assignments: [{ subjectName: "", sections: [] }] }]);
  const removeLabRoom = (i) => setLabRoomAssignments(labRoomAssignments.filter((_, idx) => idx !== i));
  const addSubject = () => subjects.length < maxSubjects && setSubjects([...subjects, { name: "", code: "", credit: 1, lab: 0 }]);
  const removeSubject = (i) => setSubjects(subjects.filter((_, idx) => idx !== i));
  const addFaculty = () => setFaculty([...faculty, { name: "", abbr: "", assignments: [] }]);
  const removeFaculty = (i) => setFaculty(faculty.filter((_, idx) => idx !== i));

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      // simple validation
      if (sectionsCount < 1 || sectionsCount > 6) throw new Error(`Sections must be 1-6.`);
      if (subjects.length < minSubjects || subjects.length > maxSubjects) throw new Error(`Please add between 4 and 6 subjects.`);

      // --- New Room Assignment Validation ---
      const requiredTheorySections = new Set(sectionNames.filter(sec => subjects.some(s => s.credit > 0)));
      const assignedTheorySections = new Set(theoryRoomAssignments.flatMap(a => a.sections).filter(Boolean));
      if (requiredTheorySections.size > 0 && requiredTheorySections.size > assignedTheorySections.size) {
        throw new Error("Not all sections with theory classes have been assigned a theory room.");
      }

      const requiredLabSlots = new Set();
      subjects.forEach(s => {
        if (s.lab > 0) {
          sectionNames.forEach(sec => requiredLabSlots.add(`${s.name}-${sec}`));
        }
      });
      const assignedLabSlots = new Set();
      labRoomAssignments.forEach(room => {
        room.assignments.forEach(assign => {
          assign.sections.forEach(sec => {
            assignedLabSlots.add(`${assign.subjectName}-${sec}`);
          });
        });
      });
      if (requiredLabSlots.size > 0 && requiredLabSlots.size > assignedLabSlots.size) {
        throw new Error("Not all required lab classes have been assigned a lab room.");
      }

      for (const assignment of theoryRoomAssignments) {
        if (!assignment.roomName.trim()) {
          throw new Error("All theory rooms must have a name.");
        }
        if (assignment.sections.filter(Boolean).length === 0) {
          throw new Error(`Room "${assignment.roomName}" is defined but not assigned to any section.`);
        }
      }

      // Check for empty input fields
      const allTheoryRoomNames = theoryRoomAssignments.map(a => a.roomName);
      if (allTheoryRoomNames.some(r => !r.trim())) {
        throw new Error("All theory rooms must have a name.");
      }
      const allLabRoomNames = labRoomAssignments.map(a => a.roomName);
      if (allLabRoomNames.some(r => !r.trim())) {
        throw new Error("All lab rooms must have a name.");
      }

      // Uniqueness validation for subjects and rooms (case-insensitive)
      const seenSubjectNames = new Set();
      const seenSubjectCodes = new Set();
      for (const s of subjects) {
        if (s.name) {
          if (seenSubjectNames.has(s.name.toLowerCase())) {
            throw new Error(`Subject names must be unique. Found duplicate: "${s.name}".`);
          }
          seenSubjectNames.add(s.name.toLowerCase());
        }
        if (s.code) {
          if (seenSubjectCodes.has(s.code.toLowerCase())) {
            throw new Error(`Subject codes must be unique. Found duplicate code: "${s.code}".`);
          }
          seenSubjectCodes.add(s.code.toLowerCase());
        }
      }

      const seenTheoryRooms = new Set();
      for (const r of allTheoryRoomNames) {
        if (r) {
          if (seenTheoryRooms.has(r.toLowerCase())) {
            throw new Error(`Theory room names must be unique. Found duplicate: "${r}".`);
          }
          seenTheoryRooms.add(r.toLowerCase());
        }
      }

      const seenLabRooms = new Set();
      for (const r of allLabRoomNames) {
        if (r) {
          if (seenLabRooms.has(r.toLowerCase())) {
            throw new Error(`Lab room names must be unique. Found duplicate: "${r}".`);
          }
          seenLabRooms.add(r.toLowerCase());
        }
      }

      // Check for duplicates between theory and lab rooms
      for (const r of allLabRoomNames) {
        if (r && seenTheoryRooms.has(r.toLowerCase())) {
          throw new Error(`Room names must be unique across theory and lab rooms. Found duplicate: "${r}".`);
        }
      }

      // Uniqueness validation for faculty names (case-insensitive)
      const seenFacultyNames = new Set();
      const seenFacultyAbbrs = new Set();
      for (const f of faculty) {
        if (f.name) {
          if (seenFacultyNames.has(f.name.toLowerCase())) {
            throw new Error(`Faculty names must be unique. Found duplicate: "${f.name}".`);
          }
          seenFacultyNames.add(f.name.toLowerCase());
        }
        if (f.abbr) {
          if (seenFacultyAbbrs.has(f.abbr.toLowerCase())) {
            throw new Error(`Faculty abbreviations must be unique. Found duplicate abbreviation: "${f.abbr}".`);
          }
          seenFacultyAbbrs.add(f.abbr.toLowerCase());
        }
      }

      for (const s of subjects) {
        if (!s.name.trim()) throw new Error("All subjects must have a name.");
        if (s.code.trim().length < 1 || s.code.trim().length > 5) throw new Error(`Subject code for "${s.name || 'Unnamed Subject'}" must be between 1 and 5 characters long.`);
        if (s.credit < 0 || s.credit > 3) throw new Error("Credits must be 0-3");
        if (s.lab < 0 || s.lab > 3) throw new Error("Lab count must be 0-3");
        if (s.credit === 0 && s.lab === 0) throw new Error(`Subject "${s.name}" must have at least one theory or lab class.`);
      }

      for (const f of faculty) {
        if (!f.name.trim()) {
          throw new Error("All faculty members must have a name.");
        }
        if (!f.abbr.trim()) {
          throw new Error("All faculty members must have an abbreviation.");
        }
        for (const a of f.assignments) {
          if (!a.subject || !a.section) {
            throw new Error(`Faculty "${f.name}" has an incomplete assignment. Please select both a subject and a section.`);
          }
          if (!a.teachesTheory && !a.teachesLab) {
            throw new Error(`Faculty "${f.name}" has an assignment for "${a.subject}" in section ${a.section} with no teaching mode (Theory/Lab) selected.`);
          }
        }
      }

      // New validation: Ensure every subject is assigned to a faculty for every section.
      const validationErrors = [];
      for (const subject of subjects) {
        if (!subject.name) continue;
        for (const secName of sectionNames) {
          // Check theory coverage
          if (subject.credit > 0) {
            const isTheoryCovered = faculty.some((f) =>
              f.assignments.some((a) => a.subject === subject.name && a.section === secName && a.teachesTheory)
            );
            if (!isTheoryCovered) {
              validationErrors.push(`Theory for subject "${subject.name}" is not assigned to any faculty for Section ${secName}.`);
            }
          }
          // Check lab coverage
          if (subject.lab > 0) {
            const isLabCovered = faculty.some((f) =>
              f.assignments.some((a) => a.subject === subject.name && a.section === secName && a.teachesLab)
            );
            if (!isLabCovered) {
              validationErrors.push(`Lab for subject "${subject.name}" is not assigned to any faculty for Section ${secName}.`);
            }
          }
        }
      }
      if (validationErrors.length > 0) {
        throw new Error("Please fix the following assignment issues:\n- " + validationErrors.join("\n- "));
      }

      // --- New Payload Transformation ---
      const finalTheoryRooms = [...new Set(theoryRoomAssignments.map(a => a.roomName).filter(Boolean))];
      const finalLabRooms = [...new Set(labRoomAssignments.map(a => a.roomName).filter(Boolean))];

      const finalTheoryRoomAssignments = [];
      theoryRoomAssignments.forEach(tra => {
        if (tra.roomName) {
          tra.sections.forEach(sectionName => {
            if (sectionName) {
              subjects.forEach(s => {
                if (s.credit > 0) {
                  finalTheoryRoomAssignments.push({
                    subjectName: s.name,
                    sectionName: sectionName,
                    roomName: tra.roomName
                  });
                }
              });
            }
          });
        }
      });

      const finalLabRoomAssignments = [];
      labRoomAssignments.forEach(lra => {
        if (lra.roomName) {
          lra.assignments.forEach(assign => {
            assign.sections.forEach(sec => {
              finalLabRoomAssignments.push({ subjectName: assign.subjectName, sectionName: sec, roomName: lra.roomName });
            });
          });
        }
      });

      const payload = {
        sectionsCount,
        theoryRooms: finalTheoryRooms,
        labRooms: finalLabRooms,
        theoryRoomAssignments: finalTheoryRoomAssignments,
        labRoomAssignments: finalLabRoomAssignments,
        subjects: subjects.map((s) => ({ name: s.name, code: s.code, credit: Number(s.credit), lab: Number(s.lab) })),
        faculty: faculty
          .map((f) => {
            // Group assignments by subject and teaching mode to match backend expectations
            const assignmentsByGroup = new Map();
            f.assignments.forEach((a) => {
              if (!a.subject || !a.section || (!a.teachesTheory && !a.teachesLab)) {
                return;
              }
              const key = `${a.subject}-${a.teachesTheory}-${a.teachesLab}`;
              if (!assignmentsByGroup.has(key)) {
                assignmentsByGroup.set(key, {
                  subjectName: a.subject,
                  teachesTheory: a.teachesTheory,
                  teachesLab: a.teachesLab,
                  sections: [],
                });
              }
              assignmentsByGroup.get(key).sections.push(a.section);
            });

            return { name: f.name, abbr: f.abbr, assignments: Array.from(assignmentsByGroup.values()) };
          })
          .filter((f) => f.name && f.assignments.length > 0),
        periodsPerDay: Number(periodsPerDay),
        breakPeriod: Number(breakPeriod),
        workingDays: 5,
      };

      const res = await generateSchedule(payload);
      persistAndNavigate(res.data);
    } catch (err) {
      console.error(err);
      // For API errors, the message might be nested. For validation errors, it's just err.message.
      const apiMessage = err.response?.data?.detail || err.response?.data?.error;
      if (apiMessage) {
        toast.error(`Failed to generate timetable: ${apiMessage}`);
      } else {
        toast.error(err.message || "An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Pre-calculate all assigned slots to check for conflicts
  const assignedSlots = useMemo(() => {
    const slots = new Map();
    faculty.forEach((f, fi) => {
      f.assignments.forEach((a, ai) => {
        if (a.subject && a.section) {
          if (a.teachesTheory) {
            slots.set(`${a.subject}-${a.section}-theory`, { fi, ai });
          }
          if (a.teachesLab) {
            slots.set(`${a.subject}-${a.section}-lab`, { fi, ai });
          }
        }
      });
    });
    return slots;
  }, [faculty]);

  const isSlotTakenByOther = (subject, section, mode, currentFacultyIdx, currentAssignmentIdx) => {
    if (!subject || !section) return false;
    const key = `${subject}-${section}-${mode}`;
    if (!assignedSlots.has(key)) return false;
    const owner = assignedSlots.get(key);
    return owner.fi !== currentFacultyIdx || owner.ai !== currentAssignmentIdx;
  };

  const assignedLabSlotsMap = useMemo(() => {
    const map = new Map();
    labRoomAssignments.forEach((room, roomIndex) => {
      room.assignments.forEach(assign => {
        if (assign.subjectName) {
          assign.sections.forEach(sec => {
            map.set(`${assign.subjectName}-${sec}`, { roomIndex });
          });
        }
      });
    });
    return map;
  }, [labRoomAssignments]);

  const isLabSlotTakenByOther = (subjectName, sectionName, currentRoomIndex) => {
    if (!subjectName || !sectionName) return false;
    const key = `${subjectName}-${sectionName}`;
    if (!assignedLabSlotsMap.has(key)) return false;
    const owner = assignedLabSlotsMap.get(key);
    return owner.roomIndex !== currentRoomIndex;
  };

  const totalAvailableSlots = useMemo(() => {
    let count = 0;
    subjects.forEach(subject => {
      if (subject.name) {
        sectionNames.forEach(() => {
          if (subject.credit > 0) {
            count++;
          }
          if (subject.lab > 0) {
            count++;
          }
        });
      }
    });
    return count;
  }, [subjects, sectionNames]);

  const allSlotsAssigned = totalAvailableSlots > 0 && assignedSlots.size >= totalAvailableSlots;

  // --- Memos for new room assignment logic ---
  const assignedTheorySectionSet = useMemo(() => new Set(theoryRoomAssignments.flatMap(a => a.sections).filter(Boolean)), [theoryRoomAssignments]);
  const sectionsWithTheory = useMemo(() => new Set(sectionNames.filter(sec => subjects.some(s => s.credit > 0))), [subjects, sectionNames]);
  const allTheorySectionsAssigned = sectionsWithTheory.size > 0 && assignedTheorySectionSet.size >= sectionsWithTheory.size;

  const allRequiredLabSlots = useMemo(() => {
    const slots = new Set();
    subjects.forEach(s => {
      if (s.lab > 0) sectionNames.forEach(sec => slots.add(`${s.name}-${sec}`));
    });
    return slots;
  }, [subjects, sectionNames]);

  const assignedLabSlotsSet = useMemo(() => {
    const slots = new Set();
    labRoomAssignments.forEach(room => {
      room.assignments.forEach(assign => {
        if (assign.subjectName) assign.sections.forEach(sec => slots.add(`${assign.subjectName}-${sec}`));
      });
    });
    return slots;
  }, [labRoomAssignments]);
  const allLabSlotsAssigned = allRequiredLabSlots.size > 0 && assignedLabSlotsSet.size >= allRequiredLabSlots.size;

  const inputClasses = "w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm";
  const buttonClasses = "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed";
  const removeButtonClasses = "p-2 text-red-500 hover:bg-red-100 rounded-full";

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
        {/* General Settings */}
      <div className="p-4 border border-slate-200 rounded-lg">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">General Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="sectionsCount" className="block text-sm font-medium text-slate-600 mb-1">Sections (1-6)</label>
            <input
              id="sectionsCount"
              type="number"
              min="1"
              max="6"
              value={sectionsCount}
              className={inputClasses}
              onChange={(e) => {
                const newCount = clamp(Number(e.target.value), 1, 6);
                setSectionsCount(newCount);
                if (theoryRooms.length > newCount) setTheoryRooms(theoryRooms.slice(0, newCount));
                if (labRooms.length > newCount) setLabRooms(labRooms.slice(0, newCount));
                if (subjects.length > maxSubjects) setSubjects(subjects.slice(0, maxSubjects));
              }}
            />
          </div>
          <div>
            <label htmlFor="periodsPerDay" className="block text-sm font-medium text-slate-600 mb-1">Periods per Day</label>
            <input
              id="periodsPerDay"
              type="number"
              min="8"
              max={maxPeriodsPerDay}
              value={periodsPerDay}
              className={inputClasses}
              onChange={(e) => {
                const newPeriods = clamp(Number(e.target.value), 8, maxPeriodsPerDay);
                setPeriodsPerDay(newPeriods);
                setBreakPeriod(Math.ceil(newPeriods / 2));
              }}
            />
          </div>
          <div>
            <label htmlFor="breakPeriod" className="block text-sm font-medium text-slate-600 mb-1">Break Period (1-indexed)</label>
            <input
              id="breakPeriod"
              type="number"
              min="1"
              max={periodsPerDay}
              value={breakPeriod}
              className={inputClasses}
              onChange={(e) => setBreakPeriod(clamp(Number(e.target.value), 1, periodsPerDay))}
            />
          </div>
        </div>
      </div>

      {/* Subjects Section */}
      <div className="p-4 border border-slate-200 rounded-lg">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">{`Subjects (${subjects.length} total, min 4, max ${maxSubjects})`}</h3>
        <div className="space-y-4">
          {subjects.map((s, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-md border">
              <div className="flex gap-4 items-center">
                <input
                  placeholder="Subject Name"
                  className={inputClasses + " flex-grow font-medium"}
                  value={s.name}
                  onChange={(e) => setAt(subjects, i, { ...s, name: e.target.value }, setSubjects)}
                />
                <button type="button" onClick={() => removeSubject(i)} className={removeButtonClasses}>
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="pl-4 border-l-2 border-slate-200 ml-2 space-y-3 pt-2 mt-2">
                <div>
                  <label className="text-sm font-medium text-slate-600 mb-1 block">Code (1-5 chars)</label>
                  <input
                    placeholder="Code"
                    value={s.code}
                    maxLength="5"
                    className={inputClasses + " max-w-xs"}
                    onChange={(e) => setAt(subjects, i, { ...s, code: e.target.value }, setSubjects)}
                  />
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1 block">Theory classes per week</label>
                    <input
                      type="number"
                      min="0"
                      max="3"
                      value={s.credit}
                      className={inputClasses + " w-24 text-center"}
                      onChange={(e) => setAt(subjects, i, { ...s, credit: clamp(Number(e.target.value), 0, 3) }, setSubjects)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1 block">Practical Classes per week</label>
                    <input
                      type="number"
                      min="0"
                      max="3"
                      value={s.lab}
                      className={inputClasses + " w-24 text-center"}
                      onChange={(e) => setAt(subjects, i, { ...s, lab: clamp(Number(e.target.value), 0, 3) }, setSubjects)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button type="button" onClick={addSubject} disabled={subjects.length >= maxSubjects} className={buttonClasses}>
            <Plus size={16} /> Add Subject
          </button>
        </div>
      </div>

      {/* Theory Room Allocation */}
      <div className="p-4 border border-slate-200 rounded-lg">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Theory Room Allocation</h3>
        <div className="space-y-4">
          {theoryRoomAssignments.map((assignment, roomIndex) => (
            <div key={roomIndex} className="p-3 bg-slate-50 rounded-md border">
              <div className="flex gap-4 items-center mb-2">
                <input
                  value={assignment.roomName}
                  onChange={(e) => {
                    const newAssignments = [...theoryRoomAssignments];
                    newAssignments[roomIndex].roomName = e.target.value;
                    setTheoryRoomAssignments(newAssignments);
                  }}
                  placeholder={`Theory Room ${roomIndex + 1} Name`}
                  className={inputClasses + " flex-1"}
                />
                <button type="button" onClick={() => removeTheoryRoom(roomIndex)} className={removeButtonClasses}><Trash2 size={18} /></button>
              </div>

              <div className="space-y-2 pl-4">
                {assignment.sections.map((sectionName, sectionIndex) => (
                  <div key={sectionIndex} className="flex gap-2 items-center">
                    <label className="flex-shrink-0 w-20 text-sm text-slate-600">Section:</label>
                    <select
                      value={sectionName}
                      onChange={(e) => {
                        const newAssignments = [...theoryRoomAssignments];
                        newAssignments[roomIndex].sections[sectionIndex] = e.target.value;
                        setTheoryRoomAssignments(newAssignments);
                      }}
                      className={inputClasses + " flex-1"}
                    >
                      <option value="">-- Select Section --</option>
                      {sectionNames.filter(sec => sectionsWithTheory.has(sec)).map(sec => {
                        const isAssigned = assignedTheorySectionSet.has(sec);
                        const isCurrentlySelected = sectionName === sec;
                        return <option key={sec} value={sec} disabled={isAssigned && !isCurrentlySelected}>{sec}</option>
                      })}
                    </select>
                    {assignment.sections.length > 1 && (
                      <button type="button" className="p-1 text-slate-500 hover:bg-slate-200 rounded-full" onClick={() => {
                        const newAssignments = [...theoryRoomAssignments];
                        newAssignments[roomIndex].sections.splice(sectionIndex, 1);
                        setTheoryRoomAssignments(newAssignments);
                      }}>
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {assignment.sections.length < 2 && assignment.sections.length < sectionsWithTheory.size && assignment.sections.some(s => s) && (
                <button
                  type="button"
                  className="ml-24 mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    const newAssignments = [...theoryRoomAssignments];
                    newAssignments[roomIndex].sections.push("");
                    setTheoryRoomAssignments(newAssignments);
                  }}
                  disabled={allTheorySectionsAssigned}
                >
                  <Plus size={14} /> Add section
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button type="button" onClick={addTheoryRoom} disabled={allTheorySectionsAssigned} className={buttonClasses}>
            <Plus size={16} /> Add Theory Room
          </button>
        </div>
      </div>

      {/* Lab Room Allocation */}
      <div className="p-4 border border-slate-200 rounded-lg">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Lab Room Allocation</h3>
        <div className="space-y-4">
          {labRoomAssignments.map((labRoom, roomIndex) => {
            const currentAssignmentsInRoom = labRoom.assignments.reduce((acc, a) => acc + a.sections.length, 0);

            return (
              <div key={roomIndex} className="p-3 bg-slate-50 rounded-md border">
              <div className="flex gap-4 items-center mb-3">
                <input
                  value={labRoom.roomName}
                  onChange={e => {
                    const newAssignments = [...labRoomAssignments];
                    newAssignments[roomIndex].roomName = e.target.value;
                    setLabRoomAssignments(newAssignments);
                  }}
                  placeholder={`Lab ${roomIndex + 1} Room Number`}
                  className={inputClasses + " flex-1"}
                />
                <button type="button" onClick={() => removeLabRoom(roomIndex)} className={removeButtonClasses}><Trash2 size={18} /></button>
              </div>

              <div className="space-y-3 pl-4">
              {labRoom.assignments.map((assign, assignIndex) => {
                return (
                <div key={assignIndex} className="border-l-2 border-slate-200 pl-4">
                  <div className="flex gap-2 items-center">
                    <select
                      value={assign.subjectName}
                      className={inputClasses}
                      onChange={e => {
                        const newAssignments = [...labRoomAssignments];
                        newAssignments[roomIndex].assignments[assignIndex].subjectName = e.target.value;
                        newAssignments[roomIndex].assignments[assignIndex].sections = []; // Reset sections on subject change
                        setLabRoomAssignments(newAssignments);
                      }}
                    >
                      <option value="">-- Select Subject --</option>
                      {subjects.filter(s => s.lab > 0).map(s => {
                        const isCurrentlySelected = s.name === assign.subjectName;
                        const hasAvailableSection = sectionNames.some(secName => {
                          const takenByOtherRoom = isLabSlotTakenByOther(s.name, secName, roomIndex);
                          const takenBySameSubjectInThisRoom = labRoom.assignments.some((otherAssign, otherIdx) =>
                            assignIndex !== otherIdx && otherAssign.subjectName === s.name && otherAssign.sections.includes(secName)
                          );
                          return !takenByOtherRoom && !takenBySameSubjectInThisRoom;
                        });

                        const isDisabled = !hasAvailableSection && !isCurrentlySelected;
                        return <option key={s.name} value={s.name} disabled={isDisabled}>{s.name}</option>;
                      })}
                    </select>
                    <button type="button" className="p-1 text-slate-500 hover:bg-slate-200 rounded-full" onClick={() => {
                      const newAssignments = [...labRoomAssignments];
                      newAssignments[roomIndex].assignments.splice(assignIndex, 1);
                      setLabRoomAssignments(newAssignments);
                    }}><X size={16} /></button>
                  </div>
                  <div className="mt-2 text-sm">
                    <strong className="font-medium text-slate-600">Sections (max 6 assignements per week):</strong>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-1">
                    {sectionNames.map(secName => {
                      const isChecked = assign.sections.includes(secName);
                      const isTakenElsewhere = isLabSlotTakenByOther(assign.subjectName, secName, roomIndex);
                      const isTakenBySameSubjectInThisRoom = labRoom.assignments.some((otherAssign, otherIdx) =>
                        assignIndex !== otherIdx &&
                        otherAssign.subjectName === assign.subjectName &&
                        otherAssign.sections.includes(secName)
                      );
                      const isRoomFull = currentAssignmentsInRoom >= 6 && !isChecked;
                      const isDisabled = !assign.subjectName || isRoomFull || isTakenElsewhere || isTakenBySameSubjectInThisRoom;
                      return (
                        <label key={secName} className={`flex items-center gap-1.5 text-sm ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={isChecked}
                            disabled={isDisabled}
                            onChange={e => {
                              const newAssignments = [...labRoomAssignments];
                              const currentSections = newAssignments[roomIndex].assignments[assignIndex].sections;
                              const newSections = e.target.checked
                                ? [...currentSections, secName]
                                : currentSections.filter(s => s !== secName);
                              newAssignments[roomIndex].assignments[assignIndex].sections = newSections;
                              setLabRoomAssignments(newAssignments);
                            }}
                          /> {secName}
                        </label>
                      );
                    })}
                    </div>
                  </div>
                </div>
              )})}
              </div>
              <button
                type="button"
                className="ml-4 mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentAssignmentsInRoom >= 6 || allLabSlotsAssigned}
                onClick={() => {
                  const newAssignments = [...labRoomAssignments];
                  newAssignments[roomIndex].assignments.push({ subjectName: "", sections: [] });
                  setLabRoomAssignments(newAssignments);
                }}
              >
                <Plus size={14} /> Add Subject to Room
              </button>
            </div>
          )})}
        </div>
        <div className="mt-4">
          <button type="button" onClick={addLabRoom} disabled={allLabSlotsAssigned} className={buttonClasses}>
            <Plus size={16} /> Add Lab Room
          </button>
        </div>
      </div>

      {/* Faculty Section */}
      <div className="p-4 border border-slate-200 rounded-lg">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">{`Faculty (${faculty.length} total)`}</h3>
        <div className="space-y-4">
        {faculty.map((f, facultyIdx) => {
          const uniqueSubjects = new Set(f.assignments.map(a => a.subject).filter(Boolean));

          let canTakeNewAssignment = false;
          for (const s of subjects) {
            if (!s.name) continue;

            const canTeachSubject = uniqueSubjects.size < 2 || uniqueSubjects.has(s.name);
            if (!canTeachSubject) continue;

            for (const secName of sectionNames) {
              const theoryNeededAndAvailable = s.credit > 0 && !assignedSlots.has(`${s.name}-${secName}-theory`);
              const labNeededAndAvailable = s.lab > 0 && !assignedSlots.has(`${s.name}-${secName}-lab`);
              if (theoryNeededAndAvailable || labNeededAndAvailable) {
                canTakeNewAssignment = true;
                break;
              }
            }
            if (canTakeNewAssignment) break;
          }

          return (
            <div key={facultyIdx} className="p-3 bg-slate-50 rounded-md border">
              <div className="flex gap-4 items-center mb-3">
                <input placeholder="Faculty Name" value={f.name} className={inputClasses + " flex-grow"} onChange={(e) => setAt(faculty, facultyIdx, { ...f, name: e.target.value }, setFaculty)} />
                <input placeholder="Abbreviation" value={f.abbr} className={inputClasses + " w-32"} onChange={(e) => setAt(faculty, facultyIdx, { ...f, abbr: e.target.value }, setFaculty)} />
                <button type="button" onClick={() => removeFaculty(facultyIdx)} className={removeButtonClasses}>
                  <Trash2 size={18} />
                </button>
              </div>

              <h5 className="text-sm font-medium text-slate-600 mb-2 pl-4">Assignments (max 2 unique subjects)</h5>
              <div className="space-y-3 pl-4">
              {f.assignments.map((assign, assignIdx) => (
                <div key={assignIdx} className="border-l-2 border-slate-200 pl-4">
                  <div className="grid grid-cols-[1fr,1fr,auto] items-center gap-2">
                    <select
                      value={assign.subject}
                      className={inputClasses}
                      onChange={e => {
                        const newFaculty = [...faculty];
                        const newSubjectName = e.target.value;
                        newFaculty[facultyIdx].assignments[assignIdx].subject = newSubjectName;
                        newFaculty[facultyIdx].assignments[assignIdx].section = ""; // Reset section on subject change
                        newFaculty[facultyIdx].assignments[assignIdx].teachesTheory = false;
                        newFaculty[facultyIdx].assignments[assignIdx].teachesLab = false;
                        setFaculty(newFaculty);
                      }}
                    >
                      <option value="">-- Select Subject --</option>
                      {subjects.filter(s => s.name).map(s => {
                        const isAlreadyTaught = uniqueSubjects.has(s.name);
                        const isCurrentlySelected = s.name === assign.subject;
                        const isDisabledBySubjectLimit = uniqueSubjects.size >= 2 && !isAlreadyTaught;

                        let allSectionsUnavailable = true;
                        if (!isDisabledBySubjectLimit) {
                          for (const secName of sectionNames) {
                            const canHaveTheory = s.credit > 0;
                            const canHaveLab = s.lab > 0;
                            const theoryTaken = canHaveTheory && isSlotTakenByOther(s.name, secName, "theory", facultyIdx, assignIdx);
                            const labTaken = canHaveLab && isSlotTakenByOther(s.name, secName, "lab", facultyIdx, assignIdx);
                            if ((canHaveTheory && !theoryTaken) || (canHaveLab && !labTaken)) {
                              allSectionsUnavailable = false;
                              break;
                            }
                          }
                        }

                        const isDisabled = (isDisabledBySubjectLimit || allSectionsUnavailable) && !isCurrentlySelected;
                        return <option key={s.name} value={s.name} disabled={isDisabled} title={isDisabled ? ((isDisabledBySubjectLimit && !isCurrentlySelected) ? "Faculty already teaches 2 unique subjects." : (allSectionsUnavailable && !isCurrentlySelected) ? "All sections for this subject are already assigned to other faculty." : "") : ""}>{s.name}</option>;
                      })}
                    </select>
                    <select
                      value={assign.section}
                      disabled={!assign.subject}
                      className={inputClasses}
                      onChange={(e) => {
                        const newFaculty = [...faculty];
                        newFaculty[facultyIdx].assignments[assignIdx].section = e.target.value;
                        newFaculty[facultyIdx].assignments[assignIdx].teachesTheory = false;
                        newFaculty[facultyIdx].assignments[assignIdx].teachesLab = false;
                        setFaculty(newFaculty);
                      }}
                    >
                      <option value="">-- Select Section --</option>
                      {sectionNames.map((secName) => {
                        const subjectInfo = subjects.find(s => s.name === assign.subject);
                        const canHaveTheory = subjectInfo && subjectInfo.credit > 0;
                        const canHaveLab = subjectInfo && subjectInfo.lab > 0;
                        const theoryTaken = canHaveTheory && isSlotTakenByOther(assign.subject, secName, "theory", facultyIdx, assignIdx);
                        const labTaken = canHaveLab && isSlotTakenByOther(assign.subject, secName, "lab", facultyIdx, assignIdx);

                        const isDisabled = (!canHaveTheory || theoryTaken) && (!canHaveLab || labTaken);
                        return (
                          <option key={secName} value={secName} disabled={isDisabled} title={isDisabled ? "Both Theory and Lab slots are already assigned to another faculty for this section." : ""}>
                            {secName}
                          </option>
                        );
                      })}
                    </select>
                    <button type="button" className="p-1 text-slate-500 hover:bg-slate-200 rounded-full" onClick={() => {
                      const newFaculty = [...faculty];
                      newFaculty[facultyIdx].assignments.splice(assignIdx, 1);
                      setFaculty(newFaculty);
                    }}><X size={16} /></button>
                  </div>

                  {assign.subject && assign.section && (
                    <div className="mt-2 text-sm flex gap-4 items-center">
                      <strong className="font-medium text-slate-600">Teaches:</strong>
                      {subjects.find((s) => s.name === assign.subject)?.credit > 0 && (
                        <label className={`flex items-center gap-1.5 ${isSlotTakenByOther(assign.subject, assign.section, "theory", facultyIdx, assignIdx) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={assign.teachesTheory}
                            disabled={isSlotTakenByOther(assign.subject, assign.section, "theory", facultyIdx, assignIdx)}
                            onChange={(e) => {
                              const newFaculty = [...faculty];
                              newFaculty[facultyIdx].assignments[assignIdx].teachesTheory = e.target.checked;
                              setFaculty(newFaculty);
                            }}
                          />
                          Theory
                        </label>
                      )}
                      {subjects.find((s) => s.name === assign.subject)?.lab > 0 && (
                        <label className={`flex items-center gap-1.5 ${isSlotTakenByOther(assign.subject, assign.section, "lab", facultyIdx, assignIdx) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={assign.teachesLab}
                            disabled={isSlotTakenByOther(assign.subject, assign.section, "lab", facultyIdx, assignIdx)}
                            onChange={(e) => {
                              const newFaculty = [...faculty];
                              newFaculty[facultyIdx].assignments[assignIdx].teachesLab = e.target.checked;
                              setFaculty(newFaculty);
                            }}
                          />
                          Lab
                        </label>
                      )}
                    </div>
                  )}
                </div>
              ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  const newFaculty = [...faculty];
                  newFaculty[facultyIdx].assignments.push({ subject: "", section: "", teachesTheory: false, teachesLab: false });
                  setFaculty(newFaculty);
                }}
                className="ml-4 mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canTakeNewAssignment}
              >
                <Plus size={14} /> Add Assignment
              </button>
            </div>
          );
        })}
        </div>
        <div className="mt-4">
          <button type="button" onClick={addFaculty} disabled={allSlotsAssigned} className={buttonClasses}>
            <Plus size={16} /> Add Faculty
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end gap-4 items-center border-t border-slate-200 pt-6">
          <Button type="button" variant="outline" onClick={handleClearForm} title="Clear all fields and start over">
            Clear Form
          </Button>
          <Button type="submit" disabled={isLoading} size="lg">
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Generating...</span>
              </>
            ) : (
              'Generate Timetable'
            )}
          </Button>
      </div>
      </form>

      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to clear the form?</DialogTitle>
            <DialogDescription>
              All your input will be permanently removed. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmClearForm}>Clear Form</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
