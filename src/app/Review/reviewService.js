const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const reviewProvider = require("./reviewProvider");
const reviewDao = require("./reviewDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const userProvider = require("../User/userProvider")

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

//리뷰 좋아요 버튼
exports.updateReviewLikeResult = async function (reviewId, userId) {
    let updateReviewLikeInfoResult;
    let status = 0;

    const connection = await pool.getConnection(async (conn) => conn);

    const reviewIdCheckResult = await reviewProvider.reviewIdCheck(reviewId);
    if(reviewIdCheckResult.length<1) {
        return errResponse(baseResponse.REVIEW_ID_NOT_EXIST);
    }

    //좋아요 상태 체크
    const reviewLikeCheckResult = await reviewProvider.reviewLikeCheck(reviewId, userId);
    //insert 한 적이 없으면 insert
    if(reviewLikeCheckResult.length<1) {
        updateReviewLikeInfoResult = await reviewDao.insertReviewLikeInfo(connection, reviewId, userId)
    }
    //insert 한 적이 없으면 status 체크해서 변경
    else {
        if(reviewLikeCheckResult[0].status==0) {
            status = 1;
            updateReviewLikeInfoResult = await reviewDao.updateReviewLikeInfo(connection, reviewId, userId, status)
        }
        else if (reviewLikeCheckResult[0].status==1) {
            status = 0;
            updateReviewLikeInfoResult = await reviewDao.updateReviewLikeInfo(connection, reviewId, userId, status)
        }
    }
    connection.release();

    return response(baseResponse.SUCCESS);
};


//리뷰 댓글 달기
exports.postComment = async function (reviewId, userId, content, parentsId) {
    const connection = await pool.getConnection(async (conn) => conn);
    //유효한 리뷰 id인지 검사
    const retrieveReviewListResult = await reviewProvider.retrieveReviewList(reviewId);
    if(retrieveReviewListResult.length<1) {
        return response(errResponse(baseResponse.REVIEW_ID_NOT_EXIST));
    }
    if(parentsId != null) {
        const userIdCheckResult = await userProvider.statusCheck(parentsId);
        if(userIdCheckResult.length<1)
            return errResponse(baseResponse.USER_USERID_NOT_EXIST);
    }

    const postCommentInfoResult = await reviewDao.postCommentInfo(connection, reviewId, userId, content, parentsId);
    connection.release();
    return response(baseResponse.SUCCESS);
};

//리뷰 작성
exports.postReview = async function(userId, restaurantId, content, imageURL, score) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        connection.beginTransaction()
        const updateReviewInfoResult = await reviewDao.updateReviewInfo(connection, userId, restaurantId, content, score);
        const reviewId = updateReviewInfoResult.insertId;
        let updateReviewImageResult
        if(imageURL) {
            for(var i = 0; i<imageURL.length;i++) {
                updateReviewImageResult = await reviewDao.updateReviewImageInfo(connection, reviewId, imageURL[i]);
            }
        }
        connection.commit();

        connection.release();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - postReview Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
        connection.rollback();
    }
}