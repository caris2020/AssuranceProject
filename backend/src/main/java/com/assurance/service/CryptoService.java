package com.assurance.service;

import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;

@Service
public class CryptoService {
    private final SecureRandom secureRandom = new SecureRandom();

    // NOTE: In production, store and rotate keys using a KMS. Here we use a static demo key.
    private final byte[] keyBytes;

    public CryptoService() {
        // 32 bytes (256-bit) static demo key
        this.keyBytes = "0123456789ABCDEF0123456789ABCDEF".getBytes();
    }

    public byte[] randomIv() {
        byte[] iv = new byte[12]; // 96-bit nonce for GCM
        secureRandom.nextBytes(iv);
        return iv;
    }

    public byte[] encrypt(byte[] iv, byte[] plain) {
        try {
            SecretKey key = new SecretKeySpec(keyBytes, "AES");
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, iv));
            return cipher.doFinal(plain);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    public byte[] decrypt(byte[] iv, byte[] cipherText) {
        try {
            SecretKey key = new SecretKeySpec(keyBytes, "AES");
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, iv));
            return cipher.doFinal(cipherText);
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }
}


