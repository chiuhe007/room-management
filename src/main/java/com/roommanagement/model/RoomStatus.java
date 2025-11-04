package com.roommanagement.model;

/**
 * 房间状态枚举
 * Room Status Enumeration
 */
public enum RoomStatus {
    AVAILABLE("可用", "Available"),
    OCCUPIED("已占用", "Occupied"),
    MAINTENANCE("维护中", "Under Maintenance"),
    RESERVED("已预订", "Reserved");

    private final String chineseName;
    private final String englishName;

    RoomStatus(String chineseName, String englishName) {
        this.chineseName = chineseName;
        this.englishName = englishName;
    }

    public String getChineseName() {
        return chineseName;
    }

    public String getEnglishName() {
        return englishName;
    }

    @Override
    public String toString() {
        return chineseName + " (" + englishName + ")";
    }
}
