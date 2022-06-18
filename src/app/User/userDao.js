// 모든 유저 조회
async function selectUser(connection) {
  const selectUserListQuery = `
                SELECT email, nickname 
                FROM User;
                `;
  const [userRows] = await connection.query(selectUserListQuery);
  return userRows;
}

// 이메일로 회원 조회
async function selectUserEmail(connection, email) {
  const selectUserEmailQuery = `
                SELECT email, nickname
                FROM User
                WHERE email = ?;
                `;
  const [emailRows] = await connection.query(selectUserEmailQuery, email);
  return emailRows;
}

// userId 회원 조회
async function selectUserId(connection, userId) {
  const selectUserIdQuery = `
                 SELECT id, email, nickname, isSocial, status
                 FROM User 
                 WHERE id = ?;
                 `;
  const [userRow] = await connection.query(selectUserIdQuery, userId);
  return userRow;
}

// 유저 생성
async function insertUserInfo(connection, insertUserInfoParams) {
  const insertUserInfoQuery = `
        INSERT INTO User(email, password, nickname)
        VALUES (?, ?, ?);
    `;
  const insertUserInfoRow = await connection.query(
    insertUserInfoQuery,
    insertUserInfoParams
  );

  return insertUserInfoRow;
}

// 패스워드 체크
async function selectUserPassword(connection, selectUserPasswordParams) {
  const selectUserPasswordQuery = `
        SELECT email, nickname, password
        FROM User
        WHERE email = ?;`;
  const selectUserPasswordRow = await connection.query(
      selectUserPasswordQuery,
      selectUserPasswordParams
  );

  return selectUserPasswordRow;
}

// 유저 계정 상태 체크 (jwt 생성 위해 id 값도 가져온다.)
async function selectUserAccount(connection, email) {
  const selectUserAccountQuery = `
        SELECT status, id
        FROM User
        WHERE email = ?;`;
  const selectUserAccountRow = await connection.query(
      selectUserAccountQuery,
      email
  );
  return selectUserAccountRow[0];
}

async function updateNameinfo(connection, id, nickname) {
  const updateNameQuery = `
  UPDATE User
  SET nickname = ?
  WHERE id = ?;`;
  const updateNameRow = await connection.query(updateNameQuery, [nickname, id]);
  return updateNameRow[0];
}

async function updateEmailinfo(connection, id, email) {
  const updateEmailQuery = `
  UPDATE User
  SET email = ?
  WHERE id = ?;`;
  const updateEmailRow = await connection.query(updateEmailQuery, [email, id]);
  return updateEmailRow[0];
}

//번호 update
async function updatePhoneNumberInfo(connection, id, phoneNumber) {
  const updatePhoneNumberQuery = `
  UPDATE User
  SET phoneNumber = ?
  WHERE id = ?;`;
  const updatePhoneNumberRow = await connection.query(updatePhoneNumberQuery, [phoneNumber, id]);
  return updatePhoneNumberRow[0];
}

//유저 탈퇴
async function updatewithdrawinfo(connection, id) {
  const updateEmailQuery = `
  UPDATE User
  SET status = 1
  WHERE id = ?;`;
  const updateEmailRow = await connection.query(updateEmailQuery, id);
  return updateEmailRow[0];
}

async function selectUserInfo(connection) {
  const selectUserQuery = `
    select u.id, u.profileImage, u.nickname, u.isHolic, cast(y.count as char(2)) reviewCount, cast(ifnull(x.count, 0) as char(2)) followerCount
    from User u
           left join (
      select u.nickname, u.id, count(rv.id) count
      from User u
        left join Review rv on rv.userId = u.id
      group by nickname
    ) y on y.id = u.id
           left join (
      select u.id, u.nickname, count(f.followId) count, f.followId, f.userId
      from User u
        left join Follow f on f.followId = u.id
      group by nickname
    ) x on x.id = u.id
    where u.status = 0
    order by rand()
    limit 20;
  `;
  const [selectUserRow] = await connection.query(selectUserQuery);
  return selectUserRow;
}

