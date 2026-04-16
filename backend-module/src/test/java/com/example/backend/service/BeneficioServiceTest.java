package com.example.backend.service;

import com.example.backend.dto.BeneficioRequest;
import com.example.backend.dto.TransferRequest;
import com.example.backend.repository.BeneficioRepository;
import com.example.ejb.Beneficio;
import com.example.ejb.BeneficioEjbService;
import com.example.ejb.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BeneficioServiceTest {

    @Mock
    private BeneficioRepository repository;

    @Mock
    private BeneficioEjbService ejbService;

    @InjectMocks
    private BeneficioService service;

    @Test
    void shouldCreateWithActiveDefaultTrue() {
        Beneficio entity = Beneficio.builder()
                .id(3L)
                .nome("Novo")
                .descricao("Teste")
                .valor(BigDecimal.TEN)
                .ativo(true)
                .build();

        when(repository.findByNomeIgnoreCase("Novo")).thenReturn(Optional.empty());
        when(repository.save(any(Beneficio.class))).thenReturn(entity);

        var response = service.create(new BeneficioRequest("Novo", "Teste", BigDecimal.TEN, null));

        assertNotNull(response);
        assertEquals(3L, response.id());
        assertEquals("Novo", response.nome());
        assertEquals("Teste", response.descricao());
        assertEquals(0, response.valor().compareTo(BigDecimal.TEN));
        assertTrue(response.ativo());

        verify(repository).findByNomeIgnoreCase("Novo");
        verify(repository).save(any(Beneficio.class));
    }

    @Test
    void shouldRejectDuplicateNameOnCreate() {
        when(repository.findByNomeIgnoreCase("Benefício A"))
                .thenReturn(Optional.of(
                        Beneficio.builder()
                                .id(1L)
                                .nome("Benefício A")
                                .build()
                ));

        assertThrows(
                BusinessException.class,
                () -> service.create(new BeneficioRequest("Benefício A", "Teste", BigDecimal.ONE, true))
        );

        verify(repository).findByNomeIgnoreCase("Benefício A");
        verify(repository, never()).save(any(Beneficio.class));
    }

    @Test
    void shouldUpdateBenefitSuccessfully() {
        Beneficio existing = Beneficio.builder()
                .id(1L)
                .nome("Benefício A")
                .descricao("Descrição antiga")
                .valor(BigDecimal.valueOf(100))
                .ativo(true)
                .build();

        Beneficio updated = Beneficio.builder()
                .id(1L)
                .nome("Benefício Atualizado")
                .descricao("Descrição nova")
                .valor(BigDecimal.valueOf(200))
                .ativo(false)
                .build();

        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.findByNomeIgnoreCase("Benefício Atualizado")).thenReturn(Optional.empty());
        when(repository.save(any(Beneficio.class))).thenReturn(updated);

        var response = service.update(
                1L,
                new BeneficioRequest("Benefício Atualizado", "Descrição nova", BigDecimal.valueOf(200), false)
        );

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Benefício Atualizado", response.nome());
        assertEquals("Descrição nova", response.descricao());
        assertEquals(0, response.valor().compareTo(BigDecimal.valueOf(200)));
        assertFalse(response.ativo());

        verify(repository).findById(1L);
        verify(repository).findByNomeIgnoreCase("Benefício Atualizado");
        verify(repository).save(existing);
    }

    @Test
    void shouldRejectDuplicateNameOnUpdateWhenBelongsToAnotherRecord() {
        Beneficio current = Beneficio.builder()
                .id(1L)
                .nome("Benefício Atual")
                .build();

        Beneficio duplicate = Beneficio.builder()
                .id(2L)
                .nome("Benefício A")
                .build();

        when(repository.findById(1L)).thenReturn(Optional.of(current));
        when(repository.findByNomeIgnoreCase("Benefício A")).thenReturn(Optional.of(duplicate));

        assertThrows(
                BusinessException.class,
                () -> service.update(1L, new BeneficioRequest("Benefício A", "Teste", BigDecimal.ONE, true))
        );

        verify(repository).findById(1L);
        verify(repository).findByNomeIgnoreCase("Benefício A");
        verify(repository, never()).save(any(Beneficio.class));
    }

    @Test
    void shouldAllowUpdateWhenNameBelongsToSameRecord() {
        Beneficio current = Beneficio.builder()
                .id(1L)
                .nome("Benefício A")
                .descricao("Atual")
                .valor(BigDecimal.valueOf(50))
                .ativo(true)
                .build();

        when(repository.findById(1L)).thenReturn(Optional.of(current));
        when(repository.findByNomeIgnoreCase("Benefício A")).thenReturn(Optional.of(current));
        when(repository.save(any(Beneficio.class))).thenReturn(current);

        var response = service.update(
                1L,
                new BeneficioRequest("Benefício A", "Atual", BigDecimal.valueOf(50), true)
        );

        assertNotNull(response);
        assertEquals("Benefício A", response.nome());

        verify(repository).findById(1L);
        verify(repository).findByNomeIgnoreCase("Benefício A");
        verify(repository).save(current);
    }

    @Test
    void shouldDeleteAsSoftDelete() {
        Beneficio existing = Beneficio.builder()
                .id(1L)
                .nome("Benefício A")
                .ativo(true)
                .build();

        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any(Beneficio.class))).thenReturn(existing);

        service.delete(1L);

        assertFalse(existing.getAtivo());

        verify(repository).findById(1L);
        verify(repository).save(existing);
    }

    @Test
    void shouldThrowWhenBenefitNotFoundOnFindById() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(BusinessException.class, () -> service.findById(99L));

        verify(repository).findById(99L);
    }

    @Test
    void shouldDelegateTransferToEjbService() {
        service.transfer(new TransferRequest(1L, 2L, BigDecimal.valueOf(50)));

        verify(ejbService).transfer(1L, 2L, BigDecimal.valueOf(50));
    }
}