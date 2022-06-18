const {pool} = require("../../../config/database");
const {logger} = require("../../../config/winston");

const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const restaurantDao = require("./restaurantDao");
const restaurantService = require("./restaurantService");

// Provider: Read 비즈니스 로직 처리

//전체가게조회
exports.restaurantList = async function (area, order, food, userId, category, price, park, page) {
    const connection = await pool.getConnection(async (conn) => conn);
    let choiceArea = '';
    let choiceOrder = '';
    let choiceFood = '';
    let choiceCategory = '';
    let choicePrice = '';
    let choicePark = '';
    if (area != '전체지역') {
        choiceArea += "where a.smallRange = '" + area + "'";
        choiceFood += "and "

    } else {
        choiceFood += "where ";
    }
    switch (order) {
        case '1' :
            choiceOrder += 'order by avg DESC';
            break;
        case '2' :
            choiceOrder += 'order by r.id DESC';
            break;
        case '3' :
            choiceOrder += 'order by reviewCount DESC';
            break;
        case '4' :
            choiceOrder += 'order by distance';
            break;
        default :
            choiceOrder += 'order by avg DESC';
            break;
    }
    switch (food[0]) {
        case '1' :
            choiceFood += '(foodType = 0';
            break;
        case '2' :
            choiceFood += '(foodType = 1';
            break;
        case '3' :
            choiceFood += '(foodType = 2';
            break;
        case '4' :
            choiceFood += '(foodType = 3';
            break;
        case '5' :
            choiceFood += '(foodType = 4';
            break;
        case '6' :
            choiceFood += '(foodType = 5';
            break;
        case '7' :
            choiceFood += '(foodType = 6';
            break;
        case '8' :
            choiceFood += '(foodTYPe = 7';
            break;
        default :
            choiceFood = '';
            break;
    }
    if (food.length > 1) {
        for (var i = 1; i < food.length; i++) {
            choiceFood += ' or foodType =' + (parseInt(food[i]) - 1)
        }
    }
    if (choiceFood.length > 0) choiceFood += ')';
    if (!choiceFood && choiceArea == '전체지역') {
        choiceCategory = 'where ';
    }
    else {
        choiceCategory = 'and ';
    }
    switch(category) {
        case '1':
            choiceCategory ='';
            break;
        case '2' :
            choiceCategory += 'u.id=' + userId;
            break;
        case '3':
            choiceCategory += 'u2.id=' + userId;
            break;
        default :
            choiceCategory ='';
            break;
    }
    if(!choiceFood && choiceArea=='전체지역' && !choiceCategory) {
        choicePrice = 'where ';
    }
    else {
        choicePrice = 'and ';
    }

    switch(price[0]) {
        case '1' : choicePrice += '(r.price = 0'; break;
        case '2' : choicePrice += '(r.price = 1'; break;
        case '3' : choicePrice += '(r.price = 2'; break;
        case '4' : choicePrice += '(r.price >= 3'; break;
        default : choicePrice = ''; break;
    }
    if(price.length>1) {
        for(var i =1;i<price.length;i++) {
            if(price[i]==4) {
                choicePrice += ' or r.price >=3';
            }
            else {
                choicePrice += ' or r.price='+ (parseInt(price[i]-1));
            }
        }
    }
    if (choicePrice.length > 0) choicePrice += ')';
    if(!choiceFood && choiceArea=='전체지역' && !choiceCategory && !choicePrice) {
        choicePark = 'where ';
    }
    else {
        choicePark = 'and ';
    }
    switch(park) {
        case '2' : choicePark += 'r.parking != 0'; break;
        default : choicePark = ''; break;
    }
    const restaurantInfoResult = await restaurantDao.restaurantInfo(connection, choiceArea, choiceOrder, choiceFood, choiceCategory, choicePrice, choicePark,page);
    connection.release();
    return restaurantInfoResult;
};

