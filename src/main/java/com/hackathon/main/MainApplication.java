package com.hackathon.main;

import com.hackathon.main.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class MainApplication {

	public static void main(String[] args) {
		SpringApplication.run(MainApplication.class, args);
	}
	@Bean
	public CommandLineRunner createAdminUser(UserService userService) {
		return args -> {
			userService.createAdminUserIfNotExist();
		};
	}

}
