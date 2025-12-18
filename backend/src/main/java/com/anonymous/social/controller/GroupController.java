package com.anonymous.social.controller;

import com.anonymous.social.model.SocialGroup;
import com.anonymous.social.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @GetMapping
    public List<SocialGroup> getPublicGroups() {
        return groupService.getAllPublicGroups();
    }

    @PostMapping
    public ResponseEntity<?> createGroup(@RequestBody Map<String, Object> request,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String name = (String) request.get("name");
            String description = (String) request.get("description");
            boolean isPrivate = (Boolean) request.get("isPrivate");

            return ResponseEntity.ok(groupService.createGroup(userDetails.getUsername(), name, description, isPrivate));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinGroup(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        groupService.joinGroup(id, userDetails.getUsername());
        return ResponseEntity.ok("Joined");
    }

    @PostMapping("/join-private")
    public ResponseEntity<?> joinPrivateGroup(@RequestBody Map<String, String> request,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        try {
            groupService.joinPrivateGroup(request.get("inviteCode"), userDetails.getUsername());
            return ResponseEntity.ok("Joined private group");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
