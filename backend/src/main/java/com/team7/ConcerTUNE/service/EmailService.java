package com.team7.ConcerTUNE.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username")
    private String fromEmail;

    public void sendVerificationEmail(String toEmail, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("[PliPlease] 이메일 인증 코드를 확인해주세요.");
        message.setText("안녕하세요! \n\n 이메일 인증 코드: " + token + "\n\n 3분 이내에 코드를 입력하여 인증을 완료해 주세요.");

        try {
            mailSender.send(message);
            log.info("인증 이메일 발송: {}에게, 코드: {}", toEmail, token);
        } catch (Exception e) {
            log.error("인증 이메일 발송 실패: {}", e.getMessage());
            throw new RuntimeException("이메일 발송에 실패했습니다.", e);
        }
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = "http://localhost:5173/password-reset?token=" + token;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("[PliPlease] 비밀번호 재설정 요청");
        message.setText("안녕하세요! \n\n 비밀번호 재설정을 위해 아래 링크를 클릭해주세요.\n" + resetUrl + "\n\n 이 링크는 10분 동안 유효합니다.");

        try {
            mailSender.send(message);
            log.info("비밀번호 재설정 이메일 발송 성공: {}에게, 토큰: {}", toEmail, token);
        } catch (Exception e) {
            log.error("비밀번호 재설정 이메일 발송 실패: {}", e.getMessage());
            throw new RuntimeException("이메일 발송에 실패했습니다.", e);
        }
    }
}
