//전체리뷰조회 + 필터링
async function reviewInfo(connection, condition, conditionUser) {
    const selectReviewQuery = `
        select rv.id,
               ifnull(u.profileImage,'https://jimango.s3.ap-northeast-2.amazonaws.com/%ED%94%84%EC%82%AC%EA%B8%B0%EB%B3%B8.jpg') profileImage,
               u.nickname,
               u.isHolic,
               cast(ifnull(y.count, 0) as char(2)) reviewCount,
               cast(ifnull(x.count, 0) as char(2)) followerCount,
       case rv.score
        when 5 then '맛있다!'
        when 2.5 then '괜찮다'
        when 0 then '별로' end as avg,
       concat(r.name,' - ',a.smallRange) restaurant,substr(rv.content,1,150) content, group_concat(DISTINCT z.image) image,
       cast(h.likeCount as char(2)) likeCount, cast(i.commentCount as char(2)) commentCount,
       case
        when timestampdiff(minute,rv.createdAt,current_timestamp()) < 60
            then concat(timestampdiff(minute,rv.createdAt,current_timestamp()),' 분 전')
        when timestampdiff(hour,rv.createdAt,current_timestamp()) < 24
            then concat(timestampdiff(hour,rv.createdAt,current_timestamp()),' 시간 전')
        when timestampdiff(day, rv.createdAt, current_timestamp()) < 8
            then concat(timestampdiff(day, rv.createdAt, current_timestamp()),'일 전')
        else
            date_format(rv.createdAt, '%Y-%m-%d') end as date
from Review rv
join User u on u.id = rv.userId
join Restaurant r on r.id = rv.restaurantId
join Area a on r.areaId = a.id
left join ReviewImage ri on ri.reviewId = r.id
left join (
      select f.followId, f.userId, count(f.userId) count
      from Follow f
      join User u on f.followId = u.id
      group by u.id
    ) x on x.followId = u.id
left join (
    select u.nickname, u.id, count(rv.id) count
    from User u
    left join Review rv on rv.userId = u.id
    group by nickname
    ) y on y.id = u.id
left join (
    select rv.id, rv.content, group_concat(ri.imageURL) image
    from Review rv
    left join ReviewImage ri on ri.reviewId = rv.id
    group by rv.id
    ) z on z.id = rv.id
left join (
    select rv.id, count(rl.id) likeCount
    from Review rv
    left join ReviewLike rl on rl.reviewId = rv.id
    group by rv.id
    ) h on h.id = rv.id
left join (
    select rv.id, count(rc.id) commentCount
    from Review rv
    left join ReviewComment rc on rc.reviewId = rv.id
    group by rv.id
    ) i on i.id = rv.id
`+condition+`
`+conditionUser+`
group by rv.id
order by rv.createdAt;
    `;
    const [selectReviewRow] = await connection.query(selectReviewQuery);
    return selectReviewRow;
}

