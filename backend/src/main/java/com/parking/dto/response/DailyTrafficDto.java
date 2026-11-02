package com.parking.dto.response;

public class DailyTrafficDto {
    private String date;
    private String dayName;
    private long entries;
    private long exits;

    public DailyTrafficDto() {
    }

    public DailyTrafficDto(String date, String dayName, long entries, long exits) {
        this.date = date;
        this.dayName = dayName;
        this.entries = entries;
        this.exits = exits;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getDayName() {
        return dayName;
    }

    public void setDayName(String dayName) {
        this.dayName = dayName;
    }

    public long getEntries() {
        return entries;
    }

    public void setEntries(long entries) {
        this.entries = entries;
    }

    public long getExits() {
        return exits;
    }

    public void setExits(long exits) {
        this.exits = exits;
    }
}
