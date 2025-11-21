package com.team7.ConcerTUNE.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "live_artists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiveArtist {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "live_artist_id")
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "live_id", nullable = false)
  private Live live;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "artist_id", nullable = false)
  private Artist artist;
}