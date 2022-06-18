//지역별 가게 조회 쿼리
async function restaurantInfo(connection, choiceArea, choiceOrder, choiceFood, choiceCategory, choicePrice, choicePark) {
    const selectRestaurantQuery = `
        select r.id, ifnull(x.imageURL,'https://jimango.s3.ap-northeast-2.amazonaws.com/%EC%BA%A1%EC%B2%98.PNG') imageURL, r.name,
            case
                when r.distance<1000
                    then concat(a.smallRange,'-',r.distance,'m')
                else
                    concat(a.smallRange,'-',round(r.distance*0.001,1),'km') end as distance,
               cast(r.viewCount as char(2)) viewCount, cast(ifnull(j.count,0) as char(5)) reviewCount,
            ifnull(round(j.avg,1),'') avg
        from Restaurant r
            join Area a on r.areaId = a.id
            left join (
            select count(rv.id) count, avg(rv.score) avg, rv.restaurantId rid, rv.id rvid
            from Review rv
            group by rv.restaurantId
            ) j on j.rid = r.id
            left join UserHopeRestaurant uhr on uhr.restaurantId = r. id
            left join User u on u.id = uhr.userId
            left join UserGoRestaurant ugr on ugr.restaurantId = r.id
            left join User u2 on u2.id = ugr.userId
            left join (
            select rv.id, ri.imageURL, rv.restaurantId
            from Review rv
            left join ReviewImage ri on ri.reviewId = rv.id
            group by rv.restaurantId) x on x.restaurantId = r.id
        `+choiceArea+`
        `+choiceFood+`
        `+choiceCategory+`
        `+choicePrice+`
        `+choicePark+`
        `+choiceOrder+`
        group by r.id;
        limit `+page+`,20;
    `;
    const [selectRestaurantRow] = await connection.query(selectRestaurantQuery);
    return selectRestaurantRow;

}

//임의
//지역별 가게 조회 쿼리
async function RInfo(connection, choiceArea, choiceOrder, choiceFood, choicePrice, choicePark) {
    console.log(choiceArea)
    const selectRQuery = `
        select r.id, ifnull(x.imageURL,'https://jimango.s3.ap-northeast-2.amazonaws.com/%EC%BA%A1%EC%B2%98.PNG') imageURL, r.name,
               case
                   when r.distance<1000
                       then concat(a.smallRange,'-',r.distance,'m')
                   else
                       concat(a.smallRange,'-',round(r.distance*0.001,1),'km') end as distance,
               cast(r.viewCount as char(2)) viewCount, cast(ifnull(j.count,0) as char(5)) reviewCount,
               ifnull(round(j.avg,1),'') avg
        from Restaurant r
            join Area a on r.areaId = a.id
            left join (
            select count(rv.id) count, avg(rv.score) avg, rv.restaurantId rid, rv.id rvid
            from Review rv
            group by rv.restaurantId
            ) j on j.rid = r.id
            left join UserHopeRestaurant uhr on uhr.restaurantId = r. id
            left join User u on u.id = uhr.userId
            left join UserGoRestaurant ugr on ugr.restaurantId = r.id
            left join User u2 on u2.id = ugr.userId
            left join (
            select rv.id, ri.imageURL, rv.restaurantId
            from Review rv
            left join ReviewImage ri on ri.reviewId = rv.id
            group by rv.restaurantId
            )x on x.restaurantId = r.id
        `+choiceArea+`
        `+choiceFood+`
        `+choicePrice+`
        `+choicePark+`
        group by r.id
        `+choiceOrder+`
    `;
    const [selectRRow] = await connection.query(selectRQuery);
    return selectRRow;
}

