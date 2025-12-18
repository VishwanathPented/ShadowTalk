package com.anonymous.social.repository;

import com.anonymous.social.model.SocialGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface SocialGroupRepository extends JpaRepository<SocialGroup, Long> {
    Optional<SocialGroup> findByInviteCode(String inviteCode);
    List<SocialGroup> findByIsPrivateFalse();
}
