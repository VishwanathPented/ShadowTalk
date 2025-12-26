package com.anonymous.social.repository;

import com.anonymous.social.model.GroupChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


@Repository
public interface GroupChatMessageRepository extends JpaRepository<GroupChatMessage, Long> {
    List<GroupChatMessage> findByGroupIdOrderByCreatedAtAsc(Long groupId);
    List<GroupChatMessage> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<GroupChatMessage> findTop100ByOrderByCreatedAtDesc();
    void deleteByGroupId(Long groupId);

    @Modifying
    @Query("UPDATE GroupChatMessage m SET m.replyTo = null WHERE m.replyTo.id = :messageId")
    void unlinkReplies(@Param("messageId") Long messageId);

    @Modifying
    @Query("UPDATE GroupChatMessage m SET m.replyTo = null WHERE m.group.id = :groupId")
    void unlinkRepliesByGroupId(@Param("groupId") Long groupId);
}
