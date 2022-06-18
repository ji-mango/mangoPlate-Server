module.exports = {

    // Success
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },

    // Common
    TOKEN_EMPTY : { "isSuccess": false, "code": 2000, "message":"JWT 토큰을 입력해주세요." },
    TOKEN_VERIFICATION_FAILURE : { "isSuccess": false, "code": 3000, "message":"JWT 토큰 검증 실패" },
    TOKEN_VERIFICATION_SUCCESS : { "isSuccess": true, "code": 1001, "message":"JWT 토큰 검증 성공" },
    ACCESS_TOKEN_EMPTY : { "isSuccess": true, "code": 1002, "message":"accessToken을 입력해주세요." },

    //Request error
    SIGNUP_EMAIL_EMPTY : { "isSuccess": false, "code": 2001, "message":"이메일을 입력해주세요" },
    SIGNUP_EMAIL_LENGTH : { "isSuccess": false, "code": 2002, "message":"이메일은 50자리 미만으로 입력해주세요." },
    SIGNUP_EMAIL_ERROR_TYPE : { "isSuccess": false, "code": 2003, "message":"잘못된 메일주소입니다. 다시 입력해주세요." },
    SIGNUP_PASSWORD_EMPTY : { "isSuccess": false, "code": 2004, "message": "비밀번호를 입력 해주세요." },
    SIGNUP_PASSWORD_LENGTH : { "isSuccess": false, "code": 2005, "message":"비밀번호는 6~12자리를 입력해주세요." },
    SIGNUP_PASSWORD_ERROR_TYPE : { "isSuccess": false, "code": 2006, "message":"비밀번호를 다시 확인해주세요.(영문, 숫자 포함)" },
    SIGNUP_NICKNAME_EMPTY : { "isSuccess": false, "code": 2007, "message":"닉네임을 입력 해주세요." },
    SIGNUP_NICKNAME_LENGTH : { "isSuccess": false,"code": 2008,"message":"닉네임은 2~20자리를 입력해주세요." },
    SIGNUP_PASSWORDCHECK_WRONG : {"isSuccess": false,"code": 2009,"message":"비밀번호가 일치하지 않습니다.(비밀번호확인 오류)"},
    SIGNUP_PASSWORDCHECK_EMPTY : {"isSuccess": false,"code": 2010,"message":"비밀번호 확인칸을 입력해주세요."},

    SIGNIN_EMAIL_EMPTY : { "isSuccess": false, "code": 2011, "message":"이메일을 입력해주세요" },
    SIGNIN_EMAIL_LENGTH : { "isSuccess": false, "code": 2012, "message":"이메일은 30자리 미만으로 입력해주세요." },
    SIGNIN_EMAIL_ERROR_TYPE : { "isSuccess": false, "code": 2013, "message":"이메일을 형식을 정확하게 입력해주세요." },
    SIGNIN_PASSWORD_EMPTY : { "isSuccess": false, "code": 2014, "message": "비밀번호를 입력 해주세요." },

    USER_USERID_EMPTY : { "isSuccess": false, "code": 2015, "message": "userId를 입력해주세요." },

    USER_USEREMAIL_EMPTY : { "isSuccess": false, "code": 2017, "message": "이메일을 입력해주세요." },
    USER_USEREMAIL_NOT_EXIST : { "isSuccess": false, "code": 2018, "message": "해당 이메일을 가진 회원이 존재하지 않습니다." },
    USER_ID_NOT_MATCH : { "isSuccess": false, "code": 2019, "message": "유저 아이디 값을 확인해주세요" },
    USER_NICKNAME_EMPTY : { "isSuccess": false, "code": 2020, "message": "변경할 닉네임 값을 입력해주세요" },

    USER_STATUS_EMPTY : { "isSuccess": false, "code": 2021, "message": "회원 상태값을 입력해주세요" },

    AREA_EMPTY : { "isSuccess": false, "code": 2022, "message": "지역을 선택해주세요" },
    PAGE_EMPTY : { "isSuccess": false, "code": 2023, "message": "페이지를 입력해주세요" },
    FILTER_EMPTY : { "isSuccess": false, "code": 2024, "message": "필터값을 입력해주세요" },
    ORDER_EMPTY : { "isSuccess": false, "code": 2024, "message": "순서를 입력해주세요." },

    RESTAURANT_ID_EMPTY : {"isSuccess": false, "code": 2025, "message": "식당의 id를 입력해주세요."},
    SCORE_EMPTY : {"isSuccess": false, "code": 2026, "message": "필터를 모두 해제할 수 없어요."},
    SCORE_FILTER_ERROR : {"isSuccess": false, "code": 2027, "message": "good, soso, bad 필터를 잘못입력했습니다."},
    FILTER_ERROR : {"isSuccess": false, "code": 2028, "message": "필터를 잘못입력했습니다."},
    LOGIN_EMPTY : {"isSuccess": false, "code": 2029, "message": "로그인 하세요."},
    REVIEW_ID_NOT_EXIST : {"isSuccess": false, "code": 2030, "message": "존재하지않는 리뷰 id 입니다."},
    COMMENT_ID_NOT_EXIST : {"isSuccess": false, "code": 2031, "message": "존재하지않는 댓글 id 입니다."},
    CANNOT_REPLY_MINE : {"isSuccess": false, "code": 2032, "message": "자기 자신을 언급할 수 없습니다."},
    CANNOT_REPLY_DIFFERENT_REVIEW : {"isSuccess": false, "code": 2033, "message": "다른 리뷰입니다."},
    EATDEAL_ID_EMPTY : {"isSuccess": false, "code": 2034, "message": "해당하는 잇딜 id가 없습니다."},
    NOT_SOCIAL_USER : {"isSuccess": false, "code": 2035, "message": "소셜로그인 유저만 이메일을 바꿀 수 있습니다."},
    TITLE_EMPTY : {"isSuccess": false, "code": 2036, "message": "제목을 입력해주세요."},
    TITLE_LENGTH : {"isSuccess": false, "code": 2037, "message": "50자까지만 입력가능합니다."},
    CONTENT_LENGTH: {"isSuccess": false, "code": 2038, "message": "500자까지만 입력가능합니다."},
    SEARCH_EMPRY : {"isSuccess": false, "code": 2039, "message": "검색내용을 입력하세요."},
    PROFILE_IMAGE_EMPTY : {"isSuccess": false, "code": 2040, "message": "프로필 이미지를 설정해주세요."},
    CAN_NOT_FOLLOW_SELF : {"isSuccess": false, "code": 2041, "message": "자기자신을 팔로우할 수 없습니다."},
    RESTAURANT_NAME_EMPTY : {"isSuccess": false, "code": 2042, "message": "식당 이름을 입력해주세요."},
    LOCATION_EMPTY : {"isSuccess": false, "code": 2043, "message": "식당의 위치(위도,경도)를 입력해주세요."},
    LARGE_AREA_EMPTY : {"isSuccess": false, "code": 2044, "message": "지역의 큰 범위를 입력해주세요."},
    FOOD_TYPE_ERROR : {"isSuccess": false, "code": 2045, "message": "음식종류는 1~8사이에서 선택해주세요."},
    REVIEW_SCORE_EMPTY : {"isSuccess": false, "code": 2046, "message": "리뷰 평점을 입력해주세요."},
    REVIEW_CONTENT_EMPTY : {"isSuccess": false, "code": 2047, "message": "리뷰 내용을 입력해주세요."},
    REVIEW_CONTENT_LENGTH : {"isSuccess": false, "code": 2048, "message": "리뷰는 1~10000자만 가능합니다."},
    IS_LOCATION_EMPTY : {"isSuccess": false, "code": 2049, "message": "위치 허용 여부를 입력해주세요."},
    LOCATION_TYPE_ERROR  : {"isSuccess": false, "code": 2050, "message": "허용여부는 0 또는 1을 선택해주세요."},
    LONGITUDE_LATITUDE_ERROR : {"isSuccess": false, "code": 2051, "message": "위도 또는 경도를 입력하지 않았습니다."},
    PHONE_NUMBER_EMPTY : {"isSuccess": false, "code": 2052, "message": "핸드폰 번호를 입력해주세요."},
    VERIFIED_NUMBER_EMPTY : {"isSuccess": false, "code": 2053, "message": "인증번호를 입력해주세요."},
    FAIL_VERIFY : {"isSuccess": false, "code": 2054, "message": "인증번호가 만료되었거나 인증에 실패하셨습니다."},
    VERIFY_NUMBER_NOT_MATCH : {"isSuccess": false, "code": 2055, "message": "인증번호 또는 입력하신 정보가 틀렸습니다."},
    USER_NOT_MATCH : {"isSuccess": false, "code": 2056, "message": "인증번호를 받은 유저가 아닙니다."},
    PHONE_NUMBER_ERROR_TYPE : {"isSuccess": false, "code": 2057, "message": "올바르지 않은 형식의 전화번호입니다."},
    SMS_SEND_ERROR : {"isSuccess": false, "code": 2058, "message": "본인인증 문자발송에 실패했습니다."},
    COMMENT_CONTENT_EMPTY : {"isSuccess": false, "code": 2059, "message": "댓글의 내용을 입력해주세요."},
    EMAIL_SEND_ERROR : {"isSuccess": false, "code": 2059, "message": "이메일 발송에 실패했습니다."},


    // Response error
    SIGNUP_REDUNDANT_EMAIL : { "isSuccess": false, "code": 3001, "message":"이미 가입된 메일주소 입니다." },

    SIGNIN_EMAIL_WRONG : { "isSuccess": false, "code": 3002, "message": "아이디가 잘못 되었습니다." },
    SIGNIN_PASSWORD_WRONG : { "isSuccess": false, "code": 3003, "message": "비밀번호가 잘못 되었습니다." },
    SIGNIN_INACTIVE_ACCOUNT : { "isSuccess": false, "code": 3004, "message": "비활성화 된 계정입니다.." },
    SIGNIN_WITHDRAWAL_ACCOUNT : { "isSuccess": false, "code": 3005, "message": "이미 탈퇴 된 계정입니다." },


    RESTAURANT_NOT_EXIST : { "isSuccess": false, "code": 3006, "message": "해당하는 가게가 존재하지 않습니다." },
    WITHDRAWAL_INACTIVE_ACCOUNT : {"isSuccess": false, "code": 3007, "message": "이미 탈퇴되거나 비활성화된 계정입니다."},
    LIST_NOT_EXIST :  { "isSuccess": false, "code": 3008, "message": "해당하는 리스트가 존재하지 않습니다." },
    LIST_USER_NOT_MATCH : { "isSuccess": false, "code": 3009, "message": "리스트를 만든 유저가 아닙니다." },
    LIST_ALREADY_DELETE : { "isSuccess": false, "code": 3010, "message": "이미 삭제된 리스트입니다." },
    LIST_RESTAURANT_NOT_MATCH : { "isSuccess": false, "code": 3011, "message": "입력한 리스트에 해당 식당이 존재하지 않습니다." },
    LIST_ALREADY_EXIST : { "isSuccess": false, "code": 3012, "message": "리스트에 해당 식당이 이미 존재합니다." },
    AREA_NOT_EXIST : { "isSuccess": false, "code": 3013, "message": "해당하는 지역이 없습니다." },
    USER_USERID_NOT_EXIST : { "isSuccess": false, "code": 3014, "message": "해당 회원이 존재하지 않습니다." },
    RESTAURANT_USER_NOT_MATCH : { "isSuccess": false, "code": 3015, "message": "식당을 등록한 유저가 아닙니다." },


    //Connection, Transaction 등의 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},
 
 
}
