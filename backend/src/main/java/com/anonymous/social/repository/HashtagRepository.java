package com.anonymous.social.repository;

import com.anonymous.social.model.Hashtag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HashtagRepository extends JpaRepository<Hashtag, Long> {
    Optional<Hashtag> findByName(String name);
    List<Hashtag> findTop10ByOrderByUsageCountDesc();
}
