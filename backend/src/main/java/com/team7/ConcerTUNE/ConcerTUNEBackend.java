package com.team7.ConcerTUNE;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class ConcerTUNEBackend {

	public static void main(String[] args) {
		SpringApplication.run(ConcerTUNEBackend.class, args);
	}

}
