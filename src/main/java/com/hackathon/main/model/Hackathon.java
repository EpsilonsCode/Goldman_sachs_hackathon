package com.hackathon.main.model;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "hackathons")
@Getter
@Setter

public class Hackathon {
    @Id
    private String id;
    @NotNull
    private String name;
    private String description;
    private String date;

    private List<String> tasks = new ArrayList<>();
    private List<String> users = new ArrayList<>();

}
