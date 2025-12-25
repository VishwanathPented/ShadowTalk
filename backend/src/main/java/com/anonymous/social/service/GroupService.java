package com.anonymous.social.service;

import com.anonymous.social.model.GroupMember;
import com.anonymous.social.model.SocialGroup;
import com.anonymous.social.model.User;
import com.anonymous.social.repository.GroupMemberRepository;
import com.anonymous.social.repository.SocialGroupRepository;
import com.anonymous.social.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class GroupService {

    @Autowired
    private SocialGroupRepository groupRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WordFilterService wordFilterService;

    public SocialGroup createGroup(String email, String name, String description, boolean isPrivate) {
        if (wordFilterService.containsBannedWord(name) || wordFilterService.containsBannedWord(description)) {
            throw new IllegalArgumentException("Group details contain inappropriate language.");
        }

        User user = userRepository.findByEmail(email).orElseThrow();
        SocialGroup group = new SocialGroup();
        group.setName(name);
        group.setDescription(description);
        group.setPrivate(isPrivate);
        group.setCreatedBy(user);

        if (isPrivate) {
            group.setInviteCode(UUID.randomUUID().toString().substring(0, 8));
        }

        SocialGroup savedGroup = groupRepository.save(group);

        // Add creator as member
        GroupMember member = new GroupMember();
        member.setGroup(savedGroup);
        member.setUser(user);
        groupMemberRepository.save(member);

        return savedGroup;
    }

    public List<SocialGroup> getAllPublicGroups() {
        return groupRepository.findByIsPrivateFalse();
    }

    public void joinGroup(Long groupId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        SocialGroup group = groupRepository.findById(groupId).orElseThrow();

        if (!group.isPrivate() && !groupMemberRepository.existsByGroupAndUser(group, user)) {
            GroupMember member = new GroupMember();
            member.setGroup(group);
            member.setUser(user);
            groupMemberRepository.save(member);
        }
    }

    public void joinPrivateGroup(String inviteCode, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        SocialGroup group = groupRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new IllegalArgumentException("Invalid invite code"));

        if (!groupMemberRepository.existsByGroupAndUser(group, user)) {
            GroupMember member = new GroupMember();
            member.setGroup(group);
            member.setUser(user);
            groupMemberRepository.save(member);
        }
    }

    public List<SocialGroup> getUserGroups(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return groupMemberRepository.findByUser(user).stream()
                .map(GroupMember::getGroup)
                .toList();
    }
}
