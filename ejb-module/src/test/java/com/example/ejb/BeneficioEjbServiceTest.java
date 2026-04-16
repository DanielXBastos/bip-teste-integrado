package com.example.ejb;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BeneficioEjbServiceTest {

    @Mock
    private EntityManager em;

    @InjectMocks
    private BeneficioEjbService service;

    @Test
    void shouldTransferSuccessfully() {
        Beneficio from = Beneficio.builder()
                .id(1L)
                .valor(BigDecimal.valueOf(1000))
                .ativo(true)
                .build();

        Beneficio to = Beneficio.builder()
                .id(2L)
                .valor(BigDecimal.valueOf(500))
                .ativo(true)
                .build();

        when(em.find(Beneficio.class, 1L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(from);
        when(em.find(Beneficio.class, 2L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(to);

        service.transfer(1L, 2L, BigDecimal.valueOf(100));

        assertEquals(0, from.getValor().compareTo(BigDecimal.valueOf(900)));
        assertEquals(0, to.getValor().compareTo(BigDecimal.valueOf(600)));

        verify(em).find(Beneficio.class, 1L, LockModeType.PESSIMISTIC_WRITE);
        verify(em).find(Beneficio.class, 2L, LockModeType.PESSIMISTIC_WRITE);
    }

    @Test
    void shouldThrowWhenIdsAreNull() {
        assertThrows(BusinessException.class,
                () -> service.transfer(null, 2L, BigDecimal.TEN));

        assertThrows(BusinessException.class,
                () -> service.transfer(1L, null, BigDecimal.TEN));
    }

    @Test
    void shouldThrowWhenSameId() {
        assertThrows(BusinessException.class,
                () -> service.transfer(1L, 1L, BigDecimal.TEN));
    }

    @Test
    void shouldThrowWhenAmountIsInvalid() {
        assertThrows(BusinessException.class,
                () -> service.transfer(1L, 2L, null));

        assertThrows(BusinessException.class,
                () -> service.transfer(1L, 2L, BigDecimal.ZERO));

        assertThrows(BusinessException.class,
                () -> service.transfer(1L, 2L, BigDecimal.valueOf(-10)));
    }

    @Test
    void shouldThrowWhenBenefitNotFound() {
        when(em.find(Beneficio.class, 1L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(null);
        when(em.find(Beneficio.class, 2L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(null);

        assertThrows(BusinessException.class,
                () -> service.transfer(1L, 2L, BigDecimal.TEN));
    }

    @Test
    void shouldThrowWhenInactive() {
        Beneficio from = Beneficio.builder()
                .id(1L)
                .valor(BigDecimal.valueOf(100))
                .ativo(false)
                .build();

        Beneficio to = Beneficio.builder()
                .id(2L)
                .valor(BigDecimal.valueOf(100))
                .ativo(true)
                .build();

        when(em.find(Beneficio.class, 1L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(from);
        when(em.find(Beneficio.class, 2L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(to);

        assertThrows(BusinessException.class,
                () -> service.transfer(1L, 2L, BigDecimal.TEN));
    }

    @Test
    void shouldThrowWhenInsufficientBalance() {
        Beneficio from = Beneficio.builder()
                .id(1L)
                .valor(BigDecimal.valueOf(50))
                .ativo(true)
                .build();

        Beneficio to = Beneficio.builder()
                .id(2L)
                .valor(BigDecimal.valueOf(100))
                .ativo(true)
                .build();

        when(em.find(Beneficio.class, 1L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(from);
        when(em.find(Beneficio.class, 2L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(to);

        assertThrows(BusinessException.class,
                () -> service.transfer(1L, 2L, BigDecimal.valueOf(100)));
    }
}