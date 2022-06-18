const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const regexEmail = require("regex-email");
const {emit} = require("nodemon");
const passport = require('../../../node_modules/passport');
const KaKaoStrategy = require('../../../node_modules/passport-kakao').Strategy;
const jwt = require("jsonwebtoken");
const secret_config = require("../../../config/secret");
const axios = require("../../../node_modules/axios");
const { logger } = require("../../../config/winston");

const Cache = require('memory-cache');
const CryptoJS = require('crypto-js');

/**
 * API No. 1
 * API Name : 유저 생성 (회원가입) API
 * [POST] /app/users
 */
exports.postUsers = async function (req, res) {

    /**
     * Body: email, password, passwordCheck, nickname
     */
    const {email, password, passwordCheck, nickname} = req.body;

    // 빈 값 체크
    if (!email)
        return res.send(response(baseResponse.SIGNUP_EMAIL_EMPTY));
    if(!password)
        return res.send(response(baseResponse.SIGNUP_PASSWORD_EMPTY));
    if(!passwordCheck)
        return res.send(response(baseResponse.SIGNUP_PASSWORDCHECK_EMPTY));
    if(!nickname)
        return res.send(response(baseResponse.SIGNUP_NICKNAME_EMPTY));

    // 길이 체크
    if (email.length > 50)
        return res.send(response(baseResponse.SIGNUP_EMAIL_LENGTH));
    if (password.length >12 || password.length <6)
        return res.send(response(baseResponse.SIGNUP_PASSWORD_LENGTH));
    if(nickname.length<2 || nickname.length>20)
        return res.send(response(baseResponse.SIGNUP_NICKNAME_LENGTH));

    // 형식 체크 (by 정규표현식)
    if (!regexEmail.test(email))
        return res.send(response(baseResponse.SIGNUP_EMAIL_ERROR_TYPE));
    const pattern = /^.*(?=.{6,20})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;
    if(!pattern.test(password))
    {
        return res.send(response(baseResponse.SIGNUP_PASSWORD_ERROR_TYPE));
    }

    //패스워드 확인 체크
    if(password!=passwordCheck)
        return res.send(response(baseResponse.SIGNUP_PASSWORDCHECK_WRONG));

    const signUpResponse = await userService.createUser(
        email,
        password,
        nickname
    );

    return res.send(signUpResponse);
};

/**
 * API No. 2
 * API Name : 랜덤 유저 조회 API
 * [GET] /users
 */
exports.getUsers = async function (req, res) {
    const userListResult = await userProvider.userList();
    return res.send(response(baseResponse.SUCCESS,userListResult));
};

/**
 * API No. 3
 * API Name : 특정 유저 조회 API
 * [GET] /users/:userId
 */
exports.getUser = async function (req, res) {
    const userId = req.params.userId;
    const userIdFromJWT = req.verifiedToken.userId;

    //조회하려는 유저아이디가 내 아이디일 경우 비공개도 보이도록
    let condition = '';
    if (userIdFromJWT != userId) {
        condition += 'and ugr.isOpen = 0'
    }
    const retrieveUserResult = await userProvider.retrieveUserInformation(userId, condition);
    return res.send(retrieveUserResult);
};



/**
 * API No. 4
 * API Name : 로그인 API
 * [POST] /app/login
 * body : email, passsword
 */
exports.login = async function (req, res) {

    const {email, password} = req.body;

    // password 형식적 Validation
    //빈 값 확인
    if (!email)
        return res.send(response(baseResponse.SIGNIN_EMAIL_EMPTY));
    if(!password)
        return res.send(response(baseResponse.SIGNIN_PASSWORD_EMPTY));

    const signInResponse = await userService.postSignIn(email, password);

    return res.send(signInResponse);
};

/**
 * API No. 5
 * API Name : 카카오 로그인
 * [POST] /users/kakao-login
 */
