package duyphong.springserver.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import duyphong.springserver.dto.FileDto;
import duyphong.springserver.dto.MessageDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;


@RestController
@CrossOrigin(origins = "*")
public class FileUploadController {
    @Autowired
    private SimpMessagingTemplate template;

    @PostMapping("/upload")
    public void uploadFile(@RequestParam("file") MultipartFile file,@RequestPart("messageDto") String messageDtoJson) {
        if (!file.isEmpty()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                MessageDto messageDto = objectMapper.readValue(messageDtoJson, MessageDto.class);

                byte[] fileData = file.getBytes();
                String base64FileData = Base64.getEncoder().encodeToString(fileData);
                messageDto.setFileData(base64FileData);
                messageDto.setFilename(file.getOriginalFilename());
                template.convertAndSend("/chatroom/public",  messageDto);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
