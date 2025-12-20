import React, { useState } from 'react';
import { BookOpen, Hash, Users, ChevronRight } from 'lucide-react';

export default function ClassManager() {
  // Mock Data
  const [classes] = useState([
    {
      id: 'CS101',
      name: 'Lập Trình Cơ Bản',
      members: 45,
      groups: [
        { id: 1, name: 'Nhóm 1', students: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'] },
        { id: 2, name: 'Nhóm 2', students: ['Phạm Thị D', 'Hoàng Văn E', 'Đỗ Thị F'] },
        { id: 3, name: 'Nhóm 3', students: ['Vũ Văn G', 'Bùi Thị H', 'Đặng Văn I'] }
      ]
    },
    {
      id: 'CS202',
      name: 'Cấu Trúc Dữ Liệu',
      members: 38,
      groups: [
        { id: 1, name: 'Nhóm 1', students: ['Ngô Văn J', 'Lý Thị K', 'Trương Văn L'] },
        { id: 2, name: 'Nhóm 2', students: ['Phan Thị M', 'Dương Văn N', 'Võ Thị O'] }
      ]
    },
    {
      id: 'CS303',
      name: 'Cơ Sở Dữ Liệu',
      members: 52,
      groups: [
        { id: 1, name: 'Nhóm 1', students: ['Hồ Văn P', 'Mai Thị Q', 'Tô Văn R'] },
        { id: 2, name: 'Nhóm 2', students: ['Chu Thị S', 'Đinh Văn T', 'Lâm Thị U'] },
        { id: 3, name: 'Nhóm 3', students: ['Cao Văn V', 'Đào Thị W', 'Tạ Văn X'] },
        { id: 4, name: 'Nhóm 4', students: ['La Thị Y', 'Mạc Văn Z', 'Ông Thị AA'] }
      ]
    }
  ]);

  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 font-sans p-8">
      {/* Header */}
       <div className="max-w-6xl mx-auto mb-8">
        <h2 className="text-3xl font-extrabold text-blue-900 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Lớp Học Phụ Trách
        </h2>
        <p className="text-gray-500 mt-2">Danh sách các lớp học phần và nhóm thực hành bạn đang hướng dẫn.</p>
       </div>

      {/* List */}
      <div className="max-w-6xl mx-auto space-y-4">
        {classes.map((classItem) => (
          <div
            key={classItem.id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
          >
            {/* Class Header */}
            <div
              className="p-6 cursor-pointer hover:bg-blue-50/50 transition-colors"
              onClick={() => setExpandedClass(expandedClass === classItem.id ? null : classItem.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-5 flex-1">
                  {/* Icon Box */}
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-blue-200 shadow-md">
                    <span className="text-white font-bold text-lg">{classItem.id.substring(0, 2)}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-gray-900">{classItem.name}</h3>
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-bold font-mono border border-blue-200 flex items-center">
                        <Hash className="w-3 h-3 mr-1" />
                        {classItem.id}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm font-medium">
                      <Users className="w-4 h-4 mr-1.5" />
                      <span>{classItem.members} sinh viên</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span>{classItem.groups.length} nhóm thực hành</span>
                    </div>
                  </div>
                </div>

                <ChevronRight
                  className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${
                    expandedClass === classItem.id ? 'rotate-90 text-blue-600' : ''
                  }`}
                />
              </div>
            </div>

            {/* Expanded Groups (Accordion) */}
            {expandedClass === classItem.id && (
              <div className="px-6 pb-6 pt-2 bg-gray-50/80 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">
                  Danh Sách Nhóm ({classItem.groups.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classItem.groups.map((group) => (
                    <div
                      key={group.id}
                      className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{group.name}</h5>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium group-hover:bg-blue-100 group-hover:text-blue-700">
                          {group.students.length} SV
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {group.students.map((student, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2 text-xs font-bold text-gray-500">
                              {student.charAt(0)}
                            </div>
                            {student}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}