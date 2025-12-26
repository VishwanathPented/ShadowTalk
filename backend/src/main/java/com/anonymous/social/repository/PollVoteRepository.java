package com.anonymous.social.repository;

import com.anonymous.social.model.PollVote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PollVoteRepository extends JpaRepository<PollVote, Long> {
    Optional<PollVote> findByMessageIdAndUserId(Long messageId, Long userId);
}
