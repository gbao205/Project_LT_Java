package com.cosre.backend.service;

import com.cosre.backend.entity.Role;
import com.cosre.backend.entity.User;
import com.cosre.backend.exception.AppException;
import com.cosre.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class StaffService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String DEFAULT_DOMAIN = "collabsphere.edu.vn";
    private static final String DEFAULT_PASSWORD = "123";
    /**
     * @param file CSV chứa fullName
     * @param targetRole Vai trò (lecture,student)
     * @return danh sách user tạo thành công
     */

    @Transactional
    public List<User> importUserFromFile(MultipartFile file, Role targetRole){
        String fname=file.getOriginalFilename();
        if(fname== null||(!fname.endsWith(".csv")&&!fname.endsWith(".txt"))){
            throw new AppException("File không đúng định dạng. Chỉ chấp nhận CSV/TXT",HttpStatus.BAD_REQUEST);
        }

        List<User> importUser= new ArrayList<>();
        Set<String> newEmail = new HashSet<String>();
        try(BufferedReader fread =new BufferedReader(new InputStreamReader(file.getInputStream(),"UTF-8")) )
        {
            String line;
            fread.readLine();

            while((line = fread.readLine())!= null)
            {
                String [] data =  line.split(",");
                if(data.length<1 || data[0].trim().isEmpty()){
                    continue;
                }
                String fullName=data[0].trim();
                String finalEmail= UniqueEmail(fullName,DEFAULT_DOMAIN,newEmail);

                newEmail.add(finalEmail);

                User newUser = User.builder()
                        .email(finalEmail)
                        .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                        .fullName(fullName)
                        .role(targetRole)
                        .active(true)
                        .build();
                importUser.add(newUser);
            }

            userRepository .saveAll(importUser);
            return importUser;
        }
        catch(IOException e){
            throw new AppException("Lỗi đọc file" + e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    private String  UniqueEmail(String fullName,String domain,Set<String> newEmail){
        String baseName= normalizename(fullName);
        String finalEmail= baseName + "@" + domain;

        int c=0;

        while(userRepository.existsByEmail(finalEmail)|| newEmail.contains(finalEmail)){
            c++;
            finalEmail = baseName + c + "@" + domain;
        }
        return finalEmail;
    }

    private String normalizename(String fullName){
        String temp = Normalizer.normalize(fullName, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        String normalized = temp.trim().replaceAll("\\s+", " ").toLowerCase();
        List<String> parts = Arrays.asList(normalized.split(" "));

        if(parts.size() < 1) return "unknown";

        String ten=parts.get(parts.size() - 1);
        String hodem=String.join("", parts.subList(0, parts.size() -1));

        if(hodem.isEmpty()){
            return ten;
        }
        return ten+hodem;
    }
    public List<User> getAllUser (String keyword){
        List<Role> allowrole= Arrays.asList(Role.LECTURER,Role.STUDENT);
        List<User> allUsers = userRepository.findAll();
        List<User> fillterUser= allUsers.stream()
                .filter(user -> allowrole.contains(user.getRole()))
                .filter(user -> {
                    if(keyword==null || keyword.isEmpty()) {return true;}
                    String lower = keyword.toLowerCase();
                    return user.getFullName().toLowerCase().contains(lower)||
                            user.getEmail().toLowerCase().contains(lower);
                })
                .collect(Collectors.toList());
        return fillterUser;
    }
}
