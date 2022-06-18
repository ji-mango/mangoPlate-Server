const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const userDao = require("./userDao");

// Provider: Read 비즈니스 로직 처리

exports.retrieveUserList = async function (email) {
  if (!email) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUser(connection);
    connection.release();

    return userListResult;

  } else {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUserEmail(connection, email);
    connection.release();

    return userListResult;
  }
};

exports.retrieveUser = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userResult = await userDao.selectUserId(connection, userId);

  connection.release();

  return userResult[0];
};

exports.emailCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const emailCheckResult = await userDao.selectUserEmail(connection, email);
  connection.release();

  return emailCheckResult;
};

exports.passwordCheck = async function (selectUserPasswordParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const passwordCheckResult = await userDao.selectUserPassword(
      connection,
      selectUserPasswordParams
  );
  connection.release();
  return passwordCheckResult[0];
};

exports.accountCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccountResult = await userDao.selectUserAccount(connection, email);
  connection.release();

  return userAccountResult;
};

exports.userList = async function () {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserInfoResult = await userDao.selectUserInfo(connection);
  connection.release();

  return selectUserInfoResult;
}

//특정유저 정보조회
exports.retrieveUserInformation = async function (userId, condition) {
  const connection = await pool.getConnection(async (conn) => conn);
  const idCheckResult = await userDao.selectUserId(connection, userId);
  if(idCheckResult.length<1) {
    return errResponse(baseResponse.USER_USERID_NOT_EXIST)
  }

  const retrieveUserInfoResult = await userDao.retrieveUserInfo(connection, userId, condition);
  connection.release();

  return response(baseResponse.SUCCESS,retrieveUserInfoResult);
}

exports.followerList = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);

  //유효한 userId인지 확인
  const idCheckResult = await userDao.selectUserId(connection, userId);
  if(idCheckResult.length<1) {
    return errResponse(baseResponse.USER_USERID_NOT_EXIST)
  }

  const selectFollowerInfoResult = await userDao.selectFollowerInfo(connection, userId);
  connection.release();

  return response(baseResponse.SUCCESS,selectFollowerInfoResult);
}

exports.followingList = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);

  //유효한 userId인지 확인
  const idCheckResult = await userDao.selectUserId(connection, userId);
  if(idCheckResult.length<1) {
    return errResponse(baseResponse.USER_USERID_NOT_EXIST)
  }

  const selectFollowingInfoResult = await userDao.selectFollowingInfo(connection, userId);
  connection.release();

  return response(baseResponse.SUCCESS,selectFollowingInfoResult);
}

exports.socialCheck = async function(id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const retrieveSocialResult = await userDao.selectUserId(connection, id);
  connection.release();
  return retrieveSocialResult;
}

exports.statusCheck = async function(id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const retrieveStatusResult = await userDao.selectUserId(connection, id);
  connection.release();
  return retrieveStatusResult
}

