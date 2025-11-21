package com.team7.ConcerTUNE.service;

import com.team7.ConcerTUNE.dto.LiveResponse;
import com.team7.ConcerTUNE.entity.Bookmark;
import com.team7.ConcerTUNE.entity.Live;
import com.team7.ConcerTUNE.entity.User;
import com.team7.ConcerTUNE.exception.ResourceNotFoundException;
import com.team7.ConcerTUNE.repository.BookmarkRepository;
import com.team7.ConcerTUNE.repository.LiveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final LiveRepository liveRepository;

    public boolean toggleBookmark(Long liveId, User user) {
        Live live = liveRepository.findById(liveId)
                .orElseThrow(() -> new ResourceNotFoundException("Live not found"));

        boolean alreadyBookmarked = bookmarkRepository.existsByUserAndLive(user, live);

        if (alreadyBookmarked) {
            bookmarkRepository.deleteByUserAndLive(user, live);
            return false;
        } else {
            Bookmark bookmark = Bookmark.builder()
                    .user(user)
                    .live(live)
                    .build();
            bookmarkRepository.save(bookmark);
            return true;
        }
    }

    @Transactional(readOnly = true)
    public boolean isBookmarked(Long liveId, User user) {
        Live live = liveRepository.findById(liveId)
                .orElseThrow(() -> new ResourceNotFoundException("Live not found"));

        return bookmarkRepository.existsByUserAndLive(user, live);
    }

    @Transactional(readOnly = true)
    public Page<LiveResponse> getBookmarkedLives(Pageable pageable, User user) {
        Page<Live> bookmarkedLives = bookmarkRepository.findBookmarkedLivesByUser(user, pageable);

        return bookmarkedLives.map(LiveResponse::fromEntity);
    }
}
