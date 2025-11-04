package com.roommanagement.service;

import com.roommanagement.model.Customer;
import com.roommanagement.repository.CustomerRepository;

import java.util.List;
import java.util.Optional;

/**
 * 顾客服务层
 * Customer Service Layer
 */
public class CustomerService {
    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Customer addCustomer(String customerId, String name, String idCard, String phoneNumber, String email) {
        if (customerRepository.exists(customerId)) {
            throw new IllegalArgumentException("顾客ID已存在 (Customer ID already exists): " + customerId);
        }

        // Check if ID card already exists
        Optional<Customer> existingCustomer = customerRepository.findByIdCard(idCard);
        if (existingCustomer.isPresent()) {
            throw new IllegalArgumentException("身份证号已被注册 (ID card already registered): " + idCard);
        }

        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("姓名不能为空 (Name cannot be empty)");
        }

        Customer customer = new Customer(customerId, name, idCard, phoneNumber, email);
        return customerRepository.save(customer);
    }

    public Optional<Customer> getCustomerById(String customerId) {
        return customerRepository.findById(customerId);
    }

    public Optional<Customer> getCustomerByIdCard(String idCard) {
        return customerRepository.findByIdCard(idCard);
    }

    public List<Customer> searchCustomersByName(String name) {
        return customerRepository.findByName(name);
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer updateCustomer(String customerId, String name, String phoneNumber, String email) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("顾客不存在 (Customer not found): " + customerId));

        if (name != null && !name.trim().isEmpty()) {
            customer.setName(name);
        }
        if (phoneNumber != null) {
            customer.setPhoneNumber(phoneNumber);
        }
        if (email != null) {
            customer.setEmail(email);
        }

        return customerRepository.save(customer);
    }

    public boolean deleteCustomer(String customerId) {
        return customerRepository.delete(customerId);
    }

    public int getTotalCustomerCount() {
        return customerRepository.count();
    }
}
