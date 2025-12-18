package com.anonymous.social.service;

import com.anonymous.social.model.*;
import com.anonymous.social.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {

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
    private WordFilterService wordFilterService;

    public Post createPost(String email, String content) {
        if (wordFilterService.containsBannedWord(content)) {
            throw new IllegalArgumentException("Post contains inappropriate language.");
        }
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Post post = new Post();
        post.setUser(user);
        post.setContent(content);
        return postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    public void likePost(Long postId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Post post = postRepository.findById(postId).orElseThrow();

        if (postLikeRepository.findByPostAndUser(post, user).isPresent()) {
            // Unlike if already liked? or just do nothing? Let's toggle.
             postLikeRepository.delete(postLikeRepository.findByPostAndUser(post, user).get());
        } else {
            PostLike like = new PostLike();
            like.setPost(post);
            like.setUser(user);
            postLikeRepository.save(like);
        }
    }

    public Comment addComment(Long postId, String email, String content) {
        if (wordFilterService.containsBannedWord(content)) {
            throw new IllegalArgumentException("Comment contains inappropriate language.");
        }
        User user = userRepository.findByEmail(email).orElseThrow();
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
