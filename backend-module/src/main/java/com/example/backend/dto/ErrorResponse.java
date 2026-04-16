package com.example.backend.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record ErrorResponse(
        LocalDateTime timestamp,
        String message,
        Map<String, String> fields
) {}
