module.exports = function(app){
    const review = require('./reviewController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');


    //26. 전체리뷰조회(소식 탭) API
    app.get('/reviews', review.getReviews);

    //27. 특정 리뷰 조회 APi
    app.get('/reviews/:reviewId',review.getReview);

    //28. 리뷰 작성 API
    app.post('/reviews',jwtMiddleware, review.postReviews);

    //29. 리뷰 댓글조회 API
    app.get('/reviews/:reviewId/comment',review.getComments);

    //30. 리뷰 댓글달기 API
    app.post('/reviews/:reviewId/comment',jwtMiddleware,review.postComments);

    //31. 리뷰 좋아요 버튼 API
    app.post('/reviews/:reviewId/like', jwtMiddleware, review.postReviewLike);

    //32. 소식-팔로잉탭 API
    app.get('/reviews/following/tab',jwtMiddleware, review.getFollowingReviews)

    //33. 리뷰 댓글 언급 유저 목록 조회 API
    app.get('/reviews/:reviewId/comment/user', jwtMiddleware, review.getCommentUser);

    //리뷰 댓글 수정하기 API
    //app.patch('/reviews/:reviewId/comment', jwtMiddleware, review.patchComments);
};