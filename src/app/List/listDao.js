//리스트 id로 리스트 검색
async function selectListInfo(connection, myListId) {
  const selectListQuery = `
    select ml.id, ml.userId, ml.status
    from MyList ml
    where ml.id = ?
  `;
  const [selectListRow] = await connection.query(selectListQuery, myListId);
  return selectListRow;
}

async function retrieveMyListInfoResult(connection, myListId) {
  const retrieveMyListQuery = `
    select date_format(ml.updatedAt,'%Y-%m-%d') updatedAt, cast(ml.viewCount as char(10)) viewCount, cast(ifnull(x.bookmarkCount, 0) as char(10)) bookmarkCount,
           ml.listTitle,
           ifnull(u.profileImage,'https://jimango.s3.ap-northeast-2.amazonaws.com/%ED%94%84%EC%82%AC%EA%B8%B0%EB%B3%B8.jpg') profileImage,
           u.nickname,cast(ifnull(y.reviewCount,0) as char(10)) reviewCount,
           cast(ifnull(z.count,0) as char(5)) followerCount,
           ml.listContent
    from MyList ml
           join User u on ml.userId = u.id
           left join (
      select count(b.id) bookmarkCount, b.myListId
      from Bookmark b
             join MyList ml on ml.id = b.myListId
      where b.status = 0
      group by b.myListId
    ) x on x.myListId = ml.id
           left join (
      select count(rv.id) reviewCount, rv.userId
      from Review rv
             join User u on rv.userId = u.id
      group by u.id
    ) y on y.userId = u.id
           left join (
      select f.followId, f.userId, count(f.userId) count
      from Follow f
        join User u on f.followId = u.id
      group by u.id
    ) z on z.followId = u.id
    where ml.id = ?
    and ml.status = 0;
  `;
  const selectListRestaurantQuery = `
    select r.id restaurantId, r.name, r.roadLocation,
           ifnull(x.profileImage,'https://jimango.s3.ap-northeast-2.amazonaws.com/%ED%94%84%EC%82%AC%EA%B8%B0%EB%B3%B8.jpg') profileImage,
           x.nickname, x.content, ifnull(x.imageURL,'https://jimango.s3.ap-northeast-2.amazonaws.com/%EC%BA%A1%EC%B2%98.PNG') restaurantImage
    from Restaurant r
           left join Review rv on rv.restaurantId = r.id
           left join (
      select rv.restaurantId, u.profileImage, u.nickname, substr(rv.content,1,150) content, ri.imageURL
      from Review rv
             join User u on rv.userId = u.id
             left join ReviewImage ri on ri.reviewId = rv.id
    ) x on x.restaurantId = r.id
           join MyListRestaurant mlr on mlr.restaurantId = r.id
    where mlr.myListId = ?
    and mlr.status = 0
    group by r.id
  `;
  const [retrieveMyListRow] = await connection.query(retrieveMyListQuery+selectListRestaurantQuery, [myListId, myListId]);
  return retrieveMyListRow;
}

//리스트 조회수 올리기
async function setListViewCountInfo(connection, id) {
  const setViewCountInfoQuery = `
        UPDATE MyList
        SET viewCount = viewCount+1
        WHERE id = ?
    `;
  const [setViewCountInfoRow] = await connection.query(setViewCountInfoQuery, id);
  return setViewCountInfoRow;
}

//탑리스트 업데이트
async function updateTopListInfo(connection, id) {
  const updateTopListInfoQuery = `
    update MyList
    set isTopList = 1
    where viewCount >100
      and id = ?
    `;
  const [updateTopListInfoRow] = await connection.query(updateTopListInfoQuery, id);
  return updateTopListInfoRow;
}


//리스트 생성
async function setMyListInfo(connection, title, content, userId) {
  const setMyListInfoQuery = `
    INSERT INTO MyList(listTitle, listContent, userId)
    VALUES (?, ?, ?);
    `;
  const [setMyListInfoRow] = await connection.query(setMyListInfoQuery, [title, content, userId]);
  return setMyListInfoRow;
}

//id로 식당 검색
async function retrieveRestaurantInfo(connection, id) {
  const retrieveRestaurantQuery = `
    select r.id
    from Restaurant r
    where r.id = ?
  `;
  const [retrieveRestaurantRow] = await connection.query(retrieveRestaurantQuery, id);
  return retrieveRestaurantRow;
}

//리스트에 식당 추가
async function setListRestaurantInfo(connection, myListId, restaurantId) {
  const setMyListInfoQuery = `
    INSERT INTO MyListRestaurant(myListId, restaurantId)
    VALUES (?, ?);
    `;
  const [setMyListInfoRow] = await connection.query(setMyListInfoQuery, [myListId, restaurantId]);
  return setMyListInfoRow;
}

//마이리스트 수정
async function patchListInfo(connection, myListId, title, content) {
  const patchListQuery = `
  UPDATE MyList
  SET listTitle = ?, listContent = ? 
  WHERE id = ?;`;
  const patchListRow = await connection.query(patchListQuery, [title, content, myListId]);
  return patchListRow[0];
}

//마이리스트 삭제
async function deleteListInfo(connection, myListId) {
  const patchListQuery = `
  UPDATE MyList
  SET status = 1 
  WHERE id = ?;
  `;
  const patchListRow = await connection.query(patchListQuery, myListId);
  return patchListRow[0];
}

//이름으로 식당 검색
async function getListRestaurantInfo(connection, condition) {
  const getListRestaurantQuery = `
    select r.id restaurantId, ifnull(x.imageURL,'https://jimango.s3.ap-northeast-2.amazonaws.com/%EC%BA%A1%EC%B2%98.PNG') imageURL, a.smallRange, r.name, round(y.avg,1) avg, r.roadLocation
    from Restaurant r
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
    where r.status != 1
    `+condition+`
    group by r.id
  `;
  const getListRestaurantRow = await connection.query(getListRestaurantQuery);
  return getListRestaurantRow[0];
}

//식당 id로 리스트 내의 식당 검색
async function retrieveListRestaurantInfo(connection, myListId, restaurantId) {
  const retrieveListRestaurantQuery = `
    select *
    from MyListRestaurant mlr
    where mlr.myListId = ?
    and mlr.restaurantId = ?
  `;
  const retrieveListRestaurantRow = await connection.query(retrieveListRestaurantQuery, [myListId,restaurantId]);
  return retrieveListRestaurantRow[0];
}

async function deleteListRestaurantInfo(connection, myListId, restaurantId) {
  const deleteListRestaurantQuery = `
    delete
    from MyListRestaurant mlr
    where mlr.myListId = ?
    and mlr.restaurantId = ?
  `;
  const deleteListRestaurantRow = await connection.query(deleteListRestaurantQuery, [myListId,restaurantId]);
  return deleteListRestaurantRow[0];
}

module.exports = {
  selectListInfo,
  retrieveMyListInfoResult,
  setListViewCountInfo,
  setMyListInfo,
  retrieveRestaurantInfo,
  setListRestaurantInfo,
  patchListInfo,
  deleteListInfo,
  getListRestaurantInfo,
  retrieveListRestaurantInfo,
  deleteListRestaurantInfo,
  updateTopListInfo
};
