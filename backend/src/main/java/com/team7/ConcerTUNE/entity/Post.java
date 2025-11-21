package com.team7.ConcerTUNE.entity;

import com.team7.ConcerTUNE.util.StringListConverter;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "posts")
public class Post extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Long id;

    @Column(name = "post_title", length = 200)
    private String title;

    @Column(name = "post_content", length = 65536)
    private String content;

    @Column(name = "comment_count")
    private Integer commentCount = 0;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @Column(name = "post_like_count")
    private Integer likeCount = 0;

    @Convert(converter = StringListConverter.class)
    @Column(name = "image_urls", columnDefinition = "TEXT")
    private List<String> imageUrls = new ArrayList<>();

    @Convert(converter = StringListConverter.class)
    @Column(name = "file_urls", columnDefinition = "TEXT")
    private List<String> fileUrls = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_writer_id", nullable = false)
    private User writer;

    @Enumerated(EnumType.STRING)
    @Column(name = "category_id", length = 48, nullable = false)
    private CommunityCategoryType category;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostLike> likes = new ArrayList<>();

}