package com.anonymous.social;

import com.anonymous.social.model.User;
import com.anonymous.social.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class PostIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setup() {
        // Create a test user in DB because PostService looks it up by email
        if (userRepository.findByEmail("test@example.com").isEmpty()) {
            User user = new User();
            user.setEmail("test@example.com");
            user.setPassword("password");
            user.setAnonymousName("ShadowUser");
            user.setCreatedAt(LocalDateTime.now());
            userRepository.save(user);
        }
    }

    @Test
    @WithMockUser(username = "test@example.com", password = "password")
    public void testCreateAndRetrievePost() throws Exception {
        // 1. Create Post
        String content = "Integration Test Post Content " + System.currentTimeMillis();

        System.out.println("TEST: Sending POST request to create post");
        mockMvc.perform(post("/api/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"content\": \"" + content + "\"}"))
                .andDo(print())
                .andExpect(status().isOk());

        // 2. Retrieve Posts
        System.out.println("TEST: Sending GET request to retrieve posts");
        mockMvc.perform(get("/api/posts"))
                .andDo(print())
                .andExpect(status().isOk())
                // Verify the latest post is the one we just created (assuming it's at the top due to sorting)
                .andExpect(jsonPath("$[0].content").value(content));
    }
}
