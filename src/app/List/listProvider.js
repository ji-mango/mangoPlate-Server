const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");
const listDao = require("./listDao");

// Provider: Read 비즈니스 로직 처리


// exports.retrieveUser = async function (userId) {
//   const connection = await pool.getConnection(async (conn) => conn);
//   const userResult = await listDao.selectUserId(connection, userId);
//
//   connection.release();
//
//   return userResult[0];
// };

// exports.userList = async function () {
//   const connection = await pool.getConnection(async (conn) => conn);
//   const selectUserInfoResult = await listDao.selectUserInfo(connection);
//   connection.release();
//
//   return selectUserInfoResult;
// }

//특정유저 정보조회
// exports.retrieveUserInformation = async function (userId, condition) {
//   const connection = await pool.getConnection(async (conn) => conn);
//   const idCheckResult = await userDao.selectUserId(connection, userId);
//   if(idCheckResult.length<1) {
//     return errResponse(baseResponse.USER_USERID_NOT_EXIST)
//   }
//
//   const retrieveUserInfoResult = await userDao.retrieveUserInfo(connection, userId, condition);
//   connection.release();
//
//   return response(baseResponse.SUCCESS,retrieveUserInfoResult);
// }

//특정마이리스트 조회
exports.retrieveMyList = async function (myListid) {
  const connection = await pool.getConnection(async (conn) => conn);

  //유효한 리스트 id인지 체크
  const listIdCheckResult = await listDao.selectListInfo(connection, myListid);
  if(listIdCheckResult.length<1) {
    return errResponse(baseResponse.LIST_NOT_EXIST)
  }

  const retrieveMyListInfoResult = await listDao.retrieveMyListInfoResult(connection, myListid);
  connection.release();

  return response(baseResponse.SUCCESS,retrieveMyListInfoResult);
}


// exports.statusCheck = async function(id) {
//   const connection = await pool.getConnection(async (conn) => conn);
//   const retrieveStatusResult = await userDao.selectUserId(connection, id);
//   connection.release();
//   return retrieveStatusResult
// }

//유효한 식당 id인지 체크
exports.restaurantIdCheck = async function(id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const retrieveRestaurantResult = await listDao.retrieveRestaurantInfo(connection, id);
  connection.release();
  return retrieveRestaurantResult
}

//리스트 상태 체크
exports.listCheck = async function(id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const retrieveListResult = await listDao.selectListInfo(connection, id);
  connection.release();
  return retrieveListResult
}

//식당 이름 검색
exports.getListRestaurant = async function(search) {
  const condition = `and r.name LIKE '%`+search+`%'`;
  const connection = await pool.getConnection(async (conn) => conn);
  const getListRestaurantInfoResult = await listDao.getListRestaurantInfo(connection, condition);
  connection.release();
  return getListRestaurantInfoResult
}

//리스트 아이디에있는 식당인지 체크
exports.listRestaurantCheck = async function(myListId, restaurantId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const retrieveListRestaurantResult = await listDao.retrieveListRestaurantInfo(connection, myListId, restaurantId);
  connection.release();
  return retrieveListRestaurantResult
}