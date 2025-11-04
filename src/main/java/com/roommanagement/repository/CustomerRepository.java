package com.roommanagement.repository;

import com.roommanagement.model.Customer;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 顾客数据访问层
 * Customer Data Access Layer
 */
public class CustomerRepository {
    private final Map<String, Customer> customers;

    public CustomerRepository() {
        this.customers = new HashMap<>();
    }

    public Customer save(Customer customer) {
        customers.put(customer.getCustomerId(), customer);
        return customer;
    }

    public Optional<Customer> findById(String customerId) {
        return Optional.ofNullable(customers.get(customerId));
    }

    public List<Customer> findAll() {
        return new ArrayList<>(customers.values());
    }

    public Optional<Customer> findByIdCard(String idCard) {
        return customers.values().stream()
                .filter(customer -> customer.getIdCard().equals(idCard))
                .findFirst();
    }

    public List<Customer> findByName(String name) {
        return customers.values().stream()
                .filter(customer -> customer.getName().contains(name))
                .collect(Collectors.toList());
    }

    public boolean delete(String customerId) {
        return customers.remove(customerId) != null;
    }

    public void clear() {
        customers.clear();
    }

    public int count() {
        return customers.size();
    }

    public boolean exists(String customerId) {
        return customers.containsKey(customerId);
    }
}
