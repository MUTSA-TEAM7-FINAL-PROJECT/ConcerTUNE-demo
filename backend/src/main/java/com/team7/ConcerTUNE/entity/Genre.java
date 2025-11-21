package com.team7.ConcerTUNE.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "genres",
        uniqueConstraints = @UniqueConstraint(name = "uq_genre_name", columnNames = "genre_name"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Genre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "genre_id")
    private Long genreId;

    @Column(name = "genre_name", length = 100, nullable = false)
    private String genreName;

    @OneToMany(mappedBy = "genre", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ArtistGenre> artistGenres = new HashSet<>();
}
