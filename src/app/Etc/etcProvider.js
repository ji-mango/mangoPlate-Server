const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const etcDao = require("./etcDao");

// Provider: Read 비즈니스 로직 처리

exports.eventList = async function () {
    const connection = await pool.getConnection(async (conn) => conn);

    const eventInfoResult = await etcDao.eventInfo(connection);
    connection.release();
    return eventInfoResult;
};

//잇딜 목록 조회
exports.eatDealListResult = async function(area) {
    const connection = await pool.getConnection(async (conn) => conn);

    const getEatDealInfoResult = await etcDao.getEatDealInfo(connection, area);

    connection.release();
    return response(baseResponse.SUCCESS,getEatDealInfoResult);
}

//특정 잇딜 조회
exports.retreiveEatDeal = async function(id) {
    const connection = await pool.getConnection(async (conn) => conn);

    const retreiveEatDealInfoResult = await etcDao.retreiveEatDealInfo(connection, id);
    if(retreiveEatDealInfoResult[0].restaurantId == null) {
        return errResponse(baseResponse.EATDEAL_ID_EMPTY)
    }
    connection.release();
    return response(baseResponse.SUCCESS,retreiveEatDealInfoResult);
}

//큰범위지역으로 지역 조회
exports.getAreasList = async function(largeArea) {
    const connection = await pool.getConnection(async (conn) => conn);

    const getAreasInfoResult = await etcDao.getAreasInfo(connection, largeArea);
    if(getAreasInfoResult.length<1) {
        return errResponse(baseResponse.AREA_NOT_EXIST);
    }
    connection.release();
    return response(baseResponse.SUCCESS,getAreasInfoResult);
}
