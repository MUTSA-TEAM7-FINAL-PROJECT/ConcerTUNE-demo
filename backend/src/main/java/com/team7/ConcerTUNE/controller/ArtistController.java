package com.team7.ConcerTUNE.controller;

import com.team7.ConcerTUNE.dto.ArtistDetailDto;
import com.team7.ConcerTUNE.dto.ArtistSummaryDto;
import com.team7.ConcerTUNE.service.ArtistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/artists")
@RequiredArgsConstructor
public class ArtistController {
    private final ArtistService artistService;

    // 아티스트 목록 조회
    @GetMapping
    public ResponseEntity<Page<ArtistSummaryDto>> getArtistList(
            @RequestParam(required = false) String name,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<ArtistSummaryDto> artistPage = artistService.getArtistList(name, pageable);
        return ResponseEntity.ok(artistPage);
    }

    // 아티스트 상세 정보 조회
    @GetMapping("/{artistId}")
    public ResponseEntity<ArtistDetailDto> getArtistDetails(@PathVariable Long artistId) {
        ArtistDetailDto artistDto = artistService.getArtistById(artistId);
        return ResponseEntity.ok(artistDto);
    }

    // 아티스트 팔로우 - 회원만 가능
    @PostMapping("/{artistId}/follow")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> followArtist(
            @PathVariable Long artistId,
            Authentication authentication
    ) {
        artistService.followArtist(artistId, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // 아티스트 언팔로우 - 회원만 가능
    @DeleteMapping("/{artistId}/follow")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> unfollowArtist(
            @PathVariable Long artistId,
            Authentication authentication
    ) {
        artistService.unfollowArtist(artistId, authentication);
        return ResponseEntity.noContent().build();
    }

    /* 아티스트 권한 유저의 공연 등록 요청
    @PostMapping("/requests")
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<Void> requestLiveConcert(
            @Valid @RequestBody LiveRequestDto requestDto,
            Authentication authentication
            ) {
        artistService.requestLiveConcert(requestDto, authentication);
        return ResponseEntity.accepted().build();
    } */
}
