package com.cosre.backend.service.import_system;

import org.springframework.web.multipart.MultipartFile;

public interface IimportParser<T> {
    void execute(MultipartFile file, Object... params);

}
