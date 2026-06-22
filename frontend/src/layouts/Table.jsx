import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function Table({ columns, data, onEdit, onDelete, onDuplicate }) {
  const tableData = Array.isArray(data) ? data : [];

  const columnKeyMap = {
    Name: 'name',
    Program: 'program',
    'Student Intake': 'studentIntake',
    'Number of Sections': 'numberOfSections',
    Year: 'year',
    Semester: 'semester',
    'Total Students': 'totalStudents',
    Stream: 'stream',
    'Class Duration': 'class duration',
    'Break Time': 'break time',
    'Class Days': 'class days',
    Code: 'code',
    Type: 'type',
    Credits: 'credits',
    'Classes/Week': 'classes per week',
  };

  return (
    <table className="w-full table-auto border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      <thead className="bg-slate-100 text-slate-700">
        <tr>
          {columns.map((col) => (
            <th key={col} className="px-4 py-3 text-left font-semibold">
              {col}
            </th>
          ))}
          <th className="px-4 py-3 font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white">
        {tableData.length === 0 ? (
          <tr className="text-left">
            <td
              colSpan={columns.length + 1}
              className="text-center px-5 py-8 text-blue-500 bg-slate-50"
            >
              No data available
            </td>
          </tr>
        ) : (
          tableData.map((row) => (
            <tr
              key={row._id || Math.random()}
              className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
            >
              {columns.map((col) => {
                const fieldKey = columnKeyMap[col] || col.toLowerCase();
                const value = row[fieldKey];
                const displayValue =
                  value && typeof value === 'object'
                    ? value.name || JSON.stringify(value)
                    : value ?? 'N/A';

                return (
                  <td key={col} className="px-5 py-4 text-slate-700">
                    {displayValue}
                  </td>
                );
              })}
              <td className="px-3 py-4 flex gap-2">
                {onDuplicate && (
                  <Button
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700 transition"
                    onClick={() => {
                      onDuplicate(row);
                    }}
                  >
                    Duplicate
                  </Button>
                )}

                <Button
                  size="sm"
                  className="bg-green-600 text-white hover:bg-green-700 transition"
                  onClick={() => {
                    onEdit(row);
                  }}
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  className="hover:bg-red-700 hover:scale-105 transition-all duration-200"
                  onClick={() => {
                    onDelete(row._id);
                  }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
