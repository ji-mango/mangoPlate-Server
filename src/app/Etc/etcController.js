const jwtMiddleware = require("../../../config/jwtMiddleware");
const etcProvider = require("../../app/Etc/etcProvider");
const etcService = require("../../app/Etc/etcService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const {emit} = require("nodemon");

/**
 * API No. 44
 * API Name : EAT딜 목록 조회 API
 * [GET] /restaurants/eat-deal
 */
exports.getEatDeals = async function(req, res) {
    const area = req.query.area;
    if(!area) {
        return res.send(errResponse(baseResponse.AREA_EMPTY))
    }
    const eatDealListResult = await etcProvider.eatDealListResult(area);
    return res.send(eatDealListResult);
}

/**
 * API No. 45
 * API Name : 특정 EAT딜 조회 API
 * [GET] /eat-deals/:eatDealId
 */
exports.getEatDeal = async function(req, res) {
    const id = req.params.eatDealId;

    const retreiveEatDealResult = await etcProvider.retreiveEatDeal(id);
    return res.send(retreiveEatDealResult);
}

/**
 * API No. 46
 * API Name : 이벤트 조회 API
 * [GET] /events
 */
exports.getEvents = async function(req, res) {
    const eventListResult = await etcProvider.eventList();

    return res.send(response(baseResponse.SUCCESS,eventListResult));
}

/**
 * API No. 47
 * API Name : 지역 목록 조회 API
 * [GET] /areas
 */
exports.getAreas = async function(req, res) {
    const largeArea = req.query.largeArea;

    //빈값 체크
    if(!largeArea)
        return res.send(errResponse(baseResponse.LARGE_AREA_EMPTY));

    const getAreasListResult = await etcProvider.getAreasList(largeArea);
    return res.send(getAreasListResult);
}