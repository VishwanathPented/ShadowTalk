package com.anonymous.social.service;

import com.anonymous.social.model.User;
import com.anonymous.social.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    public User getUserByAnonymousName(String anonymousName) {
        return userRepository.findByAnonymousName(anonymousName)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + anonymousName));
    }

    @Transactional
    public void followUser(String followerEmail, Long followingId) {
        User follower = getUserByEmail(followerEmail);
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new IllegalArgumentException("User to follow not found"));

        if (follower.getId().equals(following.getId())) {
            throw new IllegalArgumentException("You cannot follow yourself");
        }

        follower.getFollowing().add(following);
        userRepository.save(follower);
    }

    @Transactional
    public void unfollowUser(String followerEmail, Long followingId) {
        User follower = getUserByEmail(followerEmail);
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new IllegalArgumentException("User to unfollow not found"));

        follower.getFollowing().remove(following);
        userRepository.save(follower);
    }

    public boolean isFollowing(String followerEmail, Long followingId) {
        User follower = getUserByEmail(followerEmail);
        return follower.getFollowing().stream()
                .anyMatch(u -> u.getId().equals(followingId));
    }
}
