package com.anonymous.social.controller;

import com.anonymous.social.model.Feedback;
import com.anonymous.social.model.User;
import com.anonymous.social.repository.FeedbackRepository;
import com.anonymous.social.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, String> request,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        String type = request.get("type");
        String content = request.get("content");

        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Content is required");
        }

        Feedback feedback = new Feedback();
        feedback.setType(type != null ? type : "OTHER");
        feedback.setContent(content);

        if (userDetails != null) {
            userRepository.findByEmail(userDetails.getUsername())
                .ifPresent(user -> feedback.setUserId(user.getId()));
        }

        feedbackRepository.save(feedback);
        return ResponseEntity.ok(Map.of("message", "Feedback received. Thank you!"));
    }

    @GetMapping
    public ResponseEntity<?> getAllFeedback() {
        return ResponseEntity.ok(feedbackRepository.findAll());
    }
}
