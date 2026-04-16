package com.example.backend.repository;

import com.example.ejb.Beneficio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BeneficioRepository extends JpaRepository<Beneficio, Long> {

    Optional<Beneficio> findByNomeIgnoreCase(String nome);
}