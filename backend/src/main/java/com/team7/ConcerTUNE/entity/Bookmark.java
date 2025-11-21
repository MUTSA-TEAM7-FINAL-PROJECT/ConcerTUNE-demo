package com.team7.ConcerTUNE.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bookmarks")
@Getter
@Setter
@NoArgsConstructor
public class Bookmark {

  @EmbeddedId
  private BookmarkId bookmarkId = new BookmarkId();

  @MapsId("liveId")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "live_id", foreignKey = @ForeignKey(name = "fk_bm_live"))
  private Live live;

  @MapsId("userId")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_bm_user"))
  private User user;

  @Builder
  public Bookmark(User user, Live live) {
    this.user = user;
    this.live = live;
    this.bookmarkId = new BookmarkId(user.getId(), live.getId());
  }
}