//특정 가게 조회 쿼리
async function getRestaurantInfo(connection, id) {
    const retrieveRestaurantQuery = `
        select ifnull(substring_index(group_concat(x.imageURL SEPARATOR ','), ',', 5),'https://jimango.s3.ap-northeast-2.amazonaws.com/%ED%8A%B9%EC%A0%95%EA%B0%80%EA%B2%8C+%EA%B8%B0%EB%B3%B8%ED%99%94%EB%A9%B4.PNG') image,
               r.name,
               cast(r.viewCount as char(2)) viewCount,
               cast(ifnull(y.hopeCount,0) as char(2)) hopeCount,
               cast(ifnull(j.count,0) as char(2)) reviewCount,
               round(j.avg,1) avg,
               r.roadLocation roadLocation,
               r.groundLocation groundLocation,
               r.phoneNumber,
               r.time,
               case
                   when r.price =0
                       then '만원미만'
                   else
                       concat(r.price,'만원-',r.price+1,'만원') end as price
            from Restaurant r
            join Area a on r.areaId = a.id
            left join (
            select count(rv.id) count, avg(rv.score) avg, rv.restaurantId rid, rv.id rvid
            from Review rv
            group by rv.restaurantId
            ) j on j.rid = r.id
            left join (
            select count(uhr.id) hopeCount, r.id, uhr.userId
            from UserHopeRestaurant uhr
            join Restaurant r on uhr.restaurantId = r. id
            where r.id = ?
            ) y on y.id = r.id
            left join UserGoRestaurant ugr on ugr.restaurantId = r.id
            left join User u2 on u2.id = ugr.userId
            left join (
            select rv.id, ri.imageURL, rv.restaurantId
            from Review rv
            left join ReviewImage ri on ri.reviewId = rv.id) x on x.restaurantId = r.id
        where r.id = ?
        group by r.name;
    `;

    const [retrieveRestaurantRow] = await connection.query(retrieveRestaurantQuery, [id, id]);
    return retrieveRestaurantRow;
}

//특정가게 리뷰수, 리뷰 조회
async function getReviewCountInfo(connection, id) {
    const reviewCountQuery = `
        select cast(ifnull(x.goodCount,0) as char(10)) goodCount,
               cast(ifnull(y.sosoCount,0) as char(10)) sosoCount,
               cast(ifnull(z.badCount,0) as char(10)) badCount
        from Restaurant r
                 left join (
            select count(rv.id) goodCount, r.id restaurantId
            from Review rv
                     join Restaurant r on rv.restaurantId = r.id
            where rv.score = 5
            group by r.id
        ) x on x.restaurantId = r.id
                 left join (
            select count(rv.id) sosoCount, r.id restaurantId
            from Review rv
                     join Restaurant r on rv.restaurantId = r.id
            where rv.score = 2.5
            group by r.id
        ) y on y.restaurantId = r.id
                 left join (
            select count(rv.id) badCount, r.id restaurantId
            from Review rv
                     join Restaurant r on rv.restaurantId = r.id
            where rv.score = 0
            group by r.id
        ) z on z.restaurantId = r.id
        where r.id = ?;
    `;
    const retrieveReviewQuery = `
        select rv.id reviewId, u.id userId,
               ifnull(u.profileImage,'https://jimango.s3.ap-northeast-2.amazonaws.com/%ED%94%84%EC%82%AC%EA%B8%B0%EB%B3%B8.jpg') profileImage,
               u.nickname,
               u.isHolic,
               cast(ifnull(y.count,0) as char(2)) reviewCount,
               cast(ifnull(x.count,0) as char(2)) followerCount,
               case rv.score
                   when 5 then '맛있다!'
                   when 2.5 then '괜찮다.'
                   when 0 then '별로' end as avg,
               substr(rv.content,1,150) content, group_concat(DISTINCT z.image) image,
               cast(ifnull(h.likeCount,0) as char(2)) likeCount, cast(ifnull(i.commentCount,0) as char(2)) commentCount,
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
        where r.id = ?
        and rv.status = 0
        group by rv.id
        order by rv.createdAt
        limit 3;
    `;

    const [restaurantReviewInfoRow] = await connection.query(reviewCountQuery + retrieveReviewQuery, [id, id]);
    return restaurantReviewInfoRow;
}