async function myReviewInfo(connection, condition, conditionUser) {
    const selectMyReviewQuery = `
        select rv.id,
               ifnull(u.profileImage,'https://jimango.s3.ap-northeast-2.amazonaws.com/%ED%94%84%EC%82%AC%EA%B8%B0%EB%B3%B8.jpg') profileImage,
               u.nickname,
               u.isHolic,
               cast(ifnull(y.count, 0) as char(2)) reviewCount,
               cast(ifnull(x.count, 0) as char(2)) followerCount,
               case rv.score
                   when 5 then '맛있다!'
                   when 2.5 then '괜찮다'
                   when 0 then '별로' end as avg,
       concat(r.name,' - ',a.smallRange) restaurant,substr(rv.content,1,150) content, group_concat(DISTINCT z.image) image,
       cast(h.likeCount as char(2)) likeCount, cast(i.commentCount as char(2)) commentCount,
       case
        when timestampdiff(minute,rv.createdAt,current_timestamp()) < 60
            then concat(timestampdiff(minute,rv.createdAt,current_timestamp()),' 분 전')
        when timestampdiff(hour,rv.createdAt,current_timestamp()) < 24
            then concat(timestampdiff(hour,rv.createdAt,current_timestamp()),' 시간 전')
        when timestampdiff(day, rv.createdAt, current_timestamp()) < 8
            then concat(timestampdiff(day, rv.createdAt, current_timestamp()),'일 전')
        else
            date_format(rv.createdAt, '%Y-%m-%d') end as date
from Review rv
join User u on u.id = rv.userId
join Restaurant r on r.id = rv.restaurantId
join Area a on r.areaId = a.id
left join ReviewImage ri on ri.reviewId = r.id
left join (
      select f.followId, f.userId, count(f.userId) count
      from Follow f
      join User u on f.followId = u.id
      group by u.id
    ) x on x.followId = u.id
left join (
    select u.nickname, u.id, count(rv.id) count
    from User u
    left join Review rv on rv.userId = u.id
    group by nickname
    ) y on y.id = u.id
left join (
    select rv.id, rv.content, group_concat(ri.imageURL) image
    from Review rv
    left join ReviewImage ri on ri.reviewId = rv.id
    group by rv.id
    ) z on z.id = rv.id
left join (
    select rv.id, count(rl.id) likeCount
    from Review rv
    left join ReviewLike rl on rl.reviewId = rv.id
    group by rv.id
    ) h on h.id = rv.id
left join (
    select rv.id, count(rc.id) commentCount
    from Review rv
    left join ReviewComment rc on rc.reviewId = rv.id
    group by rv.id
    ) i on i.id = rv.id
`+condition+`
`+conditionUser+`
group by rv.id
order by rv.createdAt;
    `;
    const [selectMyReviewRow] = await connection.query(selectMyReviewQuery);
    return selectMyReviewRow;
}

//특정 리뷰 조회
async function retreiveReviewInfo(connection, id) {
    const retreiveReviewQuery = `
        select rv.id reviewId, u.id userId, u.profileImage, u.nickname, u.isHolic,cast(y.count as char(2)) reviewCount, cast(x.count as char(2)) followerCount,
       case rv.score
        when 5 then '맛있다!'
        when 2.5 then '괜찮다'
        when 0 then '별로' end as avg,
       concat(r.name,' - ',a.smallRange) restaurant,substr(rv.content,1,150) content, group_concat(DISTINCT z.image) image,
       cast(h.likeCount as char(2)) likeCount, cast(i.commentCount as char(2)) commentCount,
       case
        when timestampdiff(minute,rv.createdAt,current_timestamp()) < 60
            then concat(timestampdiff(minute,rv.createdAt,current_timestamp()),' 분 전')
        when timestampdiff(hour,rv.createdAt,current_timestamp()) < 24
            then concat(timestampdiff(hour,rv.createdAt,current_timestamp()),' 시간 전')
        when timestampdiff(day, rv.createdAt, current_timestamp()) < 8
            then concat(timestampdiff(day, rv.createdAt, current_timestamp()),'일 전')
        else
            date_format(rv.createdAt, '%Y-%m-%d') end as date
from Review rv
join User u on u.id = rv.userId
join Restaurant r on r.id = rv.restaurantId
join Area a on r.areaId = a.id
left join ReviewImage ri on ri.reviewId = r.id
left join (
      select f.followId, f.userId, count(f.userId) count
      from Follow f
      join User u on f.followId = u.id
      group by u.id
    ) x on x.followId = u.id
left join (
    select u.nickname, u.id, count(rv.id) count
    from User u
    left join Review rv on rv.userId = u.id
    group by nickname
    ) y on y.id = u.id
left join (
    select rv.id, rv.content, group_concat(ri.imageURL) image
    from Review rv
    left join ReviewImage ri on ri.reviewId = rv.id
    group by rv.id
    ) z on z.id = rv.id
left join (
    select rv.id, count(rl.id) likeCount
    from Review rv
    left join ReviewLike rl on rl.reviewId = rv.id
    where rl.status = 0
    group by rv.id
    ) h on h.id = rv.id
left join (
    select rv.id, count(rc.id) commentCount
    from Review rv
    left join ReviewComment rc on rc.reviewId = rv.id
    group by rv.id
    ) i on i.id = rv.id
where rv.id = ?
group by rv.id
order by rv.createdAt;
    `;
    const [retreiveReviewRow] = await connection.query(retreiveReviewQuery, id);
    return retreiveReviewRow;
}

