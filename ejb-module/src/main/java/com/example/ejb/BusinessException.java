package com.example.ejb;

public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
