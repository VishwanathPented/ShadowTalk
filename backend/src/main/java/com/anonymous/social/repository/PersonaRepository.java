package com.anonymous.social.repository;

import com.anonymous.social.model.Persona;
import com.anonymous.social.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PersonaRepository extends JpaRepository<Persona, Long> {
    List<Persona> findByUser(User user);
}
