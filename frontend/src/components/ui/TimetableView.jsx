import React, { useState } from "react";

// ─── Color palette for subjects ────────────────────────────────────────────────
const SUBJECT_COLORS = [
  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-600' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-600' },
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-800', badge: 'bg-violet-100 text-violet-600' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-600' },
  { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', badge: 'bg-rose-100 text-rose-600' },
  { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-800', badge: 'bg-cyan-100 text-cyan-600' },
];

const LAB_COLORS = [
  { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-900', badge: 'bg-indigo-200 text-indigo-700' },
  { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-900', badge: 'bg-teal-200 text-teal-700' },
  { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-900', badge: 'bg-purple-200 text-purple-700' },
  { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-900', badge: 'bg-orange-200 text-orange-700' },
  { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900', badge: 'bg-pink-200 text-pink-700' },
  { bg: 'bg-sky-100', border: 'border-sky-300', text: 'text-sky-900', badge: 'bg-sky-200 text-sky-700' },
];

export default function TimetableView({ schedule }) {
  const [activeSection, setActiveSection] = useState(null);

  if (!schedule || !schedule.schedules) return null;

  const sectionNames = schedule.sections || Object.keys(schedule.schedules);

  // Build subject → color map
  const subjectColorMap = {};
  (schedule.subjects || []).forEach((s, i) => {
    subjectColorMap[s.name] = {
      theory: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
      lab: LAB_COLORS[i % LAB_COLORS.length],
    };
  });

  const subjectCodeMap = new Map((schedule.subjects || []).map(s => [s.name, s.code]));

  // Dashboard stats
  let totalTheory = 0, totalLab = 0;
  const usedTheory = new Set(), usedLab = new Set();
  sectionNames.forEach(sn => {
    const sec = schedule.schedules[sn];
    if (!sec?.days) return;
    sec.days.forEach(day => {
      day.periods.forEach(p => {
        if (!p || p.break) return;
        if (p.isLab) { usedLab.add(p.room); if (p.note === 'lab start') totalLab++; }
        else { usedTheory.add(p.room); totalTheory++; }
      });
    });
  });

  const displaySections = activeSection ? [activeSection] : sectionNames;

  return (
    <div>
      {/* Section Tabs */}
      {sectionNames.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveSection(null)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition border-2 ${!activeSection
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
              : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
              }`}
          >
            All Sections
          </button>
          {sectionNames.map(sn => (
            <button
              key={sn}
              onClick={() => setActiveSection(activeSection === sn ? null : sn)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition border-2 ${activeSection === sn
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}
            >
              Section {sn}
            </button>
          ))}
        </div>
      )}

      {/* Dashboard */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
        {[
          { label: 'Theory Classes', value: totalTheory, color: 'text-indigo-600' },
          { label: 'Lab Sessions', value: totalLab, color: 'text-purple-600' },
          { label: 'Subjects', value: schedule.subjects?.length || 0, color: 'text-blue-600' },
          { label: 'Faculty', value: schedule.faculty?.length || 0, color: 'text-emerald-600' },
          { label: 'Theory Rooms', value: usedTheory.size, color: 'text-amber-600' },
          { label: 'Lab Rooms', value: usedLab.size, color: 'text-rose-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Section Timetables */}
      <div className="space-y-10">
        {displaySections.map(sectionName => {
          const sectionSchedule = schedule.schedules[sectionName];
          if (!sectionSchedule?.days) return (
            <div key={sectionName} className="p-4 border-2 border-dashed border-red-200 bg-red-50 rounded-xl text-red-600 text-sm">
              No schedule data for Section {sectionName}
            </div>
          );

          const periodsCount = sectionSchedule.days[0]?.periods.length || 0;
          const periodHeaders = Array.from({ length: periodsCount }, (_, i) => i + 1);

          // Faculty & room legend for this section
          const facultyMap = new Map();
          const theoryRoomsSet = new Set();
          const labRoomsSet = new Set();
          sectionSchedule.days.forEach(day => {
            day.periods.forEach(p => {
              if (!p || p.break) return;
              if (p.faculty?.abbr) facultyMap.set(p.faculty.abbr, p.faculty.name);
              if (p.room) {
                if (p.isLab) labRoomsSet.add(p.room);
                else theoryRoomsSet.add(p.room);
              }
            });
          });

          return (
            <div key={sectionName}>
              <div className="flex items-center gap-3 mb-4">
                <div className="px-3 h-8 min-w-[32px] w-fit bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {sectionName}
                </div>
                <h3 className="text-lg font-bold text-slate-800">Section {sectionName} Timetable</h3>
              </div>

              {/* Timetable Grid */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                <table className="w-full border-collapse text-xs min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      <th className="p-3 text-left font-semibold w-24 rounded-tl-xl">Day</th>
                      {periodHeaders.map(pNum => (
                        <th key={pNum} className={`p-3 text-center font-semibold ${pNum === schedule.breakPeriod ? 'bg-slate-600' : ''}`}>
                          P{pNum}
                          {pNum === schedule.breakPeriod && (
                            <span className="block text-xs font-normal text-slate-300">Break</span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sectionSchedule.days.map((day, di) => (
                      <tr key={di} className={di % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-3 font-bold text-slate-700 border-r border-slate-100 bg-slate-50 text-center">
                          <span className="text-xs uppercase tracking-wider">{day.day?.slice(0, 3)}</span>
                          <span className="hidden sm:block text-xs text-slate-400 font-normal">{day.day?.slice(3)}</span>
                        </td>
                        {day.periods.map((p, pi) => {
                          // Skip lab continuation cells (rendered by lab start with colSpan)
                          if (p?.note === 'lab cont.') return null;

                          const isLabStart = p?.note === 'lab start';
                          const colSpan = isLabStart ? 2 : 1;
                          const colors = p && !p.break
                            ? (p.isLab
                              ? subjectColorMap[p.subject]?.lab
                              : subjectColorMap[p.subject]?.theory)
                            : null;

                          return (
                            <td
                              key={pi}
                              colSpan={colSpan}
                              className={`border border-slate-100 p-1.5 align-top ${p?.break
                                ? 'bg-slate-100 text-center'
                                : ''
                                }`}
                            >
                              {p?.break ? (
                                <div className="text-slate-400 text-xs font-medium py-1">☕ Break</div>
                              ) : p ? (
                                <div className={`rounded-lg p-2 border ${colors?.bg || 'bg-white'} ${colors?.border || 'border-slate-200'} h-full min-h-[64px] flex flex-col justify-between`}>
                                  <div>
                                    <div className={`font-bold text-xs ${colors?.text || 'text-slate-800'} leading-tight`}>
                                      {subjectCodeMap.get(p.subject) || p.subject}
                                    </div>
                                    {isLabStart && (
                                      <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-1 ${colors?.badge || ''}`}>
                                        LAB ×2
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-1 space-y-0.5">
                                    <div className={`text-[10px] ${colors?.text || 'text-slate-500'} opacity-75`}>
                                      {p.room || '—'}
                                    </div>
                                    <div className={`text-[10px] font-semibold ${colors?.text || 'text-slate-600'}`}>
                                      {p.faculty?.abbr || ''}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-slate-200 text-center text-xs py-2">—</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="mt-5 grid md:grid-cols-3 gap-4">
                {/* Subjects */}
                <div className="bg-white border border-slate-100 rounded-xl p-4">
                  <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Subjects</h5>
                  <div className="grid grid-cols-1 gap-2">
                    {(schedule.subjects || []).map((subj, i) => {
                      const c = subjectColorMap[subj.name]?.theory || SUBJECT_COLORS[i % SUBJECT_COLORS.length];
                      return (
                        <div key={subj.code} className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-100 rounded-lg">
                          <span className={`text-[10px] font-bold font-mono ${c.text} min-w-[75px] flex-shrink-0 bg-white px-2 py-0.5 rounded border ${c.border} text-center`}>{subj.code}</span>
                          <span className="text-xs text-slate-700 font-medium truncate flex-1">{subj.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Faculty */}
                <div className="bg-white border border-slate-100 rounded-xl p-4">
                  <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Faculty</h5>
                  <div className="space-y-2">
                    {Array.from(facultyMap, ([abbr, name]) => ({ abbr, name }))
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(f => (
                        <div key={f.abbr} className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                            {f.abbr}
                          </div>
                          <span className="text-xs text-slate-700 truncate">{f.name}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Rooms */}
                <div className="bg-white border border-slate-100 rounded-xl p-4">
                  <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Rooms</h5>
                  {theoryRoomsSet.size > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1.5">Theory</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from(theoryRoomsSet).sort().map(r => (
                          <span key={r} className="px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-semibold rounded-md">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {labRoomsSet.size > 0 && (
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1.5">Labs</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from(labRoomsSet).sort().map(r => (
                          <span key={r} className="px-2 py-1 bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-semibold rounded-md">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}