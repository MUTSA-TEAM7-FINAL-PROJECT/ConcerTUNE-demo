package com.team7.ConcerTUNE.dto;

import com.team7.ConcerTUNE.entity.Artist;
import lombok.*;

import java.util.Set;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArtistDetailDto {
    private Long artistId;
    private String artistName;
    private String snsUrl;
    private String artistImageUrl;
    private boolean isDomestic;
    private Set<GenreDto> genres;
    private long followerCount;

    public static ArtistDetailDto fromEntity(Artist artist, long followerCount) {
        Set<GenreDto> genreDto = artist.getArtistGenres().stream()
                .map(artistGenre -> GenreDto.fromEntity(artistGenre.getGenre()))
                .collect(Collectors.toSet());

        return ArtistDetailDto.builder()
                .artistId(artist.getArtistId())
                .artistName(artist.getArtistName())
                .snsUrl(artist.getSnsUrl())
                .artistImageUrl(artist.getArtistImageUrl())
                .isDomestic(artist.isDomestic())
                .genres(genreDto)
                .followerCount(followerCount)
                .build();
    }
}
