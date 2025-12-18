package com.anonymous.social.model;

import jakarta.persistence.*;

@Entity
@Table(name = "group_members")
public class GroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private SocialGroup group;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public GroupMember() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SocialGroup getGroup() { return group; }
    public void setGroup(SocialGroup group) { this.group = group; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
