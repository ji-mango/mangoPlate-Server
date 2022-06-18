module.exports = function(app){
    const list = require('./listController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //19. 특정 마이리스트 조회 API
    app.get('/my-lists/:myListId', list.getMyList);

    //20. 마이 리스트 생성 API
    app.post('/my-lists',jwtMiddleware,list.postMyList);

    //21. 마이리스트에 식당 추가 API
    app.post('/my-lists/:myListId/restaurant',jwtMiddleware,list.postListRestaurant)

    //22. 마이리스트 수정 API
    app.patch('/my-lists/:myListId', jwtMiddleware, list.patchMyList);

    //23. 마이리스트 삭제 API
    app.delete('/my-lists/:myListId',jwtMiddleware, list.deleteMyList);

    //24. 마이리스트 식당 추가할 때 검색 API
    app.get('/my-lists/restaurants/search', list.searchListRestaurant);

    //25. 마이리스트 식당 삭제 API
    app.delete('/my-lists/:myListId/restaurant', jwtMiddleware, list.deleteListRestaurant);
};