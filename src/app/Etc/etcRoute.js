module.exports = function(app){
    const etc = require('./etcController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //44. EAT딜 목록 조회 API
    app.get('/eat-deals', etc.getEatDeals);

    //45. 특정 EAT딜 조회 API
    app.get('/eat-deals/:eatDealId', etc.getEatDeal);

    //46. 이벤트 조회 API
    app.get('/events', etc.getEvents);

    //47. 지역목록 조회 API
    app.get('/areas',etc.getAreas);
};