exports.kakaoLogin = async function (req, res) {
    const {accessToken} = req.body;
    try {
        let kakao_profile;
    if(!accessToken) {
        return res.send(response(baseResponse.ACCESS_TOKEN_EMPTY));
    }
        try {
            kakao_profile = await axios.get('https://kapi.kakao.com/v2/user/me',
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
        }catch (err) {
            logger.error(`Can't get kakao profile\n: ${JSON.stringify(err)}`);
            return
        }

        const email = kakao_profile.data.kakao_account.email;
    const nickname = kakao_profile.data.properties.nickname;
    const password = 'kakao';

    // 이메일 여부 확인
    const emailRows = await userProvider.emailCheck(email);

    //없으면 회원가입 후 로그인
    if (emailRows.length == 0) {
        const kakaoSignup = await userService.createUser(
            email,
            password,
            nickname
        );
        const signInResponse = await userService.postSignIn(email, password);
        return res.send(signInResponse);
    }

    //있으면 로그인
    else if(emailRows.length == 1) {
        const signInResponse = await userService.postSignIn(email, password);
        return res.send(signInResponse);
    }} catch (err) {
        logger.error(`App - logInKakao Query error\n: ${JSON.stringify(err)}`);
        return
    }

}


/**
 * API No. 6
 * API Name : 회원 정보 수정(이름)
 * [PATCH] /users/:userId/nickname
 * path variable : userId
 * body : nickname
 */
exports.patchName = async function (req, res) {
    const userIdFromJWT = req.verifiedToken.userId

    const userId = req.params.userId;
    const nickname = req.body.nickname;

    if (userIdFromJWT != userId) {
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        if (!nickname) return res.send(errResponse(baseResponse.USER_NICKNAME_EMPTY));
    }
    //길이 체크
    if(nickname.length<2 || nickname.length>20)
        return res.send(response(baseResponse.SIGNUP_NICKNAME_LENGTH));

    const editNameResult = await userService.editName(userId, nickname)
    return res.send(editNameResult);
};

/**
 * API No. 7
 * API Name : 회원 정보 수정 API(이메일)
 * [PATCH] /users/:userId/email
 * path variable : userId
 * body : email
 */
exports.patchEmail = async function (req, res) {
    const userIdFromJWT = req.verifiedToken.userId

    const userId = req.params.userId;
    const email = req.body.email;

    if (userIdFromJWT != userId) {
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    } else {
        if (!email) return res.send(errResponse(baseResponse.USER_USEREMAIL_EMPTY));
    }
    //길이 체크
    if (email.length > 50)
        return res.send(response(baseResponse.SIGNUP_EMAIL_LENGTH));
    // 형식 체크 (by 정규표현식)
    if (!regexEmail.test(email))
        return res.send(response(baseResponse.SIGNUP_EMAIL_ERROR_TYPE));

    const editEmailResult = await userService.editEmail(userId, email)
    return res.send(editEmailResult);
};

/**
 * API No. 8
 * API Name : 문자 인증번호 요청 API
 * [PATCH] /users/:userId/phone-number
 */
const NCP_serviceID = 'ncp:sms:kr:271181770286:mango_plate';
const NCP_accessKey = '26mVAwxoSmzl5RrF2ECr';
const NCP_secretKey = 'p9nsKkjjhypSVsZFzr44ewUUANda1akjBa5hegjG';

const date = Date.now().toString();
const uri = NCP_serviceID;
const secretKey = NCP_secretKey;
const accessKey = NCP_accessKey;
const method = 'POST';
const space = " ";
const newLine = "\n";
const url = `https://sens.apigw.ntruss.com/sms/v2/services/${uri}/messages`;
const url2 = `/sms/v2/services/${uri}/messages`;

const  hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);

hmac.update(method);
hmac.update(space);
hmac.update(url2);
hmac.update(newLine);
hmac.update(date);
hmac.update(newLine);
hmac.update(accessKey);

const hash = hmac.finalize();
const signature = hash.toString(CryptoJS.enc.Base64);

