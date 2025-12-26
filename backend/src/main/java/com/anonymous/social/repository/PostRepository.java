package com.anonymous.social.repository;

import com.anonymous.social.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByOrderByCreatedAtDesc();
    List<Post> findByUser_AnonymousNameOrderByCreatedAtDesc(String anonymousName);
    long countByUser(com.anonymous.social.model.User user);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Post p LEFT JOIN p.likes l GROUP BY p.id ORDER BY COUNT(l) DESC")
    List<Post> findTopLikedPosts(org.springframework.data.domain.Pageable pageable);
}
