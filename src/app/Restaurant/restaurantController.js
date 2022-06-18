const jwtMiddleware = require("../../../config/jwtMiddleware");
const restaurantProvider = require("../../app/Restaurant/restaurantProvider");
const restaurantService = require("../../app/Restaurant/restaurantService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const axios = require("../../../node_modules/axios");
const {emit} = require("nodemon");

/**
 * API No. 34
 * API Name : 내가 등록한 식당목록 조회 API
 * [GET] /my-restaurants
 */
exports.getMyRestaurants = async function(req, res) {
    const userId = req.verifiedToken.userId;

    const getMyRestaurantsListResult = await restaurantProvider.getMyRestaurantsList(userId);
    return res.send(response(baseResponse.SUCCESS,getMyRestaurantsListResult));
}

/**
 * API No. 35
 * API Name : 가게 등록하기 API
 * [POST] /restaurants
 */
exports.postRestaurant = async function (req, res) {
    const userId = req.verifiedToken.userId;
    let {name, areaId, latitude, longitude, phoneNumber, foodType} = req.body;
    let addressinfo;       //카카오 api로 가져온 주소 정보 저장하는 변수

    foodType = foodType - 1;    //디비에서 foodType은 0부터 시작

    //빈값 체크
    if (!name)
        return res.send(errResponse(baseResponse.RESTAURANT_NAME_EMPTY));
    if (!areaId)
        return res.send(errResponse((baseResponse.AREA_EMPTY)));
    if (!latitude || !longitude)
        return res.send(errResponse(baseResponse.LOCATION_EMPTY));

    //빈값이면 null로(쿼리에서 오류 안나도록)
    if (!phoneNumber)
        phoneNumber = null;
    if (foodType == undefined)
        foodType = null;
    else {
        if (foodType < 0 || foodType > 7) {
            return res.send(errResponse(baseResponse.FOOD_TYPE_ERROR))
        }
    }

    //카카오 로컬 api 사용하여 위도,경도로 주소 불러오기
    addressinfo = await axios.get('https://dapi.kakao.com/v2/local/geo/coord2address.json',
        {
            headers: {
                Authorization: 'KakaoAK 593cba0bc3ea7f52024615b72630d3ee'
            },
            params: {
                x: `${longitude}`,
                y: `${latitude}`
            }
        });
    const roadLocation = addressinfo.data.documents[0].road_address.address_name;
    const groundLocation = addressinfo.data.documents[0].address.address_name;

    const insertRestaurantResult = await restaurantService.insertRestaurant(userId, name, areaId, roadLocation, groundLocation, phoneNumber, foodType, latitude, longitude);
    return res.send(insertRestaurantResult);
}

/**
 * API No. 36
 * API Name : 지역별 가게조회 API(메인화면)
 * [GET] /restaurants
 */
exports.getRestaurants = async function(req, res) {
    const userId = req.verifiedToken.userId;
    var area = req.query.area;
    const page = 20*(req.query.page - 1);
    const order = req.query.order;
    let food = req.query.food;
    const category = req.query.category;
    let price = req.query.price;
    const park = req.query.park;

    //빈값 체크
    if(!area)
        return res.send(errResponse(baseResponse.AREA_EMPTY));
    //if(page == null)
    //    return res.send(errResponse(baseResponse.PAGE_EMPTY));
    if(!food)
        food = '9';
    if(!price)
        price = '5';

    const restaurantListResult = await restaurantProvider.restaurantList(area, order, food, userId, category, price, park, page);
    return res.send(response(baseResponse.SUCCESS,restaurantListResult));
}

//비회원
exports.getR = async function(req, res) {
    var area = req.query.area;
    //const page = 20*(req.query.page - 1);
    const order = req.query.order;
    let food = req.query.food;
    let price = req.query.price;
    const park = req.query.park;
    //빈값 체크
    if(!area)
        return res.send(errResponse(baseResponse.AREA_EMPTY));
    //if(page == null)
    //    return res.send(errResponse(baseResponse.PAGE_EMPTY));
    if(!food)
        food = '9';
    if(!price)
        price = '5';

    const RListResult = await restaurantProvider.RList(area, order, food, price, park);
    return res.send(response(baseResponse.SUCCESS,RListResult));
}

/**
 * API No. 37
 * API Name : 특정 가게조회 API
 * [GET] /restaurants/:restaurantId
 */
exports.getRestaurant = async function(req, res) {
    const id = req.params.restaurantId;

    //빈값 체크
    if(!id)
        return res.send(errResponse(baseResponse.RESTAURANT_ID_EMPTY));

    //가게정보 얻기
    const getRestaurantListResult = await restaurantProvider.getRestaurantList(id);
    return res.send(getRestaurantListResult);
}

/**
 * API No. 38
 * API Name : 특정 가게 리뷰 수, 리뷰조회 API
 * [GET] /restaurants/:restaurantId/reviewCount
 */
exports.getRestaurantReviewCount = async function(req, res) {
    const id = req.params.restaurantId;

    //빈값 체크
    if(!id)
        return res.send(errResponse(baseResponse.RESTAURANT_ID_EMPTY));

    //가게정보 얻기
    const getReviewCountResult = await restaurantProvider.getReviewCount(id);
    return res.send(getReviewCountResult);
}

/**
 * API No. 39
 * API Name : 특정 가게 전체 사진 보기 API
 * [GET] /restaurants/:restaurantId/image
 */
exports.getRestaurantImage = async function(req, res) {
    const id = req.params.restaurantId;

    //사진 정보 얻기
    const getRestaurantImageListResult = await restaurantProvider.getRestaurantImageList(id);
    return res.send(getRestaurantImageListResult);
}

/**
 * API No. 40
 * API Name : 가게 상세정보 조회 API
 * [GET] /restaurants/:restaurantId/information
 */
exports.getRestaurantInformation = async function(req, res) {
    const id = req.params.restaurantId;

    //상세 정보 얻기
    const getRestaurantInformationListResult = await restaurantProvider.getRestaurantInformationList(id);
    return res.send(getRestaurantInformationListResult);
}

/**
 * API No. 41
 * API Name : 가게 메뉴 보기 API
 * [GET] /restaurants/:restaurantId/menu
 */
exports.getRestaurantMenu = async function(req, res) {
    const id = req.params.restaurantId;

    const getRestaurantMenuListResult = await restaurantProvider.getRestaurantMenuList(id);
    return res.send(getRestaurantMenuListResult);
}

/**
 * API No. 42
 * API Name : 가게 리뷰 조회 API
 * [GET] /restaurants/:restaurantId/review
 */
exports.getReview = async function(req, res) {
    const id = req.params.restaurantId;
    const filter = req.query.filter;    //null:전체, 1:맛있다!, 2:괜찮다, 3:별로

    if(filter!=null && filter!=1 && filter!=2 && filter!=3)
    {
        res.send(errResponse(baseResponse.FILTER_ERROR));
    }
    const reviewListResult = await restaurantProvider.reviewListResult(id, filter);
    return res.send(reviewListResult);
}


/**
 * API No. 43
 * API Name : 가고싶다 버튼 API
 * [POST] /restaurants/:restaurantId/hope
 */
exports.postHope = async function(req, res) {
    const restaurantId = req.params.restaurantId;
    const userId = req.verifiedToken.userId;

    const updateHopeResult = await restaurantService.updateHope(restaurantId, userId);
    return res.send(updateHopeResult);
}

/**
 * API No. 50
 * API Name : 가게 삭제 API
 * [PATCH] /restaurants/:restaurantId
 */
 exports.patchRestaurant = async function(req, res) {
     const userId = req.verifiedToken.userId;
     const restaurantId = req.params.restaurantId;

     const patchRestaurantResult = await restaurantService.patchRestaurant(userId, restaurantId);
     return res.send(patchRestaurantResult);
 }