exports.verifyPhoneNumber = async function (req, res) {
    const phoneNumber = req.body.phoneNumber;
    const userIdFromJWT = req.verifiedToken.userId;
    const userId = req.params.userId;

    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!phoneNumber)
        res.send(errResponse(baseResponse.PHONE_NUMBER_EMPTY));
    if(phoneNumber.length != 11) {
        res.send(errResponse(baseResponse.PHONE_NUMBER_ERROR_TYPE));
    }


    Cache.del(phoneNumber);   //인증번호 다시 요청할 경우를 위해
    Cache.del(userId);

    //인증번호 생성(랜덤 4자리)
    const verifyCode = Math.floor(Math.random() * (9999 - 1000)) + 1000;

    Cache.put(phoneNumber, verifyCode.toString(), 180000);
    Cache.put(userId, verifyCode.toString(), 180000);
    console.log(url);
    axios({
        method: method,
        json: true,
        url: url,
        headers: {
            'Content-Type': 'application/json',
            'x-ncp-iam-access-key': accessKey,
            'x-ncp-apigw-timestamp': date,
            'x-ncp-apigw-signature-v2': signature,
        },
        data: {
            type: 'SMS',
            contentType: 'COMM',
            countryCode: '82',
            from: '01050429615',
            content: `[Mangoplate] 인증번호 [${verifyCode}]를 입력해주세요.`,
            messages: [
                {
                    to: `${phoneNumber}`,
                },
            ],
        },
    })
        .then(function (res) {
            res.send(response(baseResponse.SUCCESS));
        })
        .catch((err) => {
            if (err.res == undefined) {
                res.send(response(baseResponse.SUCCESS));
            } else res.send(errResponse(baseResponse.SMS_SEND_ERROR));
        });

};

/**
 * API No. 9
 * API Name : 인증+회원정보 수정 API
 * [PATCH] /users/:userId/phone-number/verify
 */
exports.verify = async function (req, res) {
    const phoneNumber = req.body.phoneNumber;
    const verifyCode = req.body.verifyCode;
    const userIdFromJWT = req.verifiedToken.userId;
    const userId = req.params.userId;

    if (userIdFromJWT != userId)
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    if (!phoneNumber)
        res.send(errResponse(baseResponse.PHONE_NUMBER_EMPTY))
    if(phoneNumber.length != 11) {
        res.send(errResponse(baseResponse.PHONE_NUMBER_ERROR_TYPE));
    }
    if (!verifyCode)
        res.send(errResponse(baseResponse.VERIFIED_NUMBER_EMPTY))

    const CacheData = Cache.get(phoneNumber);
    const CacheUserData = Cache.get(userId);

    if (!CacheData) {
        return res.send(errResponse(baseResponse.FAIL_VERIFY));
    } else if (CacheData !== verifyCode) {
        return res.send(errResponse(baseResponse.VERIFY_NUMBER_NOT_MATCH));
    } else if (CacheUserData !== verifyCode) {
        return res.send(errResponse(baseResponse.USER_NOT_MATCH));
    }
    else {
        Cache.del(phoneNumber);
        Cache.del(userId);
        const updatePhoneNumberResult = userService.updatePhoneNumber(userId, phoneNumber);
        return res.send(response(baseResponse.SUCCESS));
    }
};

/**
 * API No. 10
 * API Name : 회원 탈퇴 API
 * [PATCH] /users/:userId/withdrawal
 * path variable : userId
 */
exports.patchWithdrawal = async function (req, res) {
    const userIdFromJWT = req.verifiedToken.userId

    const userId = req.params.userId;

    if (userIdFromJWT != userId) {
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }

    const withdrawUserResult = await userService.withdrawUser(userId)
    return res.send(withdrawUserResult);
};

/**
 * API No. 11
 * API Name : 특정 유저 가고싶다 리스트 조회 API
 * [GET] /users/:userId/follower
 */
exports.getHopeList = async function (req, res) {
    const userIdFromJWT = req.verifiedToken.userId;
    const userId = req.params.userId;
    var area = req.query.area;
    const order = req.query.order;
    let food = req.query.food;
    let price = req.query.price;
    const park = req.query.park;

    //빈값 체크
    if(!area)
        return res.send(errResponse(baseResponse.AREA_EMPTY));
    if(!food)
        food = '9';
    if(!price)
        price = '5';

    let hopeListResult;

    //내정보 검색인지 다른사람정보 검색인지 구분
    if(userId != userIdFromJWT) {
        hopeListResult = await userProvider.userHopeList(userId, area, order, food, price, park)
    }
    else {
        hopeListResult = await userProvider.myHopeList(userIdFromJWT, area, order, food, price, park);
    }
    return res.send(hopeListResult);
};

