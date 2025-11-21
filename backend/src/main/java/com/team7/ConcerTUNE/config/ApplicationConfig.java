package com.team7.ConcerTUNE.config;

import com.team7.ConcerTUNE.repository.UserRepository;
import com.team7.ConcerTUNE.security.SimpleUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {
    private final UserRepository userRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return loginId -> {
            return userRepository.findByEmail(loginId)
                    .map(user -> new SimpleUserDetails(
                            user.getId(),
                            user.getUsername(),
                            user.getAuth().name(),
                            user.getPassword()
                    ))
                    .orElseThrow(() -> new UsernameNotFoundException(
                            "해당 이메일로 등록된 계정이 없습니다: " + loginId));
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
