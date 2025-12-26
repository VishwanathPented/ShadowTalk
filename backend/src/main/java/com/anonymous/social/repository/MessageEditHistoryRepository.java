package com.anonymous.social.repository;

import com.anonymous.social.model.MessageEditHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageEditHistoryRepository extends JpaRepository<MessageEditHistory, Long> {
    List<MessageEditHistory> findByMessageIdOrderByEditedAtDesc(Long messageId);
}
