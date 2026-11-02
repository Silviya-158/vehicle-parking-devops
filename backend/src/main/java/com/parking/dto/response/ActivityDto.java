package com.parking.dto.response;

import java.time.LocalDateTime;

public class ActivityDto {
    private String id;
    private String type; // ENTRY, EXIT, RESERVATION, SLOT_UPDATE
    private String title;
    private String description;
    private LocalDateTime timestamp;
    private String badgeColor; // emerald, rose, amber, blue

    public ActivityDto() {
    }

    public ActivityDto(String id, String type, String title, String description, LocalDateTime timestamp, String badgeColor) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.description = description;
        this.timestamp = timestamp;
        this.badgeColor = badgeColor;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getBadgeColor() {
        return badgeColor;
    }

    public void setBadgeColor(String badgeColor) {
        this.badgeColor = badgeColor;
    }
}
