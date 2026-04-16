package com.example.backend.service;

import com.example.backend.dto.BeneficioRequest;
import com.example.backend.dto.BeneficioResponse;
import com.example.backend.dto.TransferRequest;
import com.example.backend.repository.BeneficioRepository;
import com.example.ejb.Beneficio;
import com.example.ejb.BeneficioEjbService;
import com.example.ejb.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BeneficioService {

    private final BeneficioRepository repository;
    private final BeneficioEjbService ejbService;

    public List<BeneficioResponse> list() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    public BeneficioResponse findById(Long id) {
        Beneficio beneficio = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Benefício não encontrado"));
        return toResponse(beneficio);
    }

    @Transactional
    public BeneficioResponse create(BeneficioRequest request) {
        validateUniqueName(request.nome(), null);

        Beneficio entity = Beneficio.builder()
                .nome(request.nome().trim())
                .descricao(request.descricao().trim())
                .valor(request.valor())
                .ativo(resolveAtivo(request.ativo()))
                .build();

        return toResponse(repository.save(entity));
    }

    @Transactional
    public BeneficioResponse update(Long id, BeneficioRequest request) {
        Beneficio entity = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Benefício não encontrado"));

        validateUniqueName(request.nome(), id);

        entity.setNome(request.nome().trim());
        entity.setDescricao(request.descricao().trim());
        entity.setValor(request.valor());
        entity.setAtivo(resolveAtivo(request.ativo()));

        return toResponse(repository.save(entity));
    }

    @Transactional
    public void delete(Long id) {
        Beneficio entity = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Benefício não encontrado"));

        entity.setAtivo(false);
        repository.save(entity);
    }

    @Transactional
    public void transfer(TransferRequest request) {
        ejbService.transfer(request.fromId(), request.toId(), request.amount());
    }

    private void validateUniqueName(String nome, Long currentId) {
        repository.findByNomeIgnoreCase(nome.trim()).ifPresent(existing -> {
            if (currentId == null || !existing.getId().equals(currentId)) {
                throw new BusinessException("Nome do benefício deve ser único");
            }
        });
    }

    private Boolean resolveAtivo(Boolean ativo) {
        return ativo != null ? ativo : true;
    }

    private BeneficioResponse toResponse(Beneficio beneficio) {
        return new BeneficioResponse(
                beneficio.getId(),
                beneficio.getNome(),
                beneficio.getDescricao(),
                beneficio.getValor(),
                beneficio.getAtivo()
        );
    }
}
