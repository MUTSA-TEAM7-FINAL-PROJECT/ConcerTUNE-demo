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
public class PostLikeId implements Serializable {
    private Long userId;
    private Long postId;

    public PostLikeId(Long userId, Long postId) {
        this.userId = userId;
        this.postId = postId;
    }
}