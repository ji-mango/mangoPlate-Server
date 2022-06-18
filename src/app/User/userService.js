const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.createUser = async function (email, password, nickname) {
    try {
        // 이메일 중복 확인
        const emailRows = await userProvider.emailCheck(email);
        if (emailRows.length > 0)
            return errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);

        // 비밀번호 암호화
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(password)
            .digest("hex");

        const insertUserInfoParams = [email, hashedPassword, nickname];

        const connection = await pool.getConnection(async (conn) => conn);

        const userIdResult = await userDao.insertUserInfo(connection, insertUserInfoParams);
        console.log(`추가된 회원 : ${userIdResult[0].insertId}`)
        connection.release();
        return response(baseResponse.SUCCESS);


    } catch (err) {
        logger.error(`App - createUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


// TODO: After 로그인 인증 방법 (JWT)
exports.postSignIn = async function (email, password) {
    try {
        // 이메일 여부 확인
        const emailRows = await userProvider.emailCheck(email);
        if (emailRows.length < 1) return errResponse(baseResponse.SIGNIN_EMAIL_WRONG);

        const selectEmail = emailRows[0].email

        // 비밀번호 확인
        const hashedPassword = await crypto
            .createHash("sha512")
            .update(password)
            .digest("hex");

        const selectUserPasswordParams = [selectEmail, hashedPassword];
        const passwordRows = await userProvider.passwordCheck(selectUserPasswordParams);

        if (passwordRows[0].password !== hashedPassword) {
            return errResponse(baseResponse.SIGNIN_PASSWORD_WRONG);
        }

        // 계정 상태 확인
        const userInfoRows = await userProvider.accountCheck(email);

        if (userInfoRows[0].status === 2) {
            return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
        } else if (userInfoRows[0].status === 1) {
            return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
        }

        console.log(userInfoRows[0].id) // DB의 userId

        //토큰 생성 Service
        let token = await jwt.sign(
            {
                userId: userInfoRows[0].id,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "userInfo",
            } // 유효 기간 365일
        );

        return response(baseResponse.SUCCESS, {'userId': userInfoRows[0].id, 'jwt': token});

    } catch (err) {
        logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.editName = async function (id, nickname) {
    try {
        console.log(id)
        const connection = await pool.getConnection(async (conn) => conn);
        const updateNameinfoResult = await userDao.updateNameinfo(connection, id, nickname)
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editName Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//휴대폰 인증한 번호 update
exports.updatePhoneNumber = async function(userId, phoneNumber) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const updatePhoneNumberInfoResult = userDao.updatePhoneNumberInfo(connection, userId, phoneNumber);
        connection.release();

        return updatePhoneNumberInfoResult;

    } catch(err) {
        logger.error(`App - updatePhoneNumber Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }

}

exports.editEmail = async function (id, email) {
    try {
        console.log(id)
        const socialCheckResult = await userProvider.socialCheck(id);
        if(socialCheckResult[0].isSocial == 0) {
            return errResponse(baseResponse.NOT_SOCIAL_USER);
        }

        const connection = await pool.getConnection(async (conn) => conn);
        const updateEmailinfoResult = await userDao.updateEmailinfo(connection, id, email)
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editEmail Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.withdrawUser = async function (id) {
    try {
        const statusCheckResult = await userProvider.statusCheck(id);
        if(statusCheckResult[0].status == 1 || statusCheckResult[0].status==2) {
            return errResponse(baseResponse.WITHDRAWAL_INACTIVE_ACCOUNT);
        }

        console.log(id)

        const connection = await pool.getConnection(async (conn) => conn);
        const updatewithdrawinfoResult = await userDao.updatewithdrawinfo(connection, id)
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editEmail Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.updateProfileImage = async function (userId, image) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const updateProfileImageResult = await userDao.updateProfileImageInfo(connection, userId, image)
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editName Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.updateFollow = async function (followUserId, myUserId) {
    try {
        let updateFollowInfoResult;
        let status = 0;
        //팔로우하려는 유저 id가 유효한지 확인
        const userIdCheckResult = await userProvider.statusCheck(followUserId);
        if(userIdCheckResult.length<1)
            return errResponse(baseResponse.USER_USERID_NOT_EXIST);

        const connection = await pool.getConnection(async (conn) => conn);
        //팔로우 상태 체크
        const followCheckResult = await userProvider.followCheck(followUserId, myUserId);
        //insert 한 적이 없으면 insert
        if(followCheckResult.length<1) {
            updateFollowInfoResult = await userDao.insertFollowInfo(connection, followUserId, myUserId)
        }
        //insert 한 적이 없으면 status 체크해서 변경
        else {
            if(followCheckResult[0].status==0) {
                status = 1;
                updateFollowInfoResult = await userDao.updateFollowInfo(connection, followUserId, myUserId, status)
            }
            else if (followCheckResult[0].status==1) {
                status = 0;
                updateFollowInfoResult = await userDao.updateFollowInfo(connection, followUserId, myUserId, status)
            }
        }
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - updateFollow Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

//위치
exports.updateLocation = async function (isLocation,  latitude, longitude) {
    //위도, 경도로 거리구하는 함수
    function getDistance(lat1, lon1, lat2, lon2) {
        if ((lat1 == lat2) && (lon1 == lon2))
            return 0;

        var radLat1 = Math.PI * lat1 / 180;
        var radLat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radTheta = Math.PI * theta / 180;
        var dist = Math.sin(radLat1) * Math.sin(radLat2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta);
        if (dist > 1)
            dist = 1;

        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515 * 1.609344 * 1000;
        if (dist < 100) dist = Math.round(dist / 10) * 10;
        else dist = Math.round(dist / 100) * 100;

        return dist;
    }
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        connection.beginTransaction();
        let getLocationResult;
        let updateLocationInfoResult;
        let setDistanceNullResult;
        //위치를 허용할 경우 거리를 구해서 insert
        if(isLocation == 1) {
            getLocationResult = await userProvider.getLocation();
            for(var i = 0;i<getLocationResult.length;i++) {
                updateLocationInfoResult = await userDao.updateLocationInfo(connection, getLocationResult[i].id, getDistance(latitude, longitude, getLocationResult[i].latitude, getLocationResult[i].longitude));
            }
        }
        //위치를 허용하지 않을 경우 거리를 null로
        else
            setDistanceNullResult = await userDao.setDistanceNull(connection);

        connection.commit();
        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - updateFollow Service error\n: ${err.message}`);
        connection.rollback();
        return errResponse(baseResponse.DB_ERROR);
    }
}