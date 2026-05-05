import React from "react";

export default function TimetableView({ schedule }) {
  // The `schedule` prop now holds the entire API response.
  if (!schedule || !schedule.schedules) return null;

  // Get the list of section names to iterate over.
  const sectionNames = schedule.sections || Object.keys(schedule.schedules);

  // --- Dashboard Calculations ---
  const totalSubjects = schedule.subjects?.length || 0;
  const totalFaculty = schedule.faculty?.length || 0;

  let totalTheoryClasses = 0;
  let totalLabClasses = 0;
  const usedTheoryRooms = new Set();
  const usedLabRooms = new Set();

  sectionNames.forEach(sectionName => {
    const sectionSchedule = schedule.schedules[sectionName];
    if (sectionSchedule && sectionSchedule.days) {
      sectionSchedule.days.forEach(day => {
        day.periods.forEach(p => {
          if (p && !p.break) {
            if (p.room) {
              if (p.isLab) {
                usedLabRooms.add(p.room);
              } else {
                usedTheoryRooms.add(p.room);
              }
            }
            if (!p.isLab) {
              totalTheoryClasses++;
            } else if (p.note === 'lab start') {
              totalLabClasses++;
            }
          }
        });
      });
    }
  });

  const totalTheoryRoomsUsed = usedTheoryRooms.size;
  const totalLabRoomsUsed = usedLabRooms.size;

  return (
    <div className="space-y-12">
      {sectionNames.map((sectionName) => {
        const sectionSchedule = schedule.schedules[sectionName];
        if (!sectionSchedule || !sectionSchedule.days) {
          return (
            <div key={sectionName} className="p-4 border border-dashed border-red-300 bg-red-50 rounded-lg">
              <h3>Timetable for Section {sectionName}</h3>
              <p>No schedule data available for this section.</p>
            </div>
          );
        }

        const subjectCodeMap = new Map(schedule.subjects.map(s => [s.name, s.code]));

        // Get a unique list of faculty teaching in this section for the legend
        const facultyInThisSection = new Map();
        const roomsInThisSection = { theory: new Set(), lab: new Set() };
        sectionSchedule.days.forEach(day => {
          day.periods.forEach(p => {
            if (p && p.faculty && p.faculty.abbr) {
              if (!facultyInThisSection.has(p.faculty.abbr)) {
                facultyInThisSection.set(p.faculty.abbr, p.faculty.name);
              }
            }
            if (p && p.room) {
              if (p.isLab) {
                roomsInThisSection.lab.add(p.room);
              } else {
                roomsInThisSection.theory.add(p.room);
              }
            }
          });
        });
        const facultyListForLegend = Array.from(facultyInThisSection, ([abbr, name]) => ({ abbr, name }))
          .sort((a, b) => a.name.localeCompare(b.name));
        const theoryRoomsForLegend = Array.from(roomsInThisSection.theory).sort();
        const labRoomsForLegend = Array.from(roomsInThisSection.lab).sort();

        const periodsCount = sectionSchedule.days[0]?.periods.length || 0;
        const periodHeaders = Array.from({ length: periodsCount }, (_, i) => i + 1);

        return (
          <div key={sectionName} className="border-t-4 border-blue-600 pt-4">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Timetable for Section {sectionName}</h3>
            <table className="w-full border-collapse table-fixed text-sm shadow-md rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="border border-slate-200 p-2 font-semibold w-[100px]">Day</th>
                  {periodHeaders.map((pNum) => (
                    <th key={pNum} className="border border-slate-200 p-2 font-semibold">
                      P{pNum}
                      {pNum === schedule.breakPeriod && <span className="block text-xs font-normal text-slate-500">(Break)</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {sectionSchedule.days.map((day, di) => (
                  <tr key={di}>
                    <td className="border border-slate-200 p-2 font-bold text-center bg-slate-50">
                      {day.day}
                    </td>
                    {day.periods.map((p, pi) => {
                      if (p?.note === 'lab cont.') {
                        // This period is covered by the previous "lab start" cell with colSpan=2.
                        return null;
                      }

                      const isLabStart = p?.note === 'lab start';
                      const colSpan = isLabStart ? 2 : 1;

                      return (
                        <td key={pi} colSpan={colSpan} className={`border border-slate-200 p-2 text-center align-top min-h-[70px] ${isLabStart ? 'bg-blue-50' : ''} ${p?.break ? 'bg-slate-100 font-medium text-slate-500' : ''}`}>
                          {p?.break ? (
                            "Break"
                          ) : p ? (
                            <>
                              <div className="font-bold text-sm">{subjectCodeMap.get(p.subject) || p.subject}</div>
                              <div className="text-xs text-slate-500 mt-1">
                                {p.room || "-"} ({p.isLab ? "Lab" : "Theory"})
                              </div>
                              <div className="text-xs text-slate-600 mt-0.5">{p.faculty?.abbr || ""}</div>
                            </>
                          ) : (
                            "-"
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-8 border-t border-slate-200 pt-6">
              <h4 className="text-lg font-semibold text-slate-700 mb-4">Legend for Section {sectionName}</h4>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h5 className="text-md font-semibold text-slate-600 mb-2">Subjects</h5>
                  <table className="w-full text-sm border border-slate-200 rounded-md">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-2 text-left font-medium border-b border-slate-200">Code</th>
                        <th className="p-2 text-left font-medium border-b border-slate-200">Full Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.subjects.slice().sort((a, b) => a.name.localeCompare(b.name)).map(subject => (
                        <tr key={subject.code} className="border-t border-slate-100">
                          <td className="p-2">{subject.code}</td>
                          <td className="p-2">{subject.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <h5 className="text-md font-semibold text-slate-600 mb-2">Faculty in this Section</h5>
                  <table className="w-full text-sm border border-slate-200 rounded-md">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-2 text-left font-medium border-b border-slate-200">Abbreviation</th>
                        <th className="p-2 text-left font-medium border-b border-slate-200">Full Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facultyListForLegend.map(fac => (
                        <tr key={fac.abbr} className="border-t border-slate-100">
                          <td className="p-2">{fac.abbr}</td>
                          <td className="p-2">{fac.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-6 grid md:grid-cols-2 gap-8">
                <div>
                  <h5 className="text-md font-semibold text-slate-600 mb-2">Classrooms Used</h5>
                  <ul className="m-0 pl-5 text-sm list-disc space-y-1">
                    {theoryRoomsForLegend.length > 0 ? (
                      theoryRoomsForLegend.map(room => <li key={room}>{room}</li>)
                    ) : (
                      <li className="list-none text-slate-500">None</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h5 className="text-md font-semibold text-slate-600 mb-2">Labs Used</h5>
                  <ul className="m-0 pl-5 text-sm list-disc space-y-1">
                    {labRoomsForLegend.length > 0 ? (
                      labRoomsForLegend.map(room => <li key={room}>{room}</li>)
                    ) : (
                      <li className="list-none text-slate-500">None</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div className="border-t-4 border-blue-600 pt-4">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Dashboard</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="border border-slate-200 p-4 rounded-lg text-center bg-slate-50/50">
            <h3 className="m-0 text-blue-600 text-3xl font-bold">{totalTheoryClasses}</h3>
            <p className="mt-1 text-slate-600 text-sm">Total Theory Classes</p>
          </div>
          <div className="border border-slate-200 p-4 rounded-lg text-center bg-slate-50/50">
            <h3 className="m-0 text-blue-600 text-3xl font-bold">{totalLabClasses}</h3>
            <p className="mt-1 text-slate-600 text-sm">Total Lab Classes</p>
          </div>
          <div className="border border-slate-200 p-4 rounded-lg text-center bg-slate-50/50">
            <h3 className="m-0 text-blue-600 text-3xl font-bold">{totalSubjects}</h3>
            <p className="mt-1 text-slate-600 text-sm">Total Subjects</p>
          </div>
          <div className="border border-slate-200 p-4 rounded-lg text-center bg-slate-50/50">
            <h3 className="m-0 text-blue-600 text-3xl font-bold">{totalFaculty}</h3>
            <p className="mt-1 text-slate-600 text-sm">Total Faculty</p>
          </div>
          <div className="border border-slate-200 p-4 rounded-lg text-center bg-slate-50/50">
            <h3 className="m-0 text-blue-600 text-3xl font-bold">{totalTheoryRoomsUsed}</h3>
            <p className="mt-1 text-slate-600 text-sm">Classrooms Used</p>
          </div>
          <div className="border border-slate-200 p-4 rounded-lg text-center bg-slate-50/50">
            <h3 className="m-0 text-blue-600 text-3xl font-bold">{totalLabRoomsUsed}</h3>
            <p className="mt-1 text-slate-600 text-sm">Labs Used</p>
          </div>
        </div>
      </div>
    </div>
  );
}