//특정가게 조회수 올리기
async function setViewCountInfo(connection, id) {
    const setViewCountInfoQuery = `
        UPDATE Restaurant
        SET viewCount = viewCount+1
        WHERE id = ?
    `;
    const [setViewCountInfoRow] = await connection.query(setViewCountInfoQuery, id);
    return setViewCountInfoRow;
}

//특정가게 이미지 조회
async function getRestaurantImageInfo(connection, id) {
    const getRestaurantImageInfoQuery = `
        select ri.id, r.name name, ri.imageURL
        from ReviewImage ri
                 join Review rv on rv.id = ri.reviewId
                 join Restaurant r on rv.restaurantId = r.id
        where r.id = ?;
    `;
    const [getRestaurantImageInfoRow] = await connection.query(getRestaurantImageInfoQuery, id);
    return getRestaurantImageInfoRow;
}

//가게 메뉴 조회
async function getRestaurantMenuInfo(connection, id) {
    const getRestaurantMenuInfoQuery = `
        select rm.menu, rm.price, 
               date_format(rm.updatedAt,'%Y-%m-%d') updatedAt
        from RestaurantMenu rm
        join Restaurant r on r.id = rm.restaurantId
        where r.id = ?;
    `;

    const getMenuImageQuery = `
        select r.name, group_concat(ri.imageURL) imageURL
        from Restaurant r
                 left join Review rv on rv.restaurantId = r.id
                 left join ReviewImage ri on ri.reviewId = rv.id
        where r.id = ?
          and ri.isMenu = 1
          and ri.status = 0;
    `;
    const [getRestaurantMenuInfoRow] = await connection.query(getRestaurantMenuInfoQuery + getMenuImageQuery, [id,id]);
    return getRestaurantMenuInfoRow;
}

//가게 상세정보 조회
async function getRestaurantInformationInfo(connection, id) {
    const getRestaurantInformationInfoQuery = `
        select r.name,
               date_format(r.updatedAt,'%Y-%m-%d') updatedAt,
               r.time, r.holiday, r.price, r.foodType, r.parking,r.site, r.breakTime,
               ifnull(u.nickname, '망고플레이트') foundUser,
               u.id userId
        from Restaurant r
                 left join User u on u.id = r.userId
        where r.id = ?;
    `;
    const [getRestaurantInformationInfoRow] = await connection.query(getRestaurantInformationInfoQuery, id);
    return getRestaurantInformationInfoRow;
}

//가게 리뷰 조회
async function getReviewInfo(connection, id, condition) {
    const getReviewInfoQuery = `
        select r.name restaurant, rv.id reviewId, u.id userId, 
               ifnull(u.profileImage,'https://jimango.s3.ap-northeast-2.amazonaws.com/%ED%94%84%EC%82%AC%EA%B8%B0%EB%B3%B8.jpg') profileImage,
               u.nickname, 
               u.isHolic,
               cast(ifnull(y.count,0) as char(2)) reviewCount, 
               cast(ifnull(x.count,0) as char(2)) followerCount,
               case rv.score
                   when 5 then '맛있다!'
                   when 2.5 then '괜찮다.'
                   when 0 then '별로' end as avg,
               substr(rv.content,1,150) content, group_concat(DISTINCT z.image) image,
               cast(ifnull(h.likeCount,0) as char(2)) likeCount, cast(ifnull(i.commentCount,0) as char(2)) commentCount,
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
        where r.id = ?
        and rv.status = 0
        `+condition+`
        group by rv.id
        order by rv.createdAt;
    `;
    const [getReviewInfoRow] = await connection.query(getReviewInfoQuery, id);
    return getReviewInfoRow;
}

