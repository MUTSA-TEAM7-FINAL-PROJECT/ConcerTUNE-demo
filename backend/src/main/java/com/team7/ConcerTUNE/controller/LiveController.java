package com.team7.ConcerTUNE.controller;

import com.team7.ConcerTUNE.dto.ArtistSummaryDto;
import com.team7.ConcerTUNE.dto.LiveResponse;
import com.team7.ConcerTUNE.dto.LiveSummaryResponse;
import com.team7.ConcerTUNE.entity.User;
import com.team7.ConcerTUNE.security.SimpleUserDetails;
import com.team7.ConcerTUNE.service.LiveService;
import com.team7.ConcerTUNE.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lives")
@RequiredArgsConstructor
public class LiveController {
    private final LiveService liveService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<Page<LiveSummaryResponse>> getAllLives(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal SimpleUserDetails principal
    ) {
        Pageable pageable = PageRequest.of(page, size);

        User user = null;
        if (principal != null) {
            user = userService.findEntityById(principal.getUserId());
        }

        Page<LiveSummaryResponse> lives = liveService.getAllLives(pageable, user);
        return ResponseEntity.ok(lives);
    }

    @GetMapping("/{liveId}")
    public ResponseEntity<LiveResponse> getLive(
            @PathVariable Long liveId,
            @AuthenticationPrincipal SimpleUserDetails principal
    ) {
        User user = null;
        if (principal != null) {
            user = userService.findEntityById(principal.getUserId());
        }
        LiveResponse live = liveService.getLive(liveId, user);
        return ResponseEntity.ok(live);
    }

    @GetMapping("/{liveId}/artists")
    public ResponseEntity<List<ArtistSummaryDto>> getArtists(@PathVariable Long liveId) {
        List<ArtistSummaryDto> artists = liveService.getArtists(liveId);;
        return ResponseEntity.ok(artists);
    }
}
