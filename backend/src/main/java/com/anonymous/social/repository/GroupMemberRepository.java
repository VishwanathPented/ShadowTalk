package com.anonymous.social.repository;

import com.anonymous.social.model.GroupMember;
import com.anonymous.social.model.SocialGroup;
import com.anonymous.social.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    boolean existsByGroupAndUser(SocialGroup group, User user);
    Optional<GroupMember> findByGroupAndUser(SocialGroup group, User user);
    List<GroupMember> findByGroupId(Long groupId);
}
