module.exports = function(app){
    const restaurant = require('./restaurantController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //34. 내가 등록한 식당 목록 조회 API
    app.get('/my-restaurants',jwtMiddleware, restaurant.getMyRestaurants);

    //35. 가게 등록하기 API
    app.post('/restaurants',jwtMiddleware, restaurant.postRestaurant);

    //36. 지역별 가게조회 API 비회원용
    app.get('/restaurants', restaurant.getR);
    
    //36-1. 지역별 가게조회 API 회원용
    app.get('/jwt/restaurants', jwtMiddleware, restaurant.getRestaurants);

    //37. 특정 가게조회 API
    app.get('/restaurants/:restaurantId', restaurant.getRestaurant);

    //38 특정 가게 평점별 리뷰개수, 리뷰미리보기 API
    app.get('/restaurants/:restaurantId/reviewCount', restaurant.getRestaurantReviewCount);

    //39. 특정 가게 전체 사진 보기 API
    app.get('/restaurants/:restaurantId/image',restaurant.getRestaurantImage);

    //40. 가게 상세정보 조회 API
    app.get('/restaurants/:restaurantId/information',restaurant.getRestaurantInformation);

    //41. 가게 메뉴 조회 API
    app.get('/restaurants/:restaurantId/menu',restaurant.getRestaurantMenu);

    //42. 가게 리뷰 조회 API
    app.get('/restaurants/:restaurantId/review', restaurant.getReview);

    //43. 가고싶다 버튼 API
    app.post('/restaurants/:restaurantId/hope', jwtMiddleware, restaurant.postHope);

    //50. 식당 삭제 API
    app.patch('/restaurants/:restaurantId', jwtMiddleware, restaurant.patchRestaurant);
};