//임의
exports.RList = async function (area, order, food, price, park) {
    const connection = await pool.getConnection(async (conn) => conn);
    let choiceArea = '';
    let choiceOrder = '';
    let choiceFood = '';
    let choicePrice = '';
    let choicePark = '';
    if (area != '전체지역') {
        choiceArea += "where a.smallRange = '" + area + "'";
        choiceFood += "and "
    } else {
        choiceFood += "where ";
    }
    switch (order) {
        case '1' :
            choiceOrder += 'order by avg DESC';
            break;
        case '2' :
            choiceOrder += 'order by r.id DESC';
            break;
        case '3' :
            choiceOrder += 'order by reviewCount DESC';
            break;
        case '4' :
            choiceOrder += 'order by distance';
            break;
        default :
            choiceOrder += 'order by avg DESC';
            break;
    }
    switch (food[0]) {
        case '1' :
            choiceFood += '(foodType = 0';
            break;
        case '2' :
            choiceFood += '(foodType = 1';
            break;
        case '3' :
            choiceFood += '(foodType = 2';
            break;
        case '4' :
            choiceFood += '(foodType = 3';
            break;
        case '5' :
            choiceFood += '(foodType = 4';
            break;
        case '6' :
            choiceFood += '(foodType = 5';
            break;
        case '7' :
            choiceFood += '(foodType = 6';
            break;
        case '8' :
            choiceFood += '(foodTYPe = 7';
            break;
        default :
            choiceFood = '';
            break;
    }
    if (food.length > 1) {
        for (var i = 1; i < food.length; i++) {
            choiceFood += ' or foodType =' + (parseInt(food[i]) - 1)
        }
    }
    if (choiceFood.length > 0) choiceFood += ')';


    if(!choiceFood && choiceArea=='전체지역') {
        choicePrice = 'where ';
    }
    else {
        choicePrice = 'and ';
    }

    switch(price[0]) {
        case '1' : choicePrice += '(r.price = 0'; break;
        case '2' : choicePrice += '(r.price = 1'; break;
        case '3' : choicePrice += '(r.price = 2'; break;
        case '4' : choicePrice += '(r.price >= 3'; break;
        default : choicePrice = ''; break;
    }
    if(price.length>1) {
        for(var i =1;i<price.length;i++) {
            if(price[i]==4) {
                choicePrice += ' or r.price >=3';
            }
            else if(price[i]==1 || price[i]==2 || price[i]==3) {
                choicePrice += ' or r.price='+ (parseInt(price[i]-1));
            }
        }
    }
    if (choicePrice.length > 0) choicePrice += ')';
    if(!choiceFood && choiceArea=='전체지역' && !choicePrice) {
        choicePark = 'where ';
    }
    else {
        choicePark = 'and ';
    }
    switch(park) {
        case '2' : choicePark += 'r.parking != 0'; break;
        default : choicePark = ''; break;
    }
    const RInfoResult = await restaurantDao.RInfo(connection, choiceArea, choiceOrder, choiceFood, choicePrice, choicePark);
    connection.release();
    return RInfoResult;
};

//선택가게조회
exports.getRestaurantList = async function (id) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        connection.beginTransaction();

        //조회수 올리기
        const setViewCountResult = await restaurantService.setViewCount(id);

        const getRestaurantInfoResult = await restaurantDao.getRestaurantInfo(connection, id);
        if (getRestaurantInfoResult.length < 1) {
            return errResponse(baseResponse.RESTAURANT_NOT_EXIST);
        }

        connection.commit();
        connection.release();
        return response(baseResponse.SUCCESS, getRestaurantInfoResult);
    } catch(err) {
        logger.error(`App - getRestaurant Service error\n: ${err.message}`);
        connection.rollback()
        return errResponse(baseResponse.DB_ERROR);
    }

};

//선택가게 리뷰수, 리뷰조회
exports.getReviewCount = async function (id) {
    const connection = await pool.getConnection(async (conn) => conn);

    const getRestaurantInfoResult = await restaurantDao.getRestaurantInfo(connection, id);
    if (getRestaurantInfoResult.length < 1) {
        return errResponse(baseResponse.RESTAURANT_NOT_EXIST);
    }

    const getReviewCountInfoResult = await restaurantDao.getReviewCountInfo(connection, id);
    const countPerReview = getReviewCountInfoResult[0]
    const reviewList = getReviewCountInfoResult[1]

    //배열값 나눠서 주기위해 response를 새로 만듦
    const rResponse = (isSuccess, code, message, countPerReview, reviewList) => {
        return {
            isSuccess: isSuccess,
            code: code,
            message: message,
            countPerReview : countPerReview,
            reviewList : reviewList
        }
    };
    return rResponse(true,1000,"성공", countPerReview, reviewList);
};

