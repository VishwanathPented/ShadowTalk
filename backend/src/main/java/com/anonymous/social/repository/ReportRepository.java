package com.anonymous.social.repository;

import com.anonymous.social.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findAllByOrderByCreatedAtDesc();

    @Modifying
    @Query("DELETE FROM Report r WHERE r.reportedPost.id = :postId")
    void deleteByReportedPostId(@Param("postId") Long postId);

    @Modifying
    @Query("DELETE FROM Report r WHERE r.reportedMessage.id = :messageId")
    void deleteByReportedMessageId(@Param("messageId") Long messageId);
}