//마이리스트 목록 조회
async function myListInfo(connection, userId) {
  const selectmyListQuery = `
    select ml.id listId, ml.listTitle, ml.listContent, cast(ifnull(x.bookmarkCount, 0) as char(10)) bookmarkCount, y.imageURL
    from MyList ml
           left join (
      select count(b.id) bookmarkCount, b.myListId
      from Bookmark b
             join MyList ml on ml.id = b.myListId
      where b.status = 0
      group by b.myListId
    ) x on x.myListId = ml.id
           left join MyListRestaurant mlr on mlr.myListId = ml.id
           left join Restaurant r on r.id = mlr.restaurantId
           left join (
      select rv.id, ri.imageURL, rv.restaurantId
      from Review rv
             left join ReviewImage ri on ri.reviewId = rv.id
      group by rv.restaurantId
    ) y on y.restaurantId = r.id
    where ml.status = 0
      and (mlr.status is null or mlr.status = 0)
      and ml.userId = ?
    group by ml.id;
  `;
  const [selectmyListRow] = await connection.query(selectmyListQuery, userId);
  return selectmyListRow;
}

//특정유저 리뷰조회
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
                   when 2.5 then '괜찮다.'
                   when 0 then '별로' end as avg,
       concat(r.name,'-',a.smallRange) restaurant,substr(rv.content,1,150) content, group_concat(DISTINCT z.image) image,
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

//유저 정보조회(타임라인 수, 팔로워 수 등)
async function retrieveUserInfo(connection, userId, condition) {
  const retrieveUserQuery = `
    select ifnull(u.profileImage,'https://jimango.s3.ap-northeast-2.amazonaws.com/%ED%94%84%EC%82%AC%EA%B8%B0%EB%B3%B8.jpg') profileImage,
           u.nickname,u.isHolic, cast(ifnull(x.count,0) as char(5)) followerCount, cast(ifnull(y.count,0) as char(5)) followingCount,
           cast(ifnull(count(rv.id),0) as char(10)) reviewCount,
           cast(ifnull(i.goCount,0) as char(10)) goCount,
           cast(ifnull(h.photoCount,0) as char(10)) photoCount,
           cast(ifnull(z.hopeCount,0) as char(10)) hopeCount,
           cast(ifnull(j.listCount,0) as char(10)) listCount
    from User u
           left join (
      select f.followId, f.userId, count(f.userId) count
      from Follow f
        join User u on f.followId = u.id
      where u.id = ?
    ) x on x.followId = u.id
           left join (
      select u.id userId, f.followId, count(f.followId) count
      from Follow f
        join User u on u.id = f.userId
      where u.id = ?
    ) y on y.userId = u.id
           left join (
      select count(uhr.id) hopeCount, uhr.userId
      from UserHopeRestaurant uhr
      where uhr.userId = ?
    ) z on z.userId = u.id
           left join (
      select count(ri.id) photoCount, rv.userId
      from ReviewImage ri
             right join Review rv on ri.reviewId = rv.id
      where rv.userId = ?
    ) h on h.userId = u.id
           left join (
      select count(ugr.id) goCount, ugr.userId
      from UserGoRestaurant ugr
      where ugr.userId = ?
        `+condition+`
    ) i on i.userId = u.id
           left join (
      select count(ml.id) listCount, ml.userId
      from MyList ml
      where ml.userId = ?
    ) j on j.userId = u.id
           left join Review rv on rv.userId = u.id
    where u.id = ?
  `;
  const [retrieveUserRow] = await connection.query(retrieveUserQuery, [userId,userId,userId,userId,userId,userId,userId]);
  return retrieveUserRow;
}

