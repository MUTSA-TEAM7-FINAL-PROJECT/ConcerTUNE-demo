package com.team7.ConcerTUNE.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class UserGenrePreferenceId implements Serializable {
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "genre_id", length = 255)
    private Long genreId;
}