package com.team7.ConcerTUNE.entity;

import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@NoArgsConstructor
@Getter
@EqualsAndHashCode
public class CommentLikeId implements Serializable {
    private Long userId;
    private Long commentId;

    public CommentLikeId(Long userId, Long commentId) {
        this.userId = userId;
        this.commentId = commentId;
    }
}