//팔로워 조회
async function selectFollowerInfo(connection, userId) {
  const selectFollowerQuery = `
    select f.userId, u.profileImage, u.nickname, u.nickname, cast(ifnull(y.count,0) as char(2)) reviewCount, cast(ifnull(x.count,0) as char(2)) followerCount
    from Follow f
           join User u on u.id = f.userId
           left join (
      select u.nickname, u.id, count(rv.id) count
      from User u
        left join Review rv on rv.userId = u.id
      group by nickname
    ) y on y.id = u.id
           left join (
      select u.id, u.nickname, count(f.followId) count, f.followId, f.userId
      from User u
        left join Follow f on f.followId = u.id
      group by nickname
    ) x on x.id = u.id
    where f.followId = ?
    and f.status = 0;
  `;
  const [selectFollowerRow] = await connection.query(selectFollowerQuery, userId);
  return selectFollowerRow;
}

//팔로잉 조회
async function selectFollowingInfo(connection, userId) {
  const selectFollowingQuery = `
    select f.followId, u.profileImage, u.nickname, u.nickname, cast(ifnull(y.count,0) as char(2)) reviewCount, cast(ifnull(x.count,0) as char(2)) followerCount
    from Follow f
           join User u on f.followId = u.id
           left join (
      select u.nickname, u.id, count(rv.id) count
      from User u
        left join Review rv on rv.userId = u.id
      group by nickname
    ) y on y.id = u.id
           left join (
      select u.id, u.nickname, count(f.followId) count, f.followId, f.userId
      from User u
        left join Follow f on f.followId = u.id
      group by nickname
    ) x on x.id = u.id
    where f.userId = ?
    and f.status = 0;
  `;
  const [selectFollowingRow] = await connection.query(selectFollowingQuery, userId);
  return selectFollowingRow;
}

//다른사람 가고싶다 리스트 조회
async function geUserHopeInfo(connection, userId, choiceArea, choiceOrder, choiceFood, choicePrice, choicePark) {
  const getMyHopeQuery = `
    select r.id restaurantId,
           ifnull(x.imageURL,'https://jimango.s3.ap-northeast-2.amazonaws.com/%EC%BA%A1%EC%B2%98.PNG') restaurantImage,
           a.smallRange, r.name,
           round(y.avg,1) avg,
       cast(r.viewCount as char(10)) viewCount,
       cast(ifnull(y.count, 0) as char(10)) reviewCount
    from UserHopeRestaurant uhr
      join Restaurant r on uhr.restaurantId = r.id
      join Area a on a.id = r.areaId
      left join (
      select rv.restaurantId, u.profileImage, u.nickname, substr(rv.content,1,150) content, ri.imageURL
      from Review rv
      join User u on rv.userId = u.id
      left join ReviewImage ri on ri.reviewId = rv.id
      ) x on x.restaurantId = r.id
      left join (
      select count(rv.id) count, avg(rv.score) avg, rv.restaurantId rid, rv.id rvid
      from Review rv
      group by rv.restaurantId
      ) y on y.rid = r.id
    where uhr.status = 0
      and uhr.userId = ?
      `+choiceArea+`
      `+choiceFood+`
      `+choicePrice+`
      `+choicePark+`
    group by r.id
    `+choiceOrder+`
  `;
  const [getMyHopeRow] = await connection.query(getMyHopeQuery, userId);
  return getMyHopeRow;
}

//내 가고싶다 리스트 조회
async function getMyHopeInfo(connection, userId, choiceArea, choiceOrder, choiceFood, choicePrice, choicePark) {
  const getMyHopeQuery = `
    select r.id restaurantId,
           ifnull(x.imageURL,'https://jimango.s3.ap-northeast-2.amazonaws.com/%EC%BA%A1%EC%B2%98.PNG') restaurantImage,
           a.smallRange, r.name,
           round(y.avg,1) avg,
       cast(r.viewCount as char(10)) viewCount,
       cast(ifnull(y.count, 0) as char(10)) reviewCount,
       uhr.reason
    from UserHopeRestaurant uhr
      join Restaurant r on uhr.restaurantId = r.id
      join Area a on a.id = r.areaId
      left join (
      select rv.restaurantId, u.profileImage, u.nickname, substr(rv.content,1,150) content, ri.imageURL
      from Review rv
      join User u on rv.userId = u.id
      left join ReviewImage ri on ri.reviewId = rv.id
      ) x on x.restaurantId = r.id
      left join (
      select count(rv.id) count, avg(rv.score) avg, rv.restaurantId rid, rv.id rvid
      from Review rv
      group by rv.restaurantId
      ) y on y.rid = r.id
    where uhr.status = 0
      and uhr.userId = ?
      `+choiceArea+`
      `+choiceFood+`
      `+choicePrice+`
      `+choicePark+`
    group by r.id
      `+choiceOrder+`
  `;
  const [getMyHopeRow] = await connection.query(getMyHopeQuery, userId);
  return getMyHopeRow;
}