async function insertRestaurantInfo(connection, infoParams) {
    const insertRestaurantQuery = `
    INSERT INTO Restaurant(userId, name, areaId, roadLocation,groundLocation ,phoneNumber,foodType, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;
    const insertRestaurantRow = await connection.query(insertRestaurantQuery, infoParams);
    return insertRestaurantRow[0];
}

//지역 id로 검색
async function areaCheckInfo(connection, areaId) {
    const areaCheckInfoQuery = `
        select *
        from Area
        where id = ?
  `;
    const areaCheckInfoRow = await connection.query(areaCheckInfoQuery, areaId);
    return areaCheckInfoRow[0];
}

//가고싶다 상태 체크
async function hopeCheckInfo(connection, restaurantId, userId) {
    const hopeCheckInfoQuery = `
        select uhr.status
        from UserHopeRestaurant uhr
        where uhr.restaurantId = ?
        and uhr.userId = ?;
    `;
    const [hopeCheckInfoRow] = await connection.query(hopeCheckInfoQuery, [restaurantId, userId]);
    return hopeCheckInfoRow;
}

//가고싶다 insert
async function insertHopeInfo(connection, restaurantId, userId) {
    const insertHopeInfoQuery = `
    INSERT INTO UserHopeRestaurant(restaurantId, userId)
    VALUES (?, ?);
  `;
    const insertHopeInfoRow = await connection.query(insertHopeInfoQuery, [restaurantId, userId]);
    return insertHopeInfoRow[0];
}

//가고싶다 update
async function updateHopeInfo(connection, restaurantId, userId, status) {
    const updateHopeInfoQuery = `
  UPDATE UserHopeRestaurant
  SET status = ?
  WHERE restaurantId = ?
  AND userId = ?;
  `;
    const updateHopeInfoRow = await connection.query(updateHopeInfoQuery, [status, restaurantId, userId]);
    return updateHopeInfoRow[0];
}

//내가 등록한 식당목록 조회
async function getMyRestaurantsInfo(connection, userId) {
    const getMyRestaurantsQuery = `
        select r.id restaurantId,
               ifnull(x.imageURL,'https://jimango.s3.ap-northeast-2.amazonaws.com/%EC%BA%A1%EC%B2%98.PNG') imageURL,
               r.name,
               r.roadLocation,
               case
                   when timestampdiff(minute,r.createdAt,current_timestamp()) < 60
                       then concat(timestampdiff(minute,r.createdAt,current_timestamp()),' 분 전')
                   when timestampdiff(hour,r.createdAt,current_timestamp()) < 24
                       then concat(timestampdiff(hour,r.createdAt,current_timestamp()),' 시간 전')
                   when timestampdiff(day, r.createdAt, current_timestamp()) < 8
                       then concat(timestampdiff(day, r.createdAt, current_timestamp()),'일 전')
                   else
                       date_format(r.createdAt, '%Y-%m-%d') end as date
        from Restaurant r
            left join (
            select rv.id, ri.imageURL, rv.restaurantId
            from Review rv
            left join ReviewImage ri on ri.reviewId = rv.id
            group by rv.restaurantId
            ) x on x.restaurantId = r.id
        where userId = ?
        and r.status = 0
    `;
    const [getMyRestaurantsRow] = await connection.query(getMyRestaurantsQuery, userId);
    return getMyRestaurantsRow;
}

//식당 검색
async function restaurantCheckInfo(connection, restaurantId) {
    const restaurantCheckQuery = `
  select r.id, r.userId
  from Restaurant r
  where r.id = ?
  `;
    const restaurantCheckRow = await connection.query(restaurantCheckQuery, restaurantId);
    return restaurantCheckRow[0];
}

//가게 삭제
async function patchRestaurantInfo(connection, id) {
    const setViewCountInfoQuery = `
        UPDATE Restaurant
        SET status = 1
        WHERE id = ?
    `;
    const [setViewCountInfoRow] = await connection.query(setViewCountInfoQuery, id);
    return setViewCountInfoRow;
}



module.exports = {
    restaurantInfo,
    getRestaurantInfo,
    getReviewCountInfo,
    setViewCountInfo,
    getRestaurantImageInfo,
    getRestaurantMenuInfo,
    getRestaurantInformationInfo,
    getReviewInfo,
    RInfo,
    insertRestaurantInfo,
    areaCheckInfo,
    hopeCheckInfo,
    insertHopeInfo,
    updateHopeInfo,
    getMyRestaurantsInfo,
    restaurantCheckInfo,
    patchRestaurantInfo
};
