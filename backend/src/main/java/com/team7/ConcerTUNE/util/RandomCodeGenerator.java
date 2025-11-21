package com.team7.ConcerTUNE.util;

import java.security.SecureRandom;
import java.util.stream.IntStream;

public class RandomCodeGenerator {

    private static final String CHAR_LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String CHAR_UPPER = CHAR_LOWER.toUpperCase();
    private static final String NUMBER = "1234567890";

    private static final String DATA_FOR_RANDOM_CODE = CHAR_LOWER + CHAR_UPPER + NUMBER;

    private static final SecureRandom RANDOM = new SecureRandom();

    private RandomCodeGenerator() {
    }

    public static String generateRandomCode(int length) {
        if (length <= 0) {
            return "";
        }

        return IntStream.range(0, length)
                .mapToObj(i -> String.valueOf(DATA_FOR_RANDOM_CODE.charAt(
                        RANDOM.nextInt(DATA_FOR_RANDOM_CODE.length())
                )))
                .collect(StringBuilder::new, StringBuilder::append, StringBuilder::append)
                .toString();
    }
}