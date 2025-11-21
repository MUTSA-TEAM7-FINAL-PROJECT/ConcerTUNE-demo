package com.team7.ConcerTUNE.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_artist")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserArtist {

    @EmbeddedId
    private UserArtistId id = new UserArtistId();

    @MapsId("userId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @MapsId("artistId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id", insertable = false, updatable = false)
    private Artist artist;

    @Builder
    public UserArtist(User user, Artist artist) {
        this.user = user;
        this.artist = artist;
        this.id = new UserArtistId(user.getId(), artist.getArtistId());
    }
}