/**
 * API No. 12
 * API Name : 특정유저 마이리스트 조회 API
 * [GET] /users/:userId/my-lists
 */
exports.getMyLists = async function (req, res) {
    const userId = req.params.userId;

    const MyListResult = await userProvider.myList(userId);
    return res.send(MyListResult);
};

/**
 * API No. 13
 * API Name : 특정유저 리뷰조회 API
 * [GET] /users/:userId/review
 */
exports.getMyReviews = async function(req, res) {
    const area = req.query.area;
    const good = req.query.good;
    const soso = req.query.soso;
    const bad = req.query.bad;
    let userIdFromJWT = req.verifiedToken.userId;
    let userId = req.params.userId;

    if(userId == userIdFromJWT)
        userId = userIdFromJWT;

    console.log(area);
    if(!good && !soso && !bad) {
        return res.send(response(baseResponse.SCORE_EMPTY))
    }
    if(!area) {
        return res.send(response(baseResponse.AREA_EMPTY))
    }
    const myReviewListResult = await userProvider.myReviewList(area, good, soso, bad, userId);
    return res.send(myReviewListResult);
}

/**
 * API No. 14
 * API Name : 팔로우 버튼 API
 * [POST] /users/:userId/follow
 */
exports.postFollow = async function (req, res) {
    const followUserId = req.params.userId;
    const myUserId = req.verifiedToken.userId;

    if(myUserId == followUserId)
        return res.send(errResponse(baseResponse.CAN_NOT_FOLLOW_SELF))

    const updateFollowResult = await userService.updateFollow(followUserId, myUserId);
    return res.send(updateFollowResult);
};

/**
 * API No. 15
 * API Name : 팔로워 목록 조회 API
 * [GET] /users/:userId/follower
 */
exports.getFollower = async function (req, res) {
    const userId = req.params.userId;

    const followerListResult = await userProvider.followerList(userId);
    return res.send(followerListResult);
};

/**
 * API No. 16
 * API Name : 프로필 사진 설정 API
 * [PATCH] /users/:userId/profileImage
 */
exports.setProfileImage = async function (req, res) {
    const userId = req.params.userId;
    const userIdFromJWT = req.verifiedToken.userId;
    const {image} = req.body;

    //정보맞는지 확인
    if (userIdFromJWT != userId) {
        return res.send(errResponse(baseResponse.USER_ID_NOT_MATCH));
    }
    if(!image) {
        return res.send(errResponse(baseResponse.PROFILE_IMAGE_EMPTY))
    }

    const updateProfileImageResult = await userService.updateProfileImage(userId,image);
    return res.send(updateProfileImageResult);
};

/**
 * API No. 17
 * API Name : 위치정보 허용 API
 * [PATCH] /users/:userId/profileImage
 */
exports.postLocation = async function (req, res) {
    const isLocation = req.query.isLocation;    //0이면 허용 x, 1이면 허용 o
    let {latitude, longitude} = req.body;

    //빈값, 0또는 1 체크
    if(!isLocation)
        return res.send(errResponse(baseResponse.IS_LOCATION_EMPTY))
    else if(isLocation != 0 && isLocation !=1)
        return res.send(errResponse(baseResponse.LOCATION_TYPE_ERROR))

    if(isLocation == 1) {
        if(!latitude || !longitude)
            return res.send(errResponse(baseResponse.LONGITUDE_LATITUDE_ERROR))
    }
    const updateLocationResult = await userService.updateLocation(isLocation, latitude, longitude);
    return res.send(updateLocationResult);
};

/**
 * API No. 18
 * API Name : 팔로잉 목록 조회 API
 * [GET] /users/:userId/following
 */
exports.getFollowing = async function (req, res) {
    const userId = req.params.userId;

    const followingListResult = await userProvider.followingList(userId);
    return res.send(followingListResult);
};

const crypto = require('crypto');
const {smtpTransport} = require('../../../config/email');