//선택가게 이미지조회
exports.getRestaurantImageList = async function (id) {
    const connection = await pool.getConnection(async (conn) => conn);

    const getRestaurantInfoResult = await restaurantDao.getRestaurantInfo(connection, id);
    if (getRestaurantInfoResult.length < 1) {
        return response(baseResponse.RESTAURANT_NOT_EXIST);
    }
    const getRestaurantImageInfoResult = await restaurantDao.getRestaurantImageInfo(connection, id);

    connection.release();
    return response(baseResponse.SUCCESS, getRestaurantImageInfoResult);
};

//가게 상세정보 조회
exports.getRestaurantInformationList = async function (id) {
    const connection = await pool.getConnection(async (conn) => conn);

    const getRestaurantInfoResult = await restaurantDao.getRestaurantInfo(connection, id);
    if (getRestaurantInfoResult.length < 1) {
        return response(baseResponse.RESTAURANT_NOT_EXIST);
    }
    const getRestaurantInformationInfoResult = await restaurantDao.getRestaurantInformationInfo(connection, id);

    connection.release();
    return response(baseResponse.SUCCESS, getRestaurantInformationInfoResult);
};

//가게 메뉴 조회
exports.getRestaurantMenuList = async function (id) {
    const connection = await pool.getConnection(async (conn) => conn);

    const getRestaurantInfoResult = await restaurantDao.getRestaurantInfo(connection, id);
    if (getRestaurantInfoResult.length < 1) {
        return response(baseResponse.RESTAURANT_NOT_EXIST);
    }
    const getRestaurantMenuInfoResult = await restaurantDao.getRestaurantMenuInfo(connection, id);

    connection.release();
    return response(baseResponse.SUCCESS, getRestaurantMenuInfoResult);
};

//가게 리뷰 조회
exports.reviewListResult = async function (id, filter) {
    const connection = await pool.getConnection(async (conn) => conn);

    const getRestaurantInfoResult = await restaurantDao.getRestaurantInfo(connection, id);
    if (getRestaurantInfoResult.length < 1) {
        return response(baseResponse.RESTAURANT_NOT_EXIST);
    }
    let condition = '';
    switch (filter) {
        case '1' :
            condition += 'and rv.score = 5';
            break;
        case '2' :
            condition += 'and rv.score = 2.5';
            break;
        case '3' :
            condition += 'and rv.score = 0';
            break;
    }
    const getReviewInfoResult = await restaurantDao.getReviewInfo(connection, id, condition);

    connection.release();
    return response(baseResponse.SUCCESS, getReviewInfoResult);
}

//id로 지역 검색
exports.areaCheck = async function (areaId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const areaCheckInfoResult = await restaurantDao.areaCheckInfo(connection, areaId);

    connection.release();
    return (areaCheckInfoResult);
}

//id로 식당 검색
exports.restaurantIdCheck = async function (restaurantId) {
    const connection = await pool.getConnection(async (conn) => conn);

    const getRestaurantInfoResult = await restaurantDao.getRestaurantInfo(connection, restaurantId);
    connection.release();
    return getRestaurantInfoResult;
}

//가봤어요 상태 체크
exports.hopeCheck = async function (restaurantId, userId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const hopeCheckInfoResult = await restaurantDao.hopeCheckInfo(connection, restaurantId, userId);

    connection.release();
    return (hopeCheckInfoResult);
};

//내가 등록한 식당목록 조회
exports.getMyRestaurantsList = async function (userId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const getMyRestaurantsInfoResult = await restaurantDao.getMyRestaurantsInfo(connection, userId);

    connection.release();
    return (getMyRestaurantsInfoResult);
};

//식당 검색
exports.restaurantCheck = async function (restaurantId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const restaurantCheckInfoResult= await restaurantDao.restaurantCheckInfo(connection, restaurantId);

    connection.release();
    return (restaurantCheckInfoResult);
};