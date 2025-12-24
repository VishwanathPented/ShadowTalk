package com.anonymous.social.repository;

import com.anonymous.social.model.MessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MessageReactionRepository extends JpaRepository<MessageReaction, Long> {
    Optional<MessageReaction> findByMessageIdAndUserId(Long messageId, Long userId);
}
