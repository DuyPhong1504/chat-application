package duyphong.springserver.controller;

import duyphong.springserver.dto.MessageDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {
    @Autowired
    private SimpMessagingTemplate template;

    @MessageMapping("/message")
    @SendTo("room")
    public ResponseEntity<MessageDto> sendMessage(@Payload MessageDto message) {
        return ResponseEntity.ok(message);
    }
}
