package duyphong.springserver.dto;


import duyphong.springserver.common.Condition;
import lombok.Data;

@Data
public class MessageDto {
    private String senderName;
    private String receiverName;
    private String message;
    private String date;
    private Condition status;
}
