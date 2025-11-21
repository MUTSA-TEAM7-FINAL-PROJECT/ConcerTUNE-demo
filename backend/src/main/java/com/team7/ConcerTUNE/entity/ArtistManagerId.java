package com.team7.ConcerTUNE.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Builder
public class ArtistManagerId implements Serializable {

    private Long userId;
    private Long artistId;

}