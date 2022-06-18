const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const reviewDao = require("./reviewDao");

// Provider: Read 비즈니스 로직 처리

//전체 리뷰 조회
exports.reviewList = async function (area, good, soso, bad, filter, userId) {
    const connection = await pool.getConnection(async (conn) => conn);
    let condition = 'where ';
    let conditionUser = '';

    if(good == 1 && soso ==1 && !bad) {
        condition += "(rv.score=5 or rv.score=2.5)";
    }
    else if(good == 1 && !soso && !bad) {
        condition += "rv.score=5";
    }
    else if(!good && soso==1 && bad==1) {
        condition += "(rv.score=2.5 or rv.score=0)";
    }
    else if(!good && soso==1 && !bad) {
        condition += "rv.score=2.5";
    }
    else if(!good && !soso && bad==1) {
        condition += "rv.score = 0";
    }
    else if(good==1 && !soso && bad==1) {
        condition += "(rv.score=5 or rv.score=0)";
    }
    else if(good==1 && soso==1 && bad==1){
        condition += "(rv.score=5 or rv.score=0 or score=2.5)";
    }
    else return response(baseResponse.SCORE_FILTER_ERROR);
    if (area != '전체지역') {
        condition += "and a.smallRange = '"+area+"'";
    }

    if(filter==0) {
        condition += '';
    }
    else if(filter==1) {
            return response(baseResponse.LOGIN_EMPTY);
    }
    else if(filter==2) {
        condition += 'and u.isHolic=1';
    }
    else return response(baseResponse.FILTER_ERROR);

    if(userId != null)
        conditionUser += `and u.id = ${userId}`

    const reviewInfoResult = await reviewDao.reviewInfo(connection, condition, conditionUser);
    connection.release();
    return response(baseResponse.SUCCESS,reviewInfoResult);
};

//특정 리뷰 조회
exports.retrieveReviewList = async function (id) {
    const connection = await pool.getConnection(async (conn) => conn);
    const retreiveReviewInfoResult = await reviewDao.retreiveReviewInfo(connection, id);
    if(retreiveReviewInfoResult<1)
        return errResponse(baseResponse.REVIEW_ID_NOT_EXIST)
    connection.release();
    return response(baseResponse.SUCCESS,retreiveReviewInfoResult);
};

//팔로잉 리뷰 조회
exports.followingReviewList = async function (area, good, soso, bad, userId) {
    const connection = await pool.getConnection(async (conn) => conn);
    let condition = 'where ';
    if(good == 1 && soso ==1 && !bad) {
        condition += "(rv.score=5 or rv.score=2.5)";
    }
    else if(good == 1 && !soso && !bad) {
        condition += "rv.score=5";
    }
    else if(!good && soso==1 && bad==1) {
        condition += "(rv.score=2.5 or rv.score=0)";
    }
    else if(!good && soso==1 && !bad) {
        condition += "rv.score=2.5";
    }
    else if(!good && !soso && bad==1) {
        condition += "rv.score = 0";
    }
    else if(good==1 && !soso && bad==1) {
        condition += "(rv.score=5 or rv.score=0)";
    }
    else if(good==1 && soso==1 && bad==1){
        condition += "(rv.score=5 or rv.score=0 or score=2.5)";
    }
    else return response(baseResponse.SCORE_FILTER_ERROR);
    if (area != '전체지역') {
        condition += "and a.smallRange = '"+area+"'";
    }
    const followingReviewInfoResult = await reviewDao.followingReviewInfo(connection, condition, userId);
    connection.release();
    return followingReviewInfoResult;
};

//좋아요 상태 체크
exports.reviewLikeCheck = async function (reviewId, userId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const reviewLikeCheckInfoResult = await reviewDao.reviewLikeCheckInfo(connection, reviewId, userId);

    connection.release();
    return (reviewLikeCheckInfoResult);
};

//리뷰 댓글 조회
exports.commentList = async function (reviewId) {
    const connection = await pool.getConnection(async (conn) => conn);

    const retreiveReviewInfoResult = await reviewDao.retreiveReviewInfo(connection, reviewId);
    if(retreiveReviewInfoResult.length<1) {
        return response(errResponse(baseResponse.REVIEW_ID_NOT_EXIST));
    }

    const getCommentInfoResult = await reviewDao.getCommentInfo(connection, reviewId);
    connection.release();
    return response(baseResponse.SUCCESS,getCommentInfoResult);
};

//특정 댓글 조회
exports.myCommentCheck = async function (parentsId) {
    const connection = await pool.getConnection(async (conn) => conn);

    const myCommentInfoResult = await reviewDao.myCommentInfo(connection, parentsId);
    connection.release();
    return myCommentInfoResult;
};

//리뷰,댓글단 유저 조회
exports.commentUserList = async function (reviewId) {
    const connection = await pool.getConnection(async (conn) => conn);

    const commentUserInfoResult = await reviewDao.commentUserInfo(connection, reviewId);
    connection.release();
    return commentUserInfoResult;
};

//id로 리뷰 조회
exports.reviewIdCheck = async function (id) {
    const connection = await pool.getConnection(async (conn) => conn);

    const retreiveReviewInfoResult = await reviewDao.retreiveReviewInfo(connection, id);
    connection.release();
    return retreiveReviewInfoResult;
};