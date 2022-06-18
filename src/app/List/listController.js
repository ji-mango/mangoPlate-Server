const jwtMiddleware = require("../../../config/jwtMiddleware");
const listProvider = require("../../app/List/listProvider");
const listService = require("../../app/List/listService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const {emit} = require("nodemon");
const { logger } = require("../../../config/winston");

/**
 * API No. 19
 * API Name : 특정 마이리스트 조회 API
 * [GET] /users/my-lists/:myListId
 */
exports.getMyList = async function (req, res) {
    const myListId = req.params.myListId;

    //리스트 조회수 올리기
    const listViewCountResult = await listService.listViewCount(myListId);

    //조회수가 100을 넘으면 탑리스트로
    const updateTopListResult = await listService.updateTopList(myListId);

    //리스트 정보 얻기
    const retrieveMyListResult = await listProvider.retrieveMyList(myListId);
    return res.send(retrieveMyListResult);
};

/**
 * API No. 20
 * API Name : 마이리스트 생성 API
 * [POST] /users/my-lists
 */
exports.postMyList = async function (req, res) {
    const {title, content} = req.body;
    const userId = req.verifiedToken.userId;

    //빈값 체크
    if(!title)
        return res.send(errResponse(baseResponse.TITLE_EMPTY));

    //길이 체크
    if(title.length>50)
        return res.send(errResponse(baseResponse.TITLE_LENGTH));
    if(content.length>500)
        return res.send(errResponse(baseResponse.CONTENT_LENGTH));

    const setMyListResult = await listService.setMyList(title, content, userId);
    return res.send(response(baseResponse.SUCCESS));
};

/**
 * API No. 21
 * API Name : 리스트 식당 추가 API
 * [DELETE] /users/my-lists/:myListId/restaurant
 */
exports.postListRestaurant = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const myListId = req.params.myListId;
    const {restaurantId} = req.body;

    if(!restaurantId)
        return res.send(errResponse(baseResponse.RESTAURANT_ID_EMPTY))
    const setListRestaurantResult = await listService.setListRestaurant(userId, myListId, restaurantId);
    return res.send(setListRestaurantResult);
};

/**
 * API No.22
 * API Name : 마이리스트 수정 API
 * [PATCH] /users/my-lists/:myListId
 */
exports.patchMyList = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const myListId = req.params.myListId;
    const {title, content} = req.body;

    //빈값 체크
    if(!title)
        return res.send(errResponse(baseResponse.TITLE_EMPTY));

    //길이 체크
    if(title.length>50)
        return res.send(errResponse(baseResponse.TITLE_LENGTH));
    if(content.length>500)
        return res.send(errResponse(baseResponse.CONTENT_LENGTH));

    const patchListResult = await listService.patchList(userId, myListId, title, content);
    return res.send(patchListResult);
};

/**
 * API No.23
 * API Name : 마이리스트 삭제 API
 * [PATCH] /users/my-lists/:myListId/delete
 */
exports.deleteMyList = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const myListId = req.params.myListId;

    const deleteListResult = await listService.deleteList(userId, myListId);
    return res.send(deleteListResult);
};

/**
 * API No.24
 * API Name : 마이리스트 식당 추가할 때 검색 API
 * [GET] /my-lists/restaurants/search
 */
exports.searchListRestaurant = async function (req, res) {
    const {search} = req.body;

    if(!search)
        return res.send(errResponse(baseResponse.SEARCH_EMPRY));

    const getListRestaurantResult = await listProvider.getListRestaurant(search);
    return res.send(response(baseResponse.SUCCESS,getListRestaurantResult));
};

/**
 * API No.25
 * API Name : 마이리스트 식당 삭제 API
 * [PATCH] /my-lists/:myListId/restaurants
 */
exports.deleteListRestaurant = async function (req, res) {
    const myListId = req.params.myListId;
    const restaurantId = req.query.restaurantId;
    const userId = req.verifiedToken.userId;

    if(!restaurantId)
        return res.send(errResponse(baseResponse.RESTAURANT_ID_EMPTY))

    const setDeleteListRestaurantResult = await listService.setDeleteListRestaurant(myListId, restaurantId, userId);
    return res.send(setDeleteListRestaurantResult);
};
