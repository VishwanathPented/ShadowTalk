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

        // Command Parsing Logic
        if (messageContent.startsWith("/")) {
            String[] parts = messageContent.split(" ", 2);
            String command = parts[0].toLowerCase();

            switch (command) {
                case "/roll":
                    int roll = (int) (Math.random() * 6) + 1;
                    chatMessage.setMessage("[SYSTEM] 🎲 " + user.getAnonymousName() + " rolled a " + roll + "!");
                    break;
                case "/flip":
                    String flip = Math.random() < 0.5 ? "Heads" : "Tails";
                    chatMessage.setMessage("[SYSTEM] 🪙 " + user.getAnonymousName() + " flipped " + flip + "!");
                    break;
                case "/8ball":
                    if (parts.length < 2) {
                        chatMessage.setMessage("[SYSTEM] 🎱 " + user.getAnonymousName() + " shook the 8-ball but asked nothing.");
                    } else {
                        String[] answers = {
                            "It is certain.", "It is decidedly so.", "Without a doubt.", "Yes definitely.",
                            "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.",
                            "Yes.", "Signs point to yes.", "Reply hazy, try again.", "Ask again later.",
                            "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.",
                            "Don't count on it.", "My reply is no.", "My sources say no.",
                            "Outlook not so good.", "Very doubtful."
                        };
                        String answer = answers[(int) (Math.random() * answers.length)];
                        chatMessage.setMessage("[SYSTEM] 🎱 " + user.getAnonymousName() + " asks: \"" + parts[1] + "\"\n👉 " + answer);
                    }
                    break;
                default:
                    chatMessage.setMessage(messageContent); // Treat unknown commands as normal text
            }
        } else {
            chatMessage.setMessage(messageContent);
        }

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
