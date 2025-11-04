package com.roommanagement.model;

import java.util.Objects;

/**
 * 顾客实体类
 * Customer Entity Class
 */
public class Customer {
    private String customerId;
    private String name;
    private String idCard;
    private String phoneNumber;
    private String email;

    public Customer() {
    }

    public Customer(String customerId, String name, String idCard, String phoneNumber) {
        this.customerId = customerId;
        this.name = name;
        this.idCard = idCard;
        this.phoneNumber = phoneNumber;
        this.email = "";
    }

    public Customer(String customerId, String name, String idCard, String phoneNumber, String email) {
        this.customerId = customerId;
        this.name = name;
        this.idCard = idCard;
        this.phoneNumber = phoneNumber;
        this.email = email;
    }

    // Getters and Setters
    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIdCard() {
        return idCard;
    }

    public void setIdCard(String idCard) {
        this.idCard = idCard;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Customer customer = (Customer) o;
        return Objects.equals(customerId, customer.customerId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(customerId);
    }

    @Override
    public String toString() {
        return "Customer{" +
                "customerId='" + customerId + '\'' +
                ", name='" + name + '\'' +
                ", idCard='" + idCard + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", email='" + email + '\'' +
                '}';
    }
}
