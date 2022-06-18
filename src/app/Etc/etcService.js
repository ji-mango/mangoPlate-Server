const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const etcProvider = require("./etcProvider");
const etcDao = require("./etcDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

//특정가게 조회수 올리기
exports.setViewCount = async function(id) {
    const connection = await pool.getConnection(async (conn) => conn);

    const setViewCountInfoResult = await restaurantDao.setViewCountInfo(connection, id);

    connection.release();
    return setViewCountInfoResult;
}