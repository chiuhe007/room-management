package com.roommanagement.model;

/**
 * 房间类型枚举
 * Room Type Enumeration
 */
public enum RoomType {
    SINGLE("单人间", "Single Room", 200.0),
    DOUBLE("双人间", "Double Room", 300.0),
    SUITE("套房", "Suite", 500.0),
    DELUXE("豪华房", "Deluxe Room", 800.0);

    private final String chineseName;
    private final String englishName;
    private final double basePrice;

    RoomType(String chineseName, String englishName, double basePrice) {
        this.chineseName = chineseName;
        this.englishName = englishName;
        this.basePrice = basePrice;
    }

    public String getChineseName() {
        return chineseName;
    }

    public String getEnglishName() {
        return englishName;
    }

    public double getBasePrice() {
        return basePrice;
    }

    @Override
    public String toString() {
        return chineseName + " (" + englishName + ") - ¥" + basePrice;
    }
}
