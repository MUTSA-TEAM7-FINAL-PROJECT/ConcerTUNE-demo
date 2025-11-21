package com.team7.ConcerTUNE.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "comment_likes")
public class CommentLike extends BaseEntity {

    @EmbeddedId
    private CommentLikeId id = new CommentLikeId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("commentId")
    @JoinColumn(name = "comment_id")
    private Comment comment;

    @Builder
    public CommentLike(User user, Comment comment) {
        this.id = new CommentLikeId(user.getId(), comment.getId());
        this.user = user;
        this.comment = comment;
    }
}
