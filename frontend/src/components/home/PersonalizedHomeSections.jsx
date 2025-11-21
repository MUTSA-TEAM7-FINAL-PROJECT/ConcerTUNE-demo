import React from 'react';
import UpcomingConcerts from './UpcomingConcerts'; 
import BookmarkedCommunityFeed from './BookmarkedCommunityFeed'; 
import PersonalizedScheduleSection from './PersonalizedScheduleSection';
import { useAuth } from '../../context/AuthContext'; 

const PersonalizedHomeSections = () => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-12 mt-12">
      <PersonalizedScheduleSection userId={user?.id} />
      <UpcomingConcerts /> 
    </div>
  );
};

export default PersonalizedHomeSections;