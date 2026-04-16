package com.example.backend.controller;

import com.example.backend.dto.BeneficioRequest;
import com.example.backend.dto.BeneficioResponse;
import com.example.backend.dto.TransferRequest;
import com.example.backend.service.BeneficioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/beneficios")
@RequiredArgsConstructor
@Tag(name = "Benefícios")
public class BeneficioController {

    private final BeneficioService service;

    @GetMapping
    @Operation(summary = "Listar benefícios")
    public List<BeneficioResponse> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public BeneficioResponse findById(@PathVariable("id") Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar benefício")
    public BeneficioResponse create(@Valid @RequestBody BeneficioRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar benefício")
    public BeneficioResponse update(@PathVariable("id") Long id, @RequestBody BeneficioRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Inativar benefício")
    public void delete(@PathVariable("id") Long id) {
        service.delete(id);
    }

    @PostMapping("/transfer")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Transferir valor entre benefícios")
    public void transfer(@Valid @RequestBody TransferRequest request) {
        service.transfer(request);
    }
}
