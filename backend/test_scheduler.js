import axios from 'axios';

const payload = {
  sectionsCount: 2,
  theoryRooms: ['Room101', 'Room102'],
  labRooms: ['Lab1'],
  theoryRoomAssignments: [
    { subjectName: 'Data Structures and Algorithm', sectionName: 'A', roomName: 'Room101' },
    { subjectName: 'Data Structures and Algorithm', sectionName: 'B', roomName: 'Room102' },
    { subjectName: 'Database Management System', sectionName: 'A', roomName: 'Room101' },
    { subjectName: 'Database Management System', sectionName: 'B', roomName: 'Room102' },
    { subjectName: 'Discrete Mathematics', sectionName: 'A', roomName: 'Room101' },
    { subjectName: 'Discrete Mathematics', sectionName: 'B', roomName: 'Room102' },
    { subjectName: 'Object Oriented Programming', sectionName: 'A', roomName: 'Room101' },
    { subjectName: 'Object Oriented Programming', sectionName: 'B', roomName: 'Room102' },
    { subjectName: 'Computer Networking', sectionName: 'A', roomName: 'Room101' },
    { subjectName: 'Computer Networking', sectionName: 'B', roomName: 'Room102' }
  ],
  labRoomAssignments: [
    { subjectName: 'Data Structures and Algorithm Lab', sectionName: 'A', roomName: 'Lab1' },
    { subjectName: 'Data Structures and Algorithm Lab', sectionName: 'B', roomName: 'Lab1' },
    { subjectName: 'Database Management System Lab', sectionName: 'A', roomName: 'Lab1' },
    { subjectName: 'Database Management System Lab', sectionName: 'B', roomName: 'Lab1' },
    { subjectName: 'Object Oriented Programming Lab', sectionName: 'A', roomName: 'Lab1' },
    { subjectName: 'Object Oriented Programming Lab', sectionName: 'B', roomName: 'Lab1' },
    { subjectName: 'Computer Networking Lab', sectionName: 'A', roomName: 'Lab1' },
    { subjectName: 'Computer Networking Lab', sectionName: 'B', roomName: 'Lab1' },
    { subjectName: 'MATLAB', sectionName: 'A', roomName: 'Lab1' },
    { subjectName: 'MATLAB', sectionName: 'B', roomName: 'Lab1' }
  ],
  subjects: [
    { name: 'Data Structures and Algorithm', code: '1001', credit: 2, lab: 0 },
    { name: 'Data Structures and Algorithm Lab', code: '1091', credit: 0, lab: 1 },
    { name: 'Database Management System', code: '1002', credit: 2, lab: 0 },
    { name: 'Database Management System Lab', code: '1092', credit: 0, lab: 1 },
    { name: 'Discrete Mathematics', code: '1003', credit: 3, lab: 0 },
    { name: 'Object Oriented Programming', code: '1004', credit: 2, lab: 0 },
    { name: 'Object Oriented Programming Lab', code: '1094', credit: 0, lab: 1 },
    { name: 'Computer Networking', code: '1005', credit: 2, lab: 0 },
    { name: 'Computer Networking Lab', code: '1095', credit: 0, lab: 1 },
    { name: 'MATLAB', code: '1096', credit: 0, lab: 1 }
  ],
  faculty: [
    {
      name: 'Faculty 1',
      abbr: 'F1',
      assignments: [
        { subjectName: 'Data Structures and Algorithm', sections: ['A', 'B'], teachesTheory: true, teachesLab: false },
        { subjectName: 'Data Structures and Algorithm Lab', sections: ['A', 'B'], teachesTheory: false, teachesLab: true },
        { subjectName: 'Database Management System', sections: ['A', 'B'], teachesTheory: true, teachesLab: false },
        { subjectName: 'Database Management System Lab', sections: ['A', 'B'], teachesTheory: false, teachesLab: true }
      ]
    },
    {
      name: 'Faculty 2',
      abbr: 'F2',
      assignments: [
        { subjectName: 'Discrete Mathematics', sections: ['A', 'B'], teachesTheory: true, teachesLab: false },
        { subjectName: 'Object Oriented Programming', sections: ['A', 'B'], teachesTheory: true, teachesLab: false },
        { subjectName: 'Object Oriented Programming Lab', sections: ['A', 'B'], teachesTheory: false, teachesLab: true }
      ]
    },
    {
      name: 'Faculty 3',
      abbr: 'F3',
      assignments: [
        { subjectName: 'Computer Networking', sections: ['A', 'B'], teachesTheory: true, teachesLab: false },
        { subjectName: 'Computer Networking Lab', sections: ['A', 'B'], teachesTheory: false, teachesLab: true },
        { subjectName: 'MATLAB', sections: ['A', 'B'], teachesTheory: false, teachesLab: true }
      ]
    }
  ],
  periodsPerDay: 8,
  breakPeriod: 4,
  workingDays: 5
};

const run = async () => {
  try {
    console.log("Sending request to python scheduler...");
    const res = await axios.post('http://127.0.0.1:8001/schedule', payload);
    console.log("Success! Schedules keys:", Object.keys(res.data.schedules));
  } catch (err) {
    if (err.response) {
      console.log("Error status:", err.response.status);
      console.log("Error body:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
  }
};

run();
