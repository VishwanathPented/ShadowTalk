package com.anonymous.social.controller;

import com.anonymous.social.model.Post;
import com.anonymous.social.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private static final Logger logger = LoggerFactory.getLogger(PostController.class);

    @Autowired
    private PostService postService;

    @GetMapping
    public List<Post> getAllPosts() {
        logger.info("Request received to get all posts");
        return postService.getAllPosts();
    }

    @GetMapping("/top")
    public List<Post> getTopLikedPosts() {
        return postService.getTopLikedPosts(5);
    }

    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Map<String, String> request,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        logger.info("Request received to create post for user: {}", userDetails.getUsername());
        try {
            return ResponseEntity.ok(postService.createPost(userDetails.getUsername(), request.get("content")));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        postService.likePost(id, userDetails.getUsername());
        return ResponseEntity.ok("Liked/Unliked");
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<?> commentPost(@PathVariable Long id,
                                         @RequestBody Map<String, String> request,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        try {
            return ResponseEntity.ok(postService.addComment(id, userDetails.getUsername(), request.get("content")));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/repost")
    public ResponseEntity<?> repostPost(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        postService.repost(id, userDetails.getUsername());
        return ResponseEntity.ok("Reposted");
    }

    @Autowired
    private com.anonymous.social.repository.ReportRepository reportRepository;

    @Autowired
    private com.anonymous.social.repository.PostRepository postRepository;

    @Autowired
    private com.anonymous.social.service.AuthService authService;

    @PostMapping("/{id}/report")
    public ResponseEntity<?> reportPost(@RequestHeader("Authorization") String token,
                                      @PathVariable Long id,
                                      @RequestBody Map<String, String> payload) {
        try {
            com.anonymous.social.model.User reporter = authService.getUserFromToken(token);
            com.anonymous.social.model.Post post = postRepository.findById(id).orElseThrow(() -> new RuntimeException("Post not found"));

            com.anonymous.social.model.Report report = new com.anonymous.social.model.Report();
            report.setReporter(reporter);
            report.setReportedPost(post);
            report.setReason(payload.getOrDefault("reason", "No reason provided"));
            report.setType("POST");
            report.setCreatedAt(java.time.LocalDateTime.now());

            reportRepository.save(report);

            return ResponseEntity.ok("Post reported successfully");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Report failed: " + e.getMessage());
        }
    }
}