//각 북마크 개수 조회
// async function getMyHopeInfo(connection, userId) {
//   const getMyHopeInfoQuery = `
//
//   `;
//   const [getMyHopeInfoRow] = await connection.query(getMyHopeInfoQuery, userId);
//   return getMyHopeInfoRow;
// }

//유저 프로필 설정
async function updateProfileImageInfo(connection, userId, image) {
  const updateProfileImageQuery = `
  UPDATE User
  SET profileImage = ?
  WHERE id = ?;`;
  const updateProfileImageRow = await connection.query(updateProfileImageQuery, [image, userId]);
  return updateProfileImageRow[0];
}

//팔로우 상태 체크
async function followCheckInfo(connection, followUserId, myUserId) {
  const followCheckInfoQuery = `
    select f.status
    from Follow f
    where f.followId = ?
    and f.userId = ?
  `;
  const [followCheckInfoRow] = await connection.query(followCheckInfoQuery, [followUserId, myUserId]);
  return followCheckInfoRow;
}

//팔로우 정보 insert
async function insertFollowInfo(connection, followUserId, myUserId) {
  const insertFollowQuery = `
    INSERT INTO Follow(followId, userId)
    VALUES (?, ?);
  `;
  const insertFollowRow = await connection.query(insertFollowQuery, [followUserId, myUserId]);
  return insertFollowRow[0];
}

//팔로우 상태 수정
async function updateFollowInfo(connection, followUserId, myUserId, status) {
  const updateFollowQuery = `
  UPDATE Follow
  SET status = ?
  WHERE followId = ?
  AND userId = ?;
  `;
  const updateFollowRow = await connection.query(updateFollowQuery, [status, followUserId, myUserId]);
  return updateFollowRow[0];
}

//위도, 경도 select
async function getLocationInfo(connection) {
  const getLocationInfoQuery = `
      select r.id, r.latitude, r.longitude
      from Restaurant r
  `;
  const getLocationInfoRow = await connection.query(getLocationInfoQuery);
  return getLocationInfoRow[0];
}

//거리 update
async function updateLocationInfo(connection, id, distance) {
  const updateLocationQuery = `
    UPDATE Restaurant
    SET distance = ?
    WHERE id = ?;
  `;
  const [updateLocationRow] = await connection.query(updateLocationQuery, [distance, id]);
  return updateLocationRow;
}

//거리 null로 update
async function setDistanceNull(connection) {
  const setDistanceNullQuery = `
    UPDATE Restaurant
    SET distance = null
    where not distance is null;
  `;
  const [setDistanceNullRow] = await connection.query(setDistanceNullQuery);
  return setDistanceNullRow;
}

module.exports = {
  selectUser,
  selectUserEmail,
  selectUserId,
  insertUserInfo,
  selectUserPassword,
  selectUserAccount,
  selectUserInfo,
  selectFollowerInfo,
  selectFollowingInfo,
  updateNameinfo,
  updateEmailinfo,
  updatePhoneNumberInfo,
  updatewithdrawinfo,
  retrieveUserInfo,
  geUserHopeInfo,
  getMyHopeInfo,
  //getBookmarkInfo,
  updateProfileImageInfo,
  followCheckInfo,
  insertFollowInfo,
  updateFollowInfo,
  getLocationInfo,
  updateLocationInfo,
  setDistanceNull,
  myListInfo,
  myReviewInfo
};
