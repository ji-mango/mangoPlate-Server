const jwtMiddleware = require("../../../config/jwtMiddleware");
const reviewProvider = require("../../app/Review/reviewProvider");
const reviewService = require("../../app/Review/reviewService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const {emit} = require("nodemon");

/**
 * API No. 26
 * API Name : 전체리뷰조회(소식 탭)
 * [GET] /reviews
 */
exports.getReviews = async function(req, res) {
    const area = req.query.area;
    const good = req.query.good;
    const soso = req.query.soso;
    const bad = req.query.bad;
    const filter = req.query.filter;    //0:전체, 1:팔로잉, 2:홀릭
    const userId = req.query.userId;

    console.log(area);
    if(!good && !soso && !bad) {
        return res.send(response(baseResponse.SCORE_EMPTY))
    }
    if(!area) {
        return res.send(response(baseResponse.AREA_EMPTY))
    }
    if(!filter) {
        return res.send(response(baseResponse.FILTER_EMPTY))
    }
    const reviewListResult = await reviewProvider.reviewList(area, good, soso, bad, filter, userId);
    return res.send(reviewListResult);
}


/**
 * API No. 27
 * API Name : 특정 리뷰 조회
 * [GET] /reviews/:reviewId
 */
exports.getReview = async function(req, res) {
    const id = req.params.reviewId;
    const retrieveReviewListResult = await reviewProvider.retrieveReviewList(id);
    return res.send(retrieveReviewListResult);
}



/**
 * API No. 28
 * API Name : 리뷰 쓰기
 * [POST] /reviews
 */
exports.postReviews = async function (req, res) {
    const restaurantId = req.query.restaurantId;
    const userId = req.verifiedToken.userId;
    let {content, imageURL, score} = req.body;

    //빈값 체크
    if(!score) {
        return res.send(errResponse(baseResponse.REVIEW_SCORE_EMPTY));
    }
    else if(score == 1) {
        score = 5;
    }
    else if(score == 2) {
        score = 2.5;
    }
    else if(score == 3) {
        score = 0;
    }

    if(!content)
        return res.send(errResponse(baseResponse.REVIEW_CONTENT_EMPTY));
    else if(content.length<1 || content.length>10000)
        return res.send(errResponse(baseResponse.REVIEW_CONTENT_LENGTH));


    if(imageURL)
        imageURL = imageURL.split(', ');
    const postReviewResult = await reviewService.postReview(userId, restaurantId, content, imageURL, score);
    return res.send(response(baseResponse.SUCCESS));
};


/**
 * API No. 29
 * API Name : 리뷰 댓글 보기 API
 * [GET] /reviews/:reviewId/comment
 */
exports.getComments = async function(req, res) {
    const reviewId = req.params.reviewId

    const commentListResult = await reviewProvider.commentList(reviewId);
    return res.send(commentListResult);
}

/**
 * API No. 30
 * API Name : 리뷰 댓글 달기 API
 * [POST] /reviews/:reviewId/comment
 */
exports.postComments = async function(req, res) {
    const reviewId = req.params.reviewId;
    const userId = req.verifiedToken.userId;
    const {content, replyUserId} = req.body;  //replyUserId는 언급할 경우에만 작성

    if(!content)
        return send(errResponse(baseResponse.COMMENT_CONTENT_EMPTY));
    if(replyUserId != null) {
        if(userId == replyUserId)
            return send(errResponse(baseResponse.CANNOT_REPLY_MINE))
    }

    const postCommentResult = await reviewService.postComment(reviewId, userId, content, replyUserId);
    return res.send(postCommentResult);
}

/**
 * API No. 31
 * API Name : 리뷰 좋아요 버튼 API
 * [POST] /reviews/:reviewId/like
 */
exports.postReviewLike = async function(req, res) {
    const reviewId = req.params.reviewId;
    const userId = req.verifiedToken.userId;

    const updateReviewLikeResult = await reviewService.updateReviewLikeResult(reviewId, userId);
    return res.send(updateReviewLikeResult);
}

/**
 * API No. 32
 * API Name : 소식-팔로잉탭 API
 * [GET] /reviews/following/tab
 */
exports.getFollowingReviews = async function(req, res) {
    const area = req.query.area;
    const good = req.query.good;
    const soso = req.query.soso;
    const bad = req.query.bad;
    const userId = req.verifiedToken.userId;

    if(!good && !soso && !bad) {
        return res.send(response(baseResponse.SCORE_EMPTY))
    }
    if(!area) {
        return res.send(response(baseResponse.AREA_EMPTY))
    }
    const followingReviewListResult = await reviewProvider.followingReviewList(area, good, soso, bad, userId);
    return res.send(response(baseResponse.SUCCESS,followingReviewListResult));
}




/**
 * API No. 33
 * API Name : 리뷰 댓글 언급 유저 목록 조회 API
 * [GET] /reviews/:reviewId/comment/user
 */
exports.getCommentUser = async function(req, res) {
    const userId = req.verifiedToken.userId;
    const reviewId = req.params.reviewId;

    const commentUserListResult = await reviewProvider.commentUserList(reviewId);
    return res.send(response(baseResponse.SUCCESS,commentUserListResult));
}

/**
 * API No. 49
 * API Name : 리뷰 댓글 수정하기 API
 * [PATCH] /reviews/:reviewId/comment
 */
/*exports.patchComments = async function(req, res) {
    const reviewId = req.params.reviewId;
    const userId = req.verifiedToken.userId;
    const {content, parentsId} = req.body;  //parentsId는 답글일 경우에만 작성

    const patchCommentResult = await reviewService.patchComment(reviewId, userId, content, parentsId);
    return res.send(patchCommentResult);
}*/




