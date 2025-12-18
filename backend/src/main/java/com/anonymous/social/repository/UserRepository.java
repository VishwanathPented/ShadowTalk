package com.anonymous.social.repository;

import com.anonymous.social.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByAnonymousName(String anonymousName);
    boolean existsByAnonymousName(String anonymousName);
}
