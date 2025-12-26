package com.anonymous.social.repository;

import com.anonymous.social.model.GroupChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;


@Repository
public interface GroupChatMessageRepository extends JpaRepository<GroupChatMessage, Long> {
    List<GroupChatMessage> findByGroupIdOrderByCreatedAtAsc(Long groupId);
    List<GroupChatMessage> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<GroupChatMessage> findTop100ByOrderByCreatedAtDesc();
    void deleteByGroupId(Long groupId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE GroupChatMessage m SET m.replyTo = null WHERE m.group.id = :groupId")
    void unlinkRepliesByGroupId(@org.springframework.web.bind.annotation.PathVariable("groupId") Long groupId);
}
