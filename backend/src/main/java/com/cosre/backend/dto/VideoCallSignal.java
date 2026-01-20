package com.cosre.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VideoCallSignal {
    private String type; // "OFFER", "ANSWER", "ICE_CANDIDATE", "HANGUP"
    private String sender;
    private String recipient;
    private Object data; // Chứa SDP hoặc ICE Candidate (dạng JSON object)
}