//팔로잉한 유저 리뷰 조회
async function followingReviewInfo(connection, condition, userId) {
    const selectFollowingReviewQuery = `
        select rv.id, u.profileImage, u.nickname, u.isHolic,cast(y.count as char(2)) reviewCount, cast(x.count as char(2)) followerCount,
       case rv.score
        when 5 then '맛있다!'
        when 2.5 then '괜찮다'
        when 0 then '별로' end as avg,
       concat(r.name,' - ',a.smallRange) restaurant,rv.content, group_concat(DISTINCT z.image) image,
       cast(h.likeCount as char(2)) likeCount, cast(i.commentCount as char(2)) commentCount,
       case
        when timestampdiff(minute,rv.createdAt,current_timestamp()) < 60
            then concat(timestampdiff(minute,rv.createdAt,current_timestamp()),' 분 전')
        when timestampdiff(hour,rv.createdAt,current_timestamp()) < 24
            then concat(timestampdiff(hour,rv.createdAt,current_timestamp()),' 시간 전')
        when timestampdiff(day, rv.createdAt, current_timestamp()) < 8
            then concat(timestampdiff(day, rv.createdAt, current_timestamp()),'일 전')
        else
            date_format(rv.createdAt, '%Y-%m-%d') end as date
from Review rv
join User u on u.id = rv.userId
join Restaurant r on r.id = rv.restaurantId
join Area a on r.areaId = a.id
left join ReviewImage ri on ri.reviewId = r.id
left join (
      select f.followId, f.userId, count(f.userId) count
      from Follow f
      join User u on f.followId = u.id
      group by u.id
    ) x on x.followId = u.id
left join (
    select u.nickname, u.id, count(rv.id) count
    from User u
    left join Review rv on rv.userId = u.id
    group by nickname
    ) y on y.id = u.id
left join (
    select rv.id, rv.content, group_concat(ri.imageURL) image
    from Review rv
    left join ReviewImage ri on ri.reviewId = rv.id
    group by rv.id
    ) z on z.id = rv.id
left join (
    select rv.id, count(rl.id) likeCount
    from Review rv
    left join ReviewLike rl on rl.reviewId = rv.id
    group by rv.id
    ) h on h.id = rv.id
left join (
    select rv.id, count(rc.id) commentCount
    from Review rv
    left join ReviewComment rc on rc.reviewId = rv.id
    group by rv.id
    ) i on i.id = rv.id
    `+condition+`
and x.userId = ?
group by rv.id
order by rv.createdAt;
    `;
    const [selectFollowingReviewRow] = await connection.query(selectFollowingReviewQuery, userId);
    return selectFollowingReviewRow;
}

//리뷰 작성
async function updateReviewInfo(connection, userId, restaurantId, content, score) {
    const updateReviewQuery = `
        INSERT INTO Review(userId, restaurantId, content, score)
        VALUES (?, ?, ?, ?);
    `;
    const [updateReviewRow] = await connection.query(
        updateReviewQuery,
        [userId, restaurantId, content, score]
    );

    return updateReviewRow;
}

//리뷰이미지 insert
async function updateReviewImageInfo(connection, reviewId, imageURL) {
    const updateReviewImageQuery = `
        INSERT INTO ReviewImage(reviewId, imageURL)
        VALUES (?, ?);
    `;
    const [updateReviewImageRow] = await connection.query(updateReviewImageQuery, [reviewId, imageURL]);

    return updateReviewImageRow;
}

//좋아요 상태 체크
async function reviewLikeCheckInfo(connection, reviewId, userId) {
    const reviewLikeCheckQuery = `
        select rl.status
        from ReviewLike rl
        where rl.reviewId = ?
        and rl.userId = ?;
    `;
    const [reviewLikeCheckRow] = await connection.query(reviewLikeCheckQuery, [reviewId, userId]);
    return reviewLikeCheckRow;
}


