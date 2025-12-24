package com.anonymous.social.controller;

import com.anonymous.social.model.Hashtag;
import com.anonymous.social.repository.HashtagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hashtags")
public class HashtagController {

    @Autowired
    private HashtagRepository hashtagRepository;

    @GetMapping("/trending")
    public List<Hashtag> getTrending() {
        return hashtagRepository.findTop10ByOrderByUsageCountDesc();
    }
}
