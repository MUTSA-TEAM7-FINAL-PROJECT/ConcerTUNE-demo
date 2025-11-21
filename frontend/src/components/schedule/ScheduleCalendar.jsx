// ScheduleCalendar.jsx

import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import { Link } from 'react-router-dom';


function ScheduleCalendar({ schedules, isLoading, error }) {
    const validSchedules = Array.isArray(schedules) ? schedules : [];
    
    const [selectedDate, setSelectedDate] = useState(new Date()); 

    // 날짜를 커스텀 포맷팅하는 로직: "11월 20 (목)" 형태로 출력 (오른쪽 상세 목록 헤더용)
    const getCustomDateString = (date) => {
        const month = date.getMonth() + 1; // 0부터 시작하므로 +1
        const day = date.getDate();
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const dayName = days[date.getDay()];
        return `${month}월 ${day} (${dayName})`;
    };
    
    // 💡 달력 셀의 날짜를 숫자만 표시하도록 포맷하는 함수 (formatDay prop 사용)
    const formatDay = (locale, date) => {
        // Date 객체에서 날짜(숫자)만 추출하여 문자열로 반환합니다.
        return date.getDate().toString();
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const daySchedules = validSchedules.filter(schedule => { 
                const scheduleDate = new Date(schedule.liveDate);
                return scheduleDate.toDateString() === date.toDateString();
            });

            if (daySchedules.length > 0) {
                return (
                    <div className="schedule-indicator" style={{ textAlign: 'center', marginTop: '3px' }}>
                        {/* 스케줄 표시점 */}
                        <div style={{ 
                            height: '6px', 
                            width: '6px', 
                            backgroundColor: 'red', 
                            borderRadius: '50%',
                            margin: '3px auto'
                        }} />
                        {/* 스케줄 제목 간략 표시 */}
                        <small style={{ 
                            fontSize: '10px', 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                        }}>
                            {daySchedules[0].liveTitle}
                            {daySchedules.length > 1 ? ` 외 ${daySchedules.length - 1}개` : ''}
                        </small>
                    </div>
                );
            }
        }
    };
    
    const selectedDayDetails = validSchedules.filter(schedule => 
        new Date(schedule.liveDate).toDateString() === selectedDate.toDateString()
    ).sort((a, b) => (a.liveTime || '').localeCompare(b.liveTime || '')); 

    if (isLoading) return <div className="text-center py-10 text-gray-500">스케줄 로드 중...</div>;
    if (error) return <div className="text-center py-10 text-red-500">❌ {error}</div>;

    return (
        <div className="schedule-container p-4">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 달력 섹션 */}
                <div className="calendar-section bg-gray-50 p-4 rounded-lg shadow-md">
                    <Calendar 
                        onChange={setSelectedDate} 
                        value={selectedDate} 
                        tileContent={tileContent} 
                        className="w-full border-0"
                        // 💡 달력 셀에 숫자만 표시
                        formatDay={formatDay}
                    />
                </div>
                
                {/* 상세 목록 섹션 */}
                <div className="selected-day-details">
                    <h4 className="text-xl font-semibold mb-3">
                        {/* 💡 상세 목록 헤더에는 월, 일, 요일 모두 표시 */}
                        {getCustomDateString(selectedDate)}
                    </h4>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {selectedDayDetails.length > 0 ? (
                            <ul>
                                {selectedDayDetails.map((schedule, index) => (
                                    <li 
                                        key={schedule.liveId + (schedule.liveTime || index)} 
                                        className="p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition"
                                    >
                                        {/* Link to Live Detail */}
                                        <Link to={`/concerts/${schedule.liveId}`}>
                                            <strong className="text-indigo-600">{schedule.liveTime}</strong> - 
                                            <span className="ml-1 font-medium">{schedule.liveTitle}</span>
                                            <p className="text-xs text-gray-500 mt-1">장소: {schedule.venue}</p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-center py-5">
                                선택하신 날짜에는 예정된 스케줄이 없습니다.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ScheduleCalendar;