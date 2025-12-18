package com.anonymous.social.service;

import com.anonymous.social.repository.BannedWordRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class WordFilterService {

    @Autowired
    private BannedWordRepository bannedWordRepository;

    private Set<String> bannedWordsCache = new HashSet<>();

    @PostConstruct
    public void init() {
        loadBannedWords();
    }

    public void loadBannedWords() {
        bannedWordsCache = bannedWordRepository.findAll().stream()
                .map(word -> word.getWord().toLowerCase())
                .collect(Collectors.toSet());
        // Add some default words if DB is empty
        if (bannedWordsCache.isEmpty()) {
            bannedWordsCache.add("badword");
            bannedWordsCache.add("abuse");
            bannedWordsCache.add("vulgar");
            // In a real app, populate this properly
        }
    }

    public boolean containsBannedWord(String content) {
        if (content == null || content.isEmpty()) return false;
        String lowerContent = content.toLowerCase();
        for (String word : bannedWordsCache) {
            if (lowerContent.contains(word)) {
                return true;
            }
        }
        return false;
    }

    public void addBannedWord(String word) {
        bannedWordsCache.add(word.toLowerCase());
    }
}
