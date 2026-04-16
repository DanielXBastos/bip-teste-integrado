package com.example.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record TransferRequest(
        @Schema(example = "1")
        @NotNull(message = "fromId é obrigatório")
        Long fromId,

        @Schema(example = "2")
        @NotNull(message = "toId é obrigatório")
        Long toId,

        @Schema(example = "100.00")
        @NotNull(message = "amount é obrigatório")
        @Positive(message = "Valor da transferência deve ser positivo")
        BigDecimal amount
) {}
