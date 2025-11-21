package com.team7.ConcerTUNE.repository;

import com.team7.ConcerTUNE.entity.Live;
import com.team7.ConcerTUNE.entity.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LiveRepository extends JpaRepository<Live, Long> {
    Page<Live> findAllByRequestStatus(RequestStatus status, Pageable pageable);
}
