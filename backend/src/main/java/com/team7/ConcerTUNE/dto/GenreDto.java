package com.team7.ConcerTUNE.dto;

import com.team7.ConcerTUNE.entity.Genre;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenreDto {
    private Long genreId;
    private String genreName;

    public static GenreDto fromEntity(Genre genre) {
        return new GenreDto(genre.getGenreId(), genre.getGenreName());
    }
}