package com.hackathon.main.model;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class TaskFile {

    private String fileName;
    private String contentType;
    private String dataBase64;
}