//다른사람 가고싶다 리스트
exports.userHopeList = async function(userId, area, order, food, price, park) {
  let choiceArea = '';
  let choiceOrder = '';
  let choiceFood = 'and ';
  let choicePrice = 'and ';
  let choicePark = 'and ';
  if (area != '전체지역') {
    choiceArea += "and a.smallRange = '" + area + "'";
  }

  switch (order) {
    case '1' :
      choiceOrder += 'order by r.updatedAt DESC';
      break;
    case '2' :
      choiceOrder += 'order by avg DESC';
      break;
    case '3' :
      choiceOrder += 'order by reviewCount DESC';
      break;
    case '4' :
      choiceOrder += 'order by distance';
      break;
    default :
      choiceOrder += 'order by r.updatedAt DESC';
      break;
  }
  switch (food[0]) {
    case '1' :
      choiceFood += '(r.foodType = 0';
      break;
    case '2' :
      choiceFood += '(r.foodType = 1';
      break;
    case '3' :
      choiceFood += '(r.foodType = 2';
      break;
    case '4' :
      choiceFood += '(r.foodType = 3';
      break;
    case '5' :
      choiceFood += '(r.foodType = 4';
      break;
    case '6' :
      choiceFood += '(r.foodType = 5';
      break;
    case '7' :
      choiceFood += '(r.foodType = 6';
      break;
    case '8' :
      choiceFood += '(r.foodTYPe = 7';
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


  switch(park) {
    case '2' : choicePark += 'r.parking != 0'; break;
    default : choicePark = ''; break;
  }

  const connection = await pool.getConnection(async (conn) => conn);

  //유효한 userId인지 확인
  const idCheckResult = await userDao.selectUserId(connection, userId);
  if(idCheckResult.length<1) {
    return errResponse(baseResponse.USER_USERID_NOT_EXIST)
  }
  console.log(choiceArea, choiceOrder)
  const geUserHopeInfoResult = await userDao.geUserHopeInfo(connection, userId, choiceArea, choiceOrder, choiceFood, choicePrice, choicePark);
  connection.release();
  return response(baseResponse.SUCCESS,geUserHopeInfoResult)
}

//내 가고싶다 리스트
exports.myHopeList = async function(userIdFromJWT, area, order, food, price, park) {
  let choiceArea = '';
  let choiceOrder = '';
  let choiceFood = 'and ';
  let choicePrice = 'and ';
  let choicePark = 'and ';
  if (area != '전체지역') {
    choiceArea += "and a.smallRange = '" + area + "'";
  }

  switch (order) {
    case '1' :
      choiceOrder += 'order by r.updatedAt DESC';
      break;
    case '2' :
      choiceOrder += 'order by avg DESC';
      break;
    case '3' :
      choiceOrder += 'order by reviewCount DESC';
      break;
    case '4' :
      choiceOrder += 'order by distance';
      break;
    default :
      choiceOrder += 'order by r.updatedAt DESC';
      break;
  }
  switch (food[0]) {
    case '1' :
      choiceFood += '(r.foodType = 0';
      break;
    case '2' :
      choiceFood += '(r.foodType = 1';
      break;
    case '3' :
      choiceFood += '(r.foodType = 2';
      break;
    case '4' :
      choiceFood += '(r.foodType = 3';
      break;
    case '5' :
      choiceFood += '(r.foodType = 4';
      break;
    case '6' :
      choiceFood += '(r.foodType = 5';
      break;
    case '7' :
      choiceFood += '(r.foodType = 6';
      break;
    case '8' :
      choiceFood += '(r.foodTYPe = 7';
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


  switch(park) {
    case '2' : choicePark += 'r.parking != 0'; break;
    default : choicePark = ''; break;
  }

  const connection = await pool.getConnection(async (conn) => conn);

  const getMyHopeInfoResult = await userDao.getMyHopeInfo(connection, userIdFromJWT, choiceArea, choiceOrder, choiceFood, choicePrice, choicePark);
  connection.release();
  return response(baseResponse.SUCCESS,getMyHopeInfoResult)
}

//특정유저 마이리스트 조회
exports.myList = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const idCheckResult = await userDao.selectUserId(connection, userId);
  if(idCheckResult.length<1) {
    return errResponse(baseResponse.USER_USERID_NOT_EXIST)
  }

  const myListInfoResult = await userDao.myListInfo(connection, userId);
  connection.release();

  return response(baseResponse.SUCCESS,myListInfoResult);
}

//특정 리뷰 조회
exports.myReviewList = async function (area, good, soso, bad, userId) {
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

  conditionUser += `and u.id = ${userId}`

  const myReviewInfoResult = await userDao.myReviewInfo(connection, condition, conditionUser);
  connection.release();
  return response(baseResponse.SUCCESS,myReviewInfoResult);
};


//북마크 개수 조회
// exports.getBookmarkList = async function(userId) {
//   const connection = await pool.getConnection(async (conn) => conn);
//   //유효한 userId인지 확인
//   const idCheckResult = await userDao.selectUserId(connection, userId);
//   if(idCheckResult.length<1) {
//     return errResponse(baseResponse.USER_USERID_NOT_EXIST)
//   }
//
//   const getBookmarkInfoResult = await userDao.getBookmarkInfo(connection, userId);
//   connection.release();
//   return response(baseResponse.SUCCESS,getBookmarkInfoResult);
// }

//팔로우 상태 체크
exports.followCheck = async function(followUserId, myUserId) {
  const connection = await pool.getConnection(async (conn) => conn);

  const followCheckInfoResult = await userDao.followCheckInfo(connection, followUserId, myUserId);
  connection.release();
  return (followCheckInfoResult);
}

//위치
exports.getLocation = async function() {
  const connection = await pool.getConnection(async (conn) => conn);

  const getLocationInfoResult = await userDao.getLocationInfo(connection);
  connection.release();
  return (getLocationInfoResult);
}
