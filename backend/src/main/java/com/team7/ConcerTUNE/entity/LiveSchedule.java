package com.team7.ConcerTUNE.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "live_schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiveSchedule {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "live_schedule_id")
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "live_id", nullable = false)
  private Live live;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "schedule_id", nullable = false)
  private Schedule schedule;
}