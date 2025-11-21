package com.team7.ConcerTUNE.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequest {
    @NotBlank(message = "아이디 또는 이메일은 필수입니다")
    private String loginId;

    @NotBlank(message = "비밀번호는 필수입니다")
    private String password;
}
