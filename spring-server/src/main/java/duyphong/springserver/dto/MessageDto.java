package duyphong.springserver.dto;


import lombok.Data;

@Data
public class MessageDto {
    private String message;
    private String sender;
    private String receiver;
    private String time;
}
