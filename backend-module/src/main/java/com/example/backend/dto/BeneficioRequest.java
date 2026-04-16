package com.example.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record BeneficioRequest(
        @Schema(example = "Benefício X")
        @NotBlank(message = "Nome do benefício é obrigatório")
        String nome,

        @Schema(example = "Descrição do benefício")
        @NotBlank(message = "Descrição do benefício é obrigatória")
        String descricao,

        @Schema(example = "1000.00")
        @Positive(message = "Valor do benefício deve ser positivo")
        BigDecimal valor,

        @Schema(example = "true")
        Boolean ativo
) {}
