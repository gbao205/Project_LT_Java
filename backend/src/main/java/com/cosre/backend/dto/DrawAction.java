package com.cosre.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DrawAction {
    private String type; // "START", "DRAW", "END", "CLEAR"
    private String sender;
    private String recipient;
    private List<Double> points; // Danh sách tọa độ [x1, y1, x2, y2...]
    private String color;
    private int strokeWidth;
}