//리뷰 댓글 조회
async function getCommentInfo(connection, id) {
    const getCommentQuery = `
        select u.id userId, u.profileImage, u.nickname writer, u.isHolic, u2.nickname, rc.content,
               case rc.status when 2 then case
                                              when timestampdiff(minute,rc.updatedAt,current_timestamp()) < 60
                                                  then concat(timestampdiff(minute,rc.updatedAt,current_timestamp()),' 분 전(수정됨)')
                                              when timestampdiff(hour,rc.updatedAt,current_timestamp()) < 24
                                                  then concat(timestampdiff(hour,rc.updatedAt,current_timestamp()),' 시간 전(수정됨)')
                                              when timestampdiff(day, rc.updatedAt, current_timestamp()) < 8
                                                  then concat(timestampdiff(day, rc.updatedAt, current_timestamp()),'일 전(수정됨)')
                                              else
                                                  date_format(rc.updatedAt, '%Y-%m-%d(수정됨)') end
                              when 0 then case
                                              when timestampdiff(minute,rc.createdAt,current_timestamp()) < 60
                                                  then concat(timestampdiff(minute,rc.createdAt,current_timestamp()),' 분 전')
                                              when timestampdiff(hour,rc.createdAt,current_timestamp()) < 24
                                                  then concat(timestampdiff(hour,rc.createdAt,current_timestamp()),' 시간 전')
                                              when timestampdiff(day, rc.createdAt, current_timestamp()) < 8
                                                  then concat(timestampdiff(day, rc.createdAt, current_timestamp()),'일 전')
                                              else
                                                  date_format(rc.createdAt, '%Y-%m-%d') end
                   end as date
        from ReviewComment rc
            join User u on rc.userId = u.id
            left join User u2 on rc.replyUserId = u2.id
        where rc.reviewId = ?
          and (rc.status =0 or rc.status=2);
    `;
    const [getCommentRow] = await connection.query(getCommentQuery, id);
    return getCommentRow;
}

//리뷰 댓글 달기
async function postCommentInfo(connection, reviewId, userId, content, parentsId) {
    const postCommentQuery = `
        INSERT INTO ReviewComment(userId, reviewId, content, replyUserId)
        VALUES (?, ?, ?, ?);
    `;
    const [postCommentRow] = await connection.query(postCommentQuery, [userId,reviewId,content, parentsId]);
    return postCommentRow;
}

//리뷰 특정 댓글 조회
async function myCommentInfo(connection, parentsId) {
    const myCommentQuery = `
        select rc.userId, rc.reviewId
        from ReviewComment rc
        where rc.id = ?
    `;
    const [myCommentRow] = await connection.query(myCommentQuery, parentsId);
    return myCommentRow;
}

//리뷰,댓글 단 유저 조회
async function commentUserInfo(connection, reviewId) {
    const commentUserQuery = `
        select u.profileImage, u.nickname, u.isHolic
        from ReviewComment rc
                 join User u on rc.userId = u.id
        where rc.reviewId = ?
        union
        select u.profileImage, u.nickname, u.isHolic
        from Review r
                 join User u on r.userId = u.id
        where r.id = ?
    `;
    const [commentUserRow] = await connection.query(commentUserQuery, [reviewId, reviewId]);
    return commentUserRow;
}

//리뷰 좋아요 insert
async function insertReviewLikeInfo(connection, reviewId, userId) {
    const insertReviewLikeQuery = `
    INSERT INTO ReviewLike(reviewId, userId)
    VALUES (?, ?);
  `;
    const insertReviewLikeRow = await connection.query(insertReviewLikeQuery, [reviewId, userId]);
    return insertReviewLikeRow[0];
}

//리뷰 좋아요 업데이트
async function updateReviewLikeInfo(connection, reviewId, userId, status) {
    const updateReviewLikeQuery = `
  UPDATE ReviewLike
  SET status = ?
  WHERE reviewId = ?
  AND userId = ?;
  `;
    const updateReviewLikeRow = await connection.query(updateReviewLikeQuery, [status, reviewId, userId]);
    return updateReviewLikeRow[0];
}




module.exports = {
    reviewInfo,
    updateReviewInfo,
    updateReviewImageInfo,
    retreiveReviewInfo,
    followingReviewInfo,
    getCommentInfo,
    postCommentInfo,
    myCommentInfo,
    commentUserInfo,
    reviewLikeCheckInfo,
    insertReviewLikeInfo,
    updateReviewLikeInfo,
};
