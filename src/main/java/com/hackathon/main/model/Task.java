package com.hackathon.main.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "tasks")
@Getter
@Setter

public class Task {
    @Id
    private String id;
    private String name;
    private String description;

    private List<TaskFile> files = new ArrayList<>();
    private TaskFile taskFile;
}
