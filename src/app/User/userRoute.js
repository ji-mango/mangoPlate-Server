module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const passport = require('../../../node_modules/passport');
    const KaKaoStrategy = require('../../../node_modules/passport-kakao').Strategy;

    // 1. 유저 생성 (회원가입) API
    app.post('/users', user.postUsers);

    // 2. 랜덤 유저 조회 API
    app.get('/users',user.getUsers);

    //3. 특정 유저 조회 API
    app.get('/users/:userId',jwtMiddleware, user.getUser);

    // 4. 로그인 하기 API (JWT 생성)
    app.post('/users/login', user.login);

    // 회원 정보 수정 API (JWT 검증 및 Validation - 메소드 체이닝 방식으로 jwtMiddleware 사용)
    //app.patch('/app/users/:userId', jwtMiddleware, user.patchUsers)

    // 5. 카카오 회원가입/로그인
    app.post('/users/kakao-login',user.kakaoLogin)
//     app.get('/kakao', passport.authenticate('kakao'));
//     app.get('/auth/kakao/callback', passport.authenticate('kakao', {
//         successRedirect: '/',
//         failureRedirect: '/',
//     }), (req, res) => {
//         res.redirect('/');
//     });

//     passport.use('kakao', new KaKaoStrategy( {
//         clientID : '',
//         callbackURL : '',
//     }, async (accessToken, refreshToken, profile, done) => {
//         console.log(accessToken);
//         console.log(profile);
//     }))

    //6. 회원정보 수정(이름) API
    app.patch('/users/:userId/nickname',jwtMiddleware,user.patchName);

    //7. 회원정보 수정(이메일) API
    app.patch('/users/:userId/email',jwtMiddleware,user.patchEmail);

    //8. 문자 인증번호 요청 API
    app.patch('/users/:userId/phone-number',jwtMiddleware,user.verifyPhoneNumber);

    //9. 인증+회원정보 수정 API
    app.patch('/users/:userId/phone-number/verify', jwtMiddleware, user.verify)

    //10. 회원탈퇴 API
    app.patch('/users/:userId/withdrawal', jwtMiddleware, user.patchWithdrawal);

    //11. 특정유저 가고싶다 리스트 조회 API
    app.get('/users/:userId/hope',jwtMiddleware, user.getHopeList);

    //12. 특정 유저 마이리스트 조회 API
    app.get('/users/:userId/my-lists', user.getMyLists);

    //13. 특정유저 리뷰조회 API
    app.get('/users/:userId/review',jwtMiddleware, user.getMyReviews);

    //14. 팔로우 버튼 API
    app.post('/users/:userId/follow', jwtMiddleware, user.postFollow);

    //15. 팔로워 목록 조회 API
    app.get('/users/:userId/follower', user.getFollower);

    //16. 프로필 사진 설정 API
    app.patch('/users/:userId/profileImage', jwtMiddleware,user.setProfileImage);

    //17. 위치정보 허용 API
    app.post('/users/location',user.postLocation);

    //18. 팔로잉 목록 조회 API
    app.get('/users/:userId/following', user.getFollowing);

    //48. 이메일 인증 API
    app.post('/users/email/verify', user.email);

    //49. 이메일인증 회원가입 API
    app.post('/users/email/user', user.postEmailUser);

    //특정유저 북마크 개수 조회 API
    //app.get('/users/:userId/bookmark',user.getBookmark);
};


// TODO: 자동로그인 API (JWT 검증 및 Payload 내뱉기)
// JWT 검증 API
// app.get('/app/auto-login', jwtMiddleware, user.check);

// TODO: 탈퇴하기 API
