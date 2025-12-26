package com.anonymous.social.model;

import jakarta.persistence.*;

@Entity
@Table(name = "banned_words")
public class BannedWord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String word;

    @Column(columnDefinition = "integer default 5")
    private int banDurationMinutes = 5;

    public BannedWord() {}

    public BannedWord(String word, int banDurationMinutes) {
        this.word = word;
        this.banDurationMinutes = banDurationMinutes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getWord() { return word; }
    public void setWord(String word) { this.word = word; }

    public int getBanDurationMinutes() { return banDurationMinutes; }
    public void setBanDurationMinutes(int banDurationMinutes) { this.banDurationMinutes = banDurationMinutes; }
}
