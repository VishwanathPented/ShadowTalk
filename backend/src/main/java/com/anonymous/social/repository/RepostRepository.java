package com.anonymous.social.repository;

import com.anonymous.social.model.Repost;
import com.anonymous.social.model.User;
import com.anonymous.social.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RepostRepository extends JpaRepository<Repost, Long> {
    Optional<Repost> findByPostAndUser(Post post, User user);
}
