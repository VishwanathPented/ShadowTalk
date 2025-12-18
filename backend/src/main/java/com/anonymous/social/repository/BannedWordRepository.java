package com.anonymous.social.repository;

import com.anonymous.social.model.BannedWord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BannedWordRepository extends JpaRepository<BannedWord, Long> {
    boolean existsByWord(String word);
}
