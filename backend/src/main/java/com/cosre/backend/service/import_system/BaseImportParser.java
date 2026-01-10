package com.cosre.backend.service.import_system;

import com.alibaba.excel.EasyExcel;
import com.cosre.backend.exception.AppException;
import com.opencsv.bean.CsvToBeanBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.List;

public abstract class BaseImportParser<T> implements IimportParser<T> {
    protected abstract Class<T> getDtoClass();
    protected abstract void validate(List<T> data,Object... params);
    protected abstract void saveToDb(List<T> data, Object... params);
    protected boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    @Override
    public void execute(MultipartFile file, Object... params) {
        try {
            List<T> data;
            String name = file.getOriginalFilename();
            if (name != null && name.endsWith(".csv")) {
                try (Reader r = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
                    data = new CsvToBeanBuilder<T>(r).withType(getDtoClass()).build().parse();
                }
            } else {
                data = EasyExcel.read(file.getInputStream()).head(getDtoClass()).sheet().doReadSync();
            }

            validate(data,params);

            saveToDb(data, params);
        } catch (Exception e) {
            throw new AppException(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}