package com.minecraft.chat.repository;

import com.minecraft.chat.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    @Query("SELECT m FROM Message m ORDER BY m.timestamp ASC")
    List<Message> findAllOrderByTimestamp();
    
    List<Message> findTop50ByOrderByTimestampDesc();
}