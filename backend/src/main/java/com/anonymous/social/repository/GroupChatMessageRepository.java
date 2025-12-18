package com.anonymous.social.repository;

import com.anonymous.social.model.GroupChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GroupChatMessageRepository extends JpaRepository<GroupChatMessage, Long> {
    List<GroupChatMessage> findByGroupIdOrderByCreatedAtAsc(Long groupId);
}
