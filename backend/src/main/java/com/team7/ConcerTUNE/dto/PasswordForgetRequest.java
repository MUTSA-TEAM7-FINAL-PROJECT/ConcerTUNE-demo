package com.team7.ConcerTUNE.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PasswordForgetRequest {
    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "유효한 이메일을 입력해야 합니다")
    private String email;
}
