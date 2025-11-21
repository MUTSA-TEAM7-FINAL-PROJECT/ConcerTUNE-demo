package com.team7.ConcerTUNE.repository;

import com.team7.ConcerTUNE.entity.Live;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LiveRequestRepository extends JpaRepository<Live, Long> {
}
