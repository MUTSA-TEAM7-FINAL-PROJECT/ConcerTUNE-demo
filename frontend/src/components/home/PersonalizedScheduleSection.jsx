import React, { useEffect, useState } from 'react';
import userService from '../../services/userService';
import ScheduleCalendar from '../schedule/ScheduleCalendar'; 

const PersonalizedScheduleSection = ({ userId }) => {
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            console.warn("PersonalizedScheduleSection: userId prop이 유효하지 않아 스케줄을 로드하지 않습니다.");
            setIsLoading(false);
            return;
        }

        const fetchSchedules = async () => {
            setIsLoading(true); 
            setError(null);    
            
            try {
                const data = await userService.getPersonalizedSchedules(userId); 
                
                setSchedules(Array.isArray(data) ? data : []); 
            } catch (err) {
                console.error("Failed to fetch personalized schedules:", err);
                setError(err.message || "스케줄 로드 중 알 수 없는 오류가 발생했습니다."); 
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchedules();
        
    }, [userId]); 

    if (error) {
        return (
            <section className="col-span-1 lg:col-span-3 p-6 bg-red-50 border border-red-200 rounded-xl">
                 <h2 className="text-2xl font-bold text-gray-800 mb-6">예정된 공연 스케줄</h2>
                 <p className="text-red-600 font-medium">오류 발생: {error}</p>
            </section>
        );
    }
    
    if (!userId) {
        return (
            <section className="col-span-1 lg:col-span-3 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
                 <h2 className="text-2xl font-bold text-gray-800 mb-6">예정된 공연 스케줄</h2>
                 <p className="text-yellow-700">로그인 정보가 유효하지 않아 스케줄을 로드할 수 없습니다.</p>
            </section>
        );
    }


    return (
        <section className="col-span-1 lg:col-span-3">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                예정된 공연 스케줄
            </h2>
            
            <ScheduleCalendar 
                schedules={schedules} 
                isLoading={isLoading} 
                error={error} 
            />
            
        </section>
    );
};

export default PersonalizedScheduleSection;