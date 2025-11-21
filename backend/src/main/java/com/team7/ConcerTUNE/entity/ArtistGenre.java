package com.team7.ConcerTUNE.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "artist_genres")
@Getter
@Setter
@NoArgsConstructor
public class ArtistGenre {

    @EmbeddedId
    private ArtistGenreId id = new ArtistGenreId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("artistId")
    @JoinColumn(name = "artist_id", foreignKey = @ForeignKey(name = "fk_ag_artist"))
    private Artist artist;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("genreId")
    @JoinColumn(name = "genre_id", foreignKey = @ForeignKey(name = "fk_ag_genre"))
    private Genre genre;

    public ArtistGenre(Artist artist, Genre genre) {
        this.artist = artist;
        this.genre = genre;
        this.id = new ArtistGenreId(artist.getArtistId(), genre.getGenreId());
    }
}
