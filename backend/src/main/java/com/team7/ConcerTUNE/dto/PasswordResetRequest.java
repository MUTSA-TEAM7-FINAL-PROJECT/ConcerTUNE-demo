package com.team7.ConcerTUNE.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PasswordResetRequest {
    @NotBlank(message = "재설정 토큰은 필수입니다")
    private String token;

    @NotBlank(message = "새 비밀번호는 필수입니다")
    @Size(min = 10, message = "비밀번호는 최소 10자리 이상이어야 합니다")
    private String newPassword;
}
