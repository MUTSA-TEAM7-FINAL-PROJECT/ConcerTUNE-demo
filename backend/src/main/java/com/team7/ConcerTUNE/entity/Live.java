package com.team7.ConcerTUNE.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "lives")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Live extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "live_id")
  private Long id;

  @Column(length = 200, nullable = false)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(name = "poster_url", length = 200)
  private String posterUrl;

  @Column(name = "ticket_url", length = 200)
  private String ticketUrl;

  @Column(name = "ticket_date_time")
  private LocalDateTime ticketDateTime;

  @Column(length = 200)
  private String venue;

  @Column(name = "price", columnDefinition = "jsonb")
  @JdbcTypeCode(SqlTypes.JSON)
  private Map<String,Integer> price;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false,
          foreignKey = @ForeignKey(name = "fk_pr_user"))
  private User writer;

  @Builder.Default
  @OneToMany(mappedBy = "live", cascade = CascadeType.ALL,
          orphanRemoval = true)
  private List<LiveArtist> liveArtists = new ArrayList<>();

  @Builder.Default
  @OneToMany(mappedBy = "live", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<LiveSchedule> liveSchedules = new ArrayList<>();

  @Builder.Default
  @Enumerated(EnumType.STRING)
  @Column(name = "request_status", length = 20, nullable = false)
  private RequestStatus requestStatus = RequestStatus.PENDING;

  @OneToMany(mappedBy = "live", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Bookmark> bookmarks;

  @Column(name = "request_created_at", nullable = false)
  private LocalDateTime createdAt;

  @Column(name = "status_updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  public void prePersist() {
    if (createdAt == null) createdAt = LocalDateTime.now();
    if (updatedAt == null) updatedAt = createdAt;
  }

  public void changeStatus(RequestStatus newStatus) {
    this.requestStatus = newStatus;
    this.updatedAt = LocalDateTime.now();
  }
}