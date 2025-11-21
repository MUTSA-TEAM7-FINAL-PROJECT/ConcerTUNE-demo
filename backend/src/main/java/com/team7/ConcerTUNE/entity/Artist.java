package com.team7.ConcerTUNE.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "artists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Artist extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "artist_id")
    private Long artistId;

    @Column(name = "artist_name", length = 200, nullable = false)
    private String artistName;

    @Column(name = "is_domestic", nullable = false)
    private boolean isDomestic;

    @Column(name = "sns_url", length = 200)
    private String snsUrl;

    @Column(name = "artist_image_url", columnDefinition = "TEXT")
    private String artistImageUrl;

    @OneToMany(mappedBy = "artist", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ArtistGenre> artistGenres = new HashSet<>();

    // 아티스트 페이지를 관리하는 유저 계정
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_user_id", referencedColumnName = "user_id",
    nullable = true, unique = true, foreignKey = @ForeignKey(name = "fk_artist_manager_user"))
    private User manager;

    // 편의 메서드
    public void addGenre(Genre genre) {
        ArtistGenre ag = new ArtistGenre(this, genre);
        artistGenres.add(ag);
        genre.getArtistGenres().add(ag);
    }
    public void removeGenre(Genre genre) {
        artistGenres.removeIf(ag -> ag.getGenre().equals(genre) && ag.getArtist().equals(this));
        genre.getArtistGenres().removeIf(ag -> ag.getGenre().equals(genre) && ag.getArtist().equals(this));
    }
}
