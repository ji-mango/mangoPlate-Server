const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const restaurantProvider = require("./restaurantProvider");
const restaurantDao = require("./restaurantDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

//특정가게 조회수 올리기
exports.setViewCount = async function(id) {
    const connection = await pool.getConnection(async (conn) => conn);

    const setViewCountInfoResult = await restaurantDao.setViewCountInfo(connection, id);

    connection.release();
    return setViewCountInfoResult;

}

//식당 등록
exports.insertRestaurant = async function (userId, name, areaId, roadLocation, groundLocation, phoneNumber, foodType, latitude, longitude) {
    const areaCheckResult = await restaurantProvider.areaCheck(areaId);
    if(areaCheckResult.length<1) {
        return errResponse(baseResponse.AREA_NOT_EXIST);
    }
    const infoParams = [userId, name, areaId, roadLocation, groundLocation, phoneNumber, foodType, latitude, longitude];

    const connection = await pool.getConnection(async (conn) => conn);
    const insertRestaurantInfoResult = await restaurantDao.insertRestaurantInfo(connection, infoParams);

    connection.release();
    return response(baseResponse.SUCCESS);
}

//식당 삭제
exports.patchRestaurant = async function (userId, restaurantId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const restaurantCheckResult = await restaurantProvider.restaurantCheck(restaurantId)
    if(restaurantCheckResult.length<1)
        return errResponse(baseResponse.RESTAURANT_NOT_EXIST);
    else if(restaurantCheckResult[0].userId != userId)
        return errResponse(baseResponse.RESTAURANT_USER_NOT_MATCH)

    const patchRestaurantInfoResult = await restaurantDao.patchRestaurantInfo(connection, restaurantId);

    connection.release();
    return response(baseResponse.SUCCESS);
}

//가봤어요 버튼
exports.updateHope = async function (restaurantId, userId) {
    let updateHopeInfoResult;
    let status = 0;

    const connection = await pool.getConnection(async (conn) => conn);

    const restaurantIdCheckResult = await restaurantProvider.restaurantIdCheck(restaurantId);
    if(restaurantIdCheckResult.length<1) {
        return errResponse(baseResponse.RESTAURANT_NOT_EXIST);
    }

    //가봤어요 상태 체크
    const hopeCheckResult = await restaurantProvider.hopeCheck(restaurantId, userId);
    //insert 한 적이 없으면 insert
    if(hopeCheckResult.length<1) {
        updateHopeInfoResult = await restaurantDao.insertHopeInfo(connection, restaurantId, userId)
    }

    //insert 한 적이 없으면 status 체크해서 변경
    else {
        if(hopeCheckResult[0].status==0) {
            status = 1;
            updateHopeInfoResult = await restaurantDao.updateHopeInfo(connection, restaurantId, userId, status)
        }
        else if (hopeCheckResult[0].status==1) {
            status = 0;
            updateHopeInfoResult = await restaurantDao.updateHopeInfo(connection, restaurantId, userId, status)
        }
    }
    connection.release();

    return response(baseResponse.SUCCESS);
};