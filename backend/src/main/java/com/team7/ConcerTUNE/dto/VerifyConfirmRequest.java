package com.team7.ConcerTUNE.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

@Data
public class VerifyConfirmRequest {
    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "유효한 이메일을 입력해야 합니다")
    private String email;

    @NotBlank(message = "인증 코드는 필수입니다")
    @Length(min = 6, max = 12, message = "인증 코드 길이를 확인해 주세요")
    private String token;
}
