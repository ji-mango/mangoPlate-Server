const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const listProvider = require("./listProvider");
const listDao = require("./listDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

//리스트 조회수 올리기*
exports.listViewCount = async function(id) {
    const connection = await pool.getConnection(async (conn) => conn);

    const setListViewCountInfoResult = await listDao.setListViewCountInfo(connection, id);

    connection.release();
    return setListViewCountInfoResult;
}

//조회수 100넘은 리스트 탑리스트로
exports.updateTopList = async function(id) {
    const connection = await pool.getConnection(async (conn) => conn);

    const updateTopListInfoResult = await listDao.updateTopListInfo(connection, id);

    connection.release();
    return updateTopListInfoResult;
}

//리스트 생성*
exports.setMyList = async function(title, content, userId) {
    const connection = await pool.getConnection(async (conn) => conn);

    const setMyListInfoResult = await listDao.setMyListInfo(connection, title, content, userId);

    connection.release();
    return setMyListInfoResult;
}

//리스트 수정*
exports.patchList = async function(userId, myListId, title, content) {
    //유효한 리스트인지, 리스트를 생성한 userId와 입력받은 토큰의 userId가 같은지 체크
    const listCheckResult = await listProvider.listCheck(myListId);
    if(listCheckResult.length<1)
        return errResponse(baseResponse.LIST_NOT_EXIST);
    if(listCheckResult[0].userId != userId)
        return errResponse(baseResponse.LIST_USER_NOT_MATCH);

    const connection = await pool.getConnection(async (conn) => conn);
    const patchListInfoResult = await listDao.patchListInfo(connection, myListId, title, content);

    connection.release();
    return response(baseResponse.SUCCESS);
}

//리스트 삭제*
exports.deleteList = async function(userId, myListId) {
    //유효한 리스트인지, 리스트를 생성한 userId와 입력받은 토큰의 userId가 같은지 체크
    const listCheckResult = await listProvider.listCheck(myListId);
    if(listCheckResult.length<1)
        return errResponse(baseResponse.LIST_NOT_EXIST);
    if(listCheckResult[0].userId != userId)
        return errResponse(baseResponse.LIST_USER_NOT_MATCH);
    if(listCheckResult[0].status == 1)
        return errResponse(baseResponse.LIST_ALREADY_DELETE);

    const connection = await pool.getConnection(async (conn) => conn);
    const deleteListInfoResult = await listDao.deleteListInfo(connection, myListId);

    connection.release();
    return response(baseResponse.SUCCESS);
}

//리스트 식당 추가*
exports.setListRestaurant = async function(userId, myListId, restaurantId) {
    //유효한 가게 id인지 체크
    const restaurantIdCheckResult = await listProvider.restaurantIdCheck(restaurantId);
    if(restaurantIdCheckResult.length<1)
        return errResponse(baseResponse.RESTAURANT_NOT_EXIST);

    //유효한 리스트인지, 리스트를 생성한 userId와 입력받은 토큰의 userId가 같은지 체크
    const listCheckResult = await listProvider.listCheck(myListId);
    if(listCheckResult.length<1)
        return errResponse(baseResponse.LIST_NOT_EXIST);
    if(listCheckResult[0].userId != userId)
        return errResponse(baseResponse.LIST_USER_NOT_MATCH);

    //리스트에 이미 해당 식당이 있는지 체크
    const listRestaurantCheckResult = await listProvider.listRestaurantCheck(myListId, restaurantId);
    if(listRestaurantCheckResult.length > 0) {
        if (listRestaurantCheckResult[0].restaurantId == restaurantId)
            return errResponse(baseResponse.LIST_ALREADY_EXIST)
    }
   const connection = await pool.getConnection(async (conn) => conn);
    const setListRestaurantInfoResult = await listDao.setListRestaurantInfo(connection, myListId, restaurantId);

    connection.release();
    return response(baseResponse.SUCCESS);
}

//리스트 식당 삭제
exports.setDeleteListRestaurant = async function(myListId, restaurantId, userId) {
    //유효한 리스트인지, 리스트를 생성한 userId와 입력받은 토큰의 userId가 같은지 체크
    const listCheckResult = await listProvider.listCheck(myListId);
    if(listCheckResult.length<1)
        return errResponse(baseResponse.LIST_NOT_EXIST);
    if(listCheckResult[0].userId != userId)
        return errResponse(baseResponse.LIST_USER_NOT_MATCH);

    //입력받은 식당 id가 해당 리스트에 존재하는지 체크
    const listRestaurantCheckResult = await listProvider.listRestaurantCheck(myListId, restaurantId);
    if(listRestaurantCheckResult.length<1)
        return errResponse(baseResponse.LIST_RESTAURANT_NOT_MATCH)

    const connection = await pool.getConnection(async (conn) => conn);
    const ss = await listDao.deleteListRestaurantInfo(connection, myListId, restaurantId);

    connection.release();
    return response(baseResponse.SUCCESS);
}
