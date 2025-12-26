package com.anonymous.social.service;

import com.anonymous.social.model.BannedWord;
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

    private java.util.Map<String, Integer> bannedWordsCache = new java.util.HashMap<>();

    @PostConstruct
    public void init() {
        loadBannedWords();
    }

    public void loadBannedWords() {
        bannedWordsCache = bannedWordRepository.findAll().stream()
                .collect(Collectors.toMap(
                    word -> word.getWord().toLowerCase(),
                    BannedWord::getBanDurationMinutes,
                    (existing, replacement) -> existing
                ));
        // Add some default words if DB is empty
        if (bannedWordsCache.isEmpty()) {
            bannedWordsCache.put("badword", 5);
            bannedWordsCache.put("abuse", 10);
            bannedWordsCache.put("vulgar", 5);
        }
    }

    public boolean containsBannedWord(String content) {
        return getBanDuration(content) > 0;
    }

    public int getBanDuration(String content) {
        if (content == null || content.isEmpty()) return 0;
        String lowerContent = content.toLowerCase();
        int maxDuration = 0;

        for (java.util.Map.Entry<String, Integer> entry : bannedWordsCache.entrySet()) {
            if (lowerContent.contains(entry.getKey())) {
                maxDuration = Math.max(maxDuration, entry.getValue());
            }
        }
        return maxDuration;
    }

    public void addBannedWord(String word, int duration) {
        bannedWordsCache.put(word.toLowerCase(), duration);
    }

    public void removeBannedWord(String word) {
        bannedWordsCache.remove(word.toLowerCase());
    }
}
