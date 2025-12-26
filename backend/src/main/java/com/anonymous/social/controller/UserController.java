package com.anonymous.social.controller;

import com.anonymous.social.model.User;
import com.anonymous.social.service.PostService;
import com.anonymous.social.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private PostService postService;

    @GetMapping("/{username}")
    public ResponseEntity<?> getUserProfile(@PathVariable String username, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.getUserByAnonymousName(username);
            boolean isFollowing = false;

            if (userDetails != null) {
                isFollowing = userService.isFollowing(userDetails.getUsername(), user.getId());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("anonymousName", user.getAnonymousName());
            response.put("reputationScore", user.getReputationScore());
            response.put("avatarColor", user.getAvatarColor());
            response.put("createdAt", user.getCreatedAt());
            response.put("role", user.getRole());
            response.put("followersCount", user.getFollowers().size());
            response.put("followingCount", user.getFollowing().size());
            response.put("isFollowing", isFollowing);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<?> followUser(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            userService.followUser(userDetails.getUsername(), id);
            return ResponseEntity.ok("Followed successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}/follow")
    public ResponseEntity<?> unfollowUser(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            userService.unfollowUser(userDetails.getUsername(), id);
            return ResponseEntity.ok("Unfollowed successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{username}/posts")
    public ResponseEntity<?> getUserPosts(@PathVariable String username) {
        return ResponseEntity.ok(postService.getPostsByUser(username));
    }
}
