package com.anonymous.social.service;

import com.anonymous.social.model.GroupChatMessage;
import com.anonymous.social.model.SocialGroup;
import com.anonymous.social.model.User;
import com.anonymous.social.repository.GroupChatMessageRepository;
import com.anonymous.social.repository.SocialGroupRepository;
import com.anonymous.social.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    @Autowired
    private GroupChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SocialGroupRepository groupRepository;

    @Autowired
    private WordFilterService wordFilterService;

    public GroupChatMessage saveMessage(Long groupId, String email, String messageContent, Long replyToId) {
        if (wordFilterService.containsBannedWord(messageContent)) {
            throw new IllegalArgumentException("Message contains inappropriate language.");
        }

        User user = userRepository.findByEmail(email).orElseThrow();
        SocialGroup group = groupRepository.findById(groupId).orElseThrow();

        GroupChatMessage chatMessage = new GroupChatMessage();
        chatMessage.setGroup(group);
        chatMessage.setUser(user);
        chatMessage.setMessage(messageContent);

        if (replyToId != null) {
            chatMessageRepository.findById(replyToId).ifPresent(chatMessage::setReplyTo);
        }

        return chatMessageRepository.save(chatMessage);
    }

    @Autowired
    private com.anonymous.social.repository.MessageReactionRepository reactionRepository;

    public GroupChatMessage addReaction(Long messageId, String email, String emoji) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
        GroupChatMessage message = chatMessageRepository.findById(messageId).orElseThrow(() -> new IllegalArgumentException("Message not found"));

        // Check if reaction already exists
        com.anonymous.social.model.MessageReaction existingReaction = reactionRepository.findByMessageIdAndUserId(messageId, user.getId()).orElse(null);

        if (existingReaction != null) {
            if (existingReaction.getEmoji().equals(emoji)) {
                // If same emoji, remove it (toggle off)
                reactionRepository.delete(existingReaction);
                message.getReactions().remove(existingReaction);
            } else {
                // If different, update it
                existingReaction.setEmoji(emoji);
                reactionRepository.save(existingReaction);
            }
        } else {
            // New reaction
            com.anonymous.social.model.MessageReaction reaction = new com.anonymous.social.model.MessageReaction(message, user, emoji);
            reactionRepository.save(reaction);
            message.getReactions().add(reaction);
        }

        return chatMessageRepository.save(message);
    }

    public List<GroupChatMessage> getGroupMessages(Long groupId) {
        return chatMessageRepository.findByGroupIdOrderByCreatedAtAsc(groupId);
    }
}