/**
 * API No. 48
 * API Name : 이메일 인증 요청 API
 * [POST] /users/email/verify
 */
 exports.email = async function (req,res) {
    const email = req.body.email;

    Cache.del(email);
    
    //빈값 체크
    if(!email)
        return res.send(errResponse(baseResponse.USER_USEREMAIL_EMPTY))
    // 형식 체크 (by 정규표현식)
    if (!regexEmail.test(email))
        return res.send(response(baseResponse.SIGNUP_EMAIL_ERROR_TYPE));
    //길이 체크
    if (email.length > 50)
        return res.send(response(baseResponse.SIGNUP_EMAIL_LENGTH));

    //이메일 중복 체크
     const emailRows = await userProvider.emailCheck(email);
     if (emailRows.length > 0)
         return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);

    const token = crypto.randomBytes(20).toString('hex'); // token 생성
    const data = { // 데이터 정리
        token
    };

    Cache.put(email, token);

    const mailOptions = {
        from: "susie000301@naver.com",
        to: `${email}`,
        subject: "망고플레이트 인증메일",
        text: "안녕하세요,\n 망고플레이트 입니다!\n 망고플레이트 이메일 가입을 위해\n이메일 인증을 진행해주세요.\n"
            + `https://prod.jimango.shop/veify/${token}`
    };

    await smtpTransport.sendMail(mailOptions, (error, responses) =>{
        if(error){
            res.send(errResponse(baseResponse.EMAIL_SEND_ERROR))
        }else{
            res.send(response(baseResponse.SUCCESS));
        }
        smtpTransport.close();
    });
};

/**
 * API No.49
 * API Name : 이메일 인증 회원가입 API
 * [POST] /users/email/user
 */
exports.postEmailUser = async function (req, res) {
    const {email, password, passwordCheck, nickname} = req.body;
    const token = req.headers['token']

    // 빈 값 체크
    if (!email)
        return res.send(response(baseResponse.SIGNUP_EMAIL_EMPTY));
    if(!password)
        return res.send(response(baseResponse.SIGNUP_PASSWORD_EMPTY));
    if(!passwordCheck)
        return res.send(response(baseResponse.SIGNUP_PASSWORDCHECK_EMPTY));
    if(!nickname)
        return res.send(response(baseResponse.SIGNUP_NICKNAME_EMPTY));

    // 길이 체크
    if (email.length > 50)
        return res.send(response(baseResponse.SIGNUP_EMAIL_LENGTH));
    if (password.length >12 || password.length <6)
        return res.send(response(baseResponse.SIGNUP_PASSWORD_LENGTH));
    if(nickname.length<2 || nickname.length>20)
        return res.send(response(baseResponse.SIGNUP_NICKNAME_LENGTH));

    // 형식 체크 (by 정규표현식)
    if (!regexEmail.test(email))
        return res.send(response(baseResponse.SIGNUP_EMAIL_ERROR_TYPE));
    const pattern = /^.*(?=.{6,20})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;
    if(!pattern.test(password))
    {
        return res.send(response(baseResponse.SIGNUP_PASSWORD_ERROR_TYPE));
    }

    //패스워드 확인 체크
    if(password!=passwordCheck)
        return res.send(response(baseResponse.SIGNUP_PASSWORDCHECK_WRONG));
    const CacheData = Cache.get(email)

    if (!CacheData) {
        return res.send(errResponse(baseResponse.FAIL_VERIFY));
    } else if (CacheData !== token) {
        return res.send(errResponse(baseResponse.VERIFY_NUMBER_NOT_MATCH));
    }
    else {
        Cache.del(email);
        const signUpResponse = await userService.createUser(
            email,
            password,
            nickname
        );
        return res.send(signUpResponse);
    }
};

/**
 * API No.
 * API Name : 특정유저 북마크 개수 조회 API
 * [GET] /users/:userId/bookmark
 */
// exports.getBookmark = async function (req, res) {
//     const userId = req.params.userId;
//
//     const getBokkmarkListResult = await userProvider.getBookmarkList(userId);
//
//     return res.send(getBokkmarkListResult);
// };

/** JWT 토큰 검증 API
 * [GET] /app/auto-login
 */
exports.check = async function (req, res) {
    const userIdResult = req.verifiedToken.userId;
    console.log(userIdResult);
    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS));
};
