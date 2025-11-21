package com.team7.ConcerTUNE.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_genre_preference")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserGenrePreference {

    @EmbeddedId
    private UserGenrePreferenceId id = new UserGenrePreferenceId();

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @MapsId("genreId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "genre_id", insertable = false, updatable = false)
    private Genre genre;

    @Builder
    public UserGenrePreference(User user, Genre genre) {
        this.user = user;
        this.genre = genre;
        this.id = new UserGenrePreferenceId(user.getId(), genre.getGenreId());
    }
}