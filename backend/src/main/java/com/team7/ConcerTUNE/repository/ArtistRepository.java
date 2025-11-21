package com.team7.ConcerTUNE.repository;

import com.team7.ConcerTUNE.entity.Artist;
import com.team7.ConcerTUNE.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ArtistRepository extends JpaRepository<Artist, Long> {
    Page<Artist> findByArtistNameContainingIgnoreCase(String name, Pageable pageable);

    Optional<Artist> findByManager(User manager);
}
