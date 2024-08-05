package duyphong.springserver.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FileDto {
    private String filename;
    private byte[] fileData;
}
