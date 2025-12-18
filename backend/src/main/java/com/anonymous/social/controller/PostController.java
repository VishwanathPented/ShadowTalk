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

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @GetMapping
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Map<String, String> request,
                                        @AuthenticationPrincipal UserDetails userDetails) {
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
}
