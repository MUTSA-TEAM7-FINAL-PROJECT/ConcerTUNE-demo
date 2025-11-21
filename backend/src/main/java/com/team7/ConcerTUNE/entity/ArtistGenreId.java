package com.team7.ConcerTUNE.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ArtistGenreId implements Serializable {

    @Column(name = "artist_id")
    private Long artistId;

    @Column(name = "genre_id")
    private Long genreId;
}
