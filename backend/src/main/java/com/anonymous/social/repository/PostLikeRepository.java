package com.anonymous.social.repository;

import com.anonymous.social.model.PostLike;
import com.anonymous.social.model.Post;
import com.anonymous.social.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    Optional<PostLike> findByPostAndUser(Post post, User user);
}
