package com.team7.ConcerTUNE.controller;

import com.team7.ConcerTUNE.dto.LiveRequest;
import com.team7.ConcerTUNE.dto.LiveResponse;
import com.team7.ConcerTUNE.entity.Live;
import com.team7.ConcerTUNE.entity.User;
import com.team7.ConcerTUNE.security.SimpleUserDetails;
import com.team7.ConcerTUNE.service.LiveRequestService;
import com.team7.ConcerTUNE.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/liveRequest")
@RequiredArgsConstructor
public class LiveRequestController {
    private final UserService userservice;
    private final LiveRequestService liveRequestService;


    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LiveResponse> createRequest(
            @Valid @RequestBody LiveRequest request,
            @AuthenticationPrincipal SimpleUserDetails principal
    ) {
        User user = userservice.findEntityById(principal.getUserId());
        LiveResponse response = liveRequestService.createRequest(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<LiveResponse>> getAllRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<LiveResponse> liveRequests = liveRequestService.getAllRequests(pageable);
        return ResponseEntity.ok(liveRequests);
    }

    @GetMapping("/{liveRequestId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LiveResponse> getRequest(@PathVariable Long liveRequestId) {
        LiveResponse liveResponse = liveRequestService.getLiveRequest(liveRequestId);
        return ResponseEntity.ok(liveResponse);
    }

    @PatchMapping("/{liveRequestId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> approveRequest(@PathVariable Long liveRequestId) {
        liveRequestService.approveRequest(liveRequestId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{liveRequestId}/modify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LiveResponse> modifyLive(
            @PathVariable Long liveRequestId,
            @Valid @RequestBody LiveRequest request
    ) {
        LiveResponse liveResponse = liveRequestService.modifyLive(liveRequestId, request);
        return ResponseEntity.ok(liveResponse);
    }
}
