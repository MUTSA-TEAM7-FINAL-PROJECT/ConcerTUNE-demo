package com.team7.ConcerTUNE.repository;

import com.team7.ConcerTUNE.entity.AuthRole;
import com.team7.ConcerTUNE.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    List<User> findAllByAuth(AuthRole auth);
}
