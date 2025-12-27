package com.anonymous.social.service;

import com.anonymous.social.model.*;
import com.anonymous.social.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class PostService {

    private static final Logger logger = LoggerFactory.getLogger(PostService.class);

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostLikeRepository postLikeRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private RepostRepository repostRepository;

    @Autowired
    private HashtagRepository hashtagRepository;

    @Autowired
    private WordFilterService wordFilterService;

    public Post createPost(String email, String content, String theme) {
        logger.info("Creating post for user: {}", email);
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getBannedUntil() != null && user.getBannedUntil().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("You are temporarily banned until " + user.getBannedUntil());
        }

        // Banned word check
        int banDuration = wordFilterService.getBanDuration(content);
        if (banDuration > 0) {
            user.setBannedUntil(LocalDateTime.now().plusMinutes(banDuration));
            userRepository.save(user);
            throw new IllegalArgumentException("Content contains banned words. You are banned for " + banDuration + " minutes.");
        }

        Post post = new Post();
        post.setUser(user);
        post.setContent(content);
        post.setTheme(theme != null && !theme.isEmpty() ? theme : "General");

        processHashtags(content);

        return postRepository.save(post);
    }

    private void processHashtags(String content) {
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("#\\w+");
        java.util.regex.Matcher matcher = pattern.matcher(content);
        while (matcher.find()) {
            String tag = matcher.group().substring(1); // remove #
            Hashtag hashtag = hashtagRepository.findByName(tag)
                    .orElse(new Hashtag(tag));
            if (hashtag.getId() != null) {
                hashtag.incrementUsage();
            }
            hashtagRepository.save(hashtag);
        }
    }

    public List<Post> getAllPosts(String timeFilter) {
        java.time.LocalDateTime cutoff = null;
        if (timeFilter != null) {
            switch (timeFilter) {
                case "today": cutoff = LocalDateTime.now().minusHours(24); break;
                case "3days": cutoff = LocalDateTime.now().minusDays(3); break;
                case "week": cutoff = LocalDateTime.now().minusWeeks(1); break;
                case "month": cutoff = LocalDateTime.now().minusMonths(1); break;
            }
        }

        List<Post> posts;
        if (cutoff != null) {
            posts = postRepository.findAllByCreatedAtAfterOrderByCreatedAtDesc(cutoff);
        } else {
            posts = postRepository.findAllByOrderByCreatedAtDesc();
        }
        logger.info("Retrieved {} posts (filter: {})", posts.size(), timeFilter);
        return posts;
    }

    public List<Post> getPostsByUser(String username) {
        List<Post> posts = postRepository.findByUser_AnonymousNameOrderByCreatedAtDesc(username);
        logger.info("Retrieved {} posts for user {}", posts.size(), username);
        return posts;
    }

    public List<Post> getTopLikedPosts(int limit) {
        return postRepository.findTopLikedPosts(org.springframework.data.domain.PageRequest.of(0, limit));
    }

    public void likePost(Long postId, String email, String reactionType) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Post post = postRepository.findById(postId).orElseThrow();
        User author = post.getUser();
        String finalReactionStart = reactionType != null ? reactionType : "HEART";

        java.util.Optional<PostLike> existingLikeOpt = postLikeRepository.findByPostAndUser(post, user);

        if (existingLikeOpt.isPresent()) {
             PostLike existing = existingLikeOpt.get();
             if (existing.getReactionType().equals(finalReactionStart)) {
                 // Toggle OFF
                 postLikeRepository.delete(existing);
                 // Decrement fake like count
                 if (post.getFakeLikeCount() != null) {
                     post.setFakeLikeCount(Math.max(0, post.getFakeLikeCount() - 1));
                     postRepository.save(post);
                 }
                 // Decrement reputation
                 author.setReputationScore(author.getReputationScore() - 1);
                 userRepository.save(author);
             } else {
                 // Change Reaction Type
                 existing.setReactionType(finalReactionStart);
                 postLikeRepository.save(existing);
             }
        } else {
            // New Reaction
            PostLike like = new PostLike();
            like.setPost(post);
            like.setUser(user);
            like.setReactionType(finalReactionStart);
            postLikeRepository.save(like);
            // Increment fake like count
            if (post.getFakeLikeCount() != null) {
                post.setFakeLikeCount(post.getFakeLikeCount() + 1);
                postRepository.save(post);
            }
            // Increment reputation
            author.setReputationScore(author.getReputationScore() + 1);
            userRepository.save(author);
        }
    }

    public Comment addComment(Long postId, String email, String content) {
        User user = userRepository.findByEmail(email).orElseThrow();
        // Check if user is banned
        if (user.getBannedUntil() != null && user.getBannedUntil().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("You are temporarily banned until " + user.getBannedUntil());
        }

        // Banned word check
        int banDuration = wordFilterService.getBanDuration(content);
        if (banDuration > 0) {
            user.setBannedUntil(LocalDateTime.now().plusMinutes(banDuration));
            userRepository.save(user);
            throw new IllegalArgumentException("Content contains banned words. You are banned for " + banDuration + " minutes.");
        }
        Post post = postRepository.findById(postId).orElseThrow();

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setUser(user);
        comment.setContent(content);

        return commentRepository.save(comment);
    }

    public void repost(Long postId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Post post = postRepository.findById(postId).orElseThrow();

        if (repostRepository.findByPostAndUser(post, user).isEmpty()) {
            Repost repost = new Repost();
            repost.setPost(post);
            repost.setUser(user);
            repostRepository.save(repost);
        }
    }
}
