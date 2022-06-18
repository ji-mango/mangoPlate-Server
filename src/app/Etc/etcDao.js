//이벤트 조회
async function eventInfo(connection) {
    const selectEventQuery = `
        select e.id, e.imageURL, e.title,
        case
            when datediff(e.endPeriod,now()) >= 0
                then concat(datediff(e.endPeriod,now()), '일 남음')
            when datediff(e.endPeriod,now()) < 0
                then concat('종료 ',date_format(e.startPeriod, '%Y-%m-%d'), ' ~ ', date_format(e.endPeriod, '%Y-%m-%d')) end as date
        from Event e
        order by e.startPeriod DESC
    `;
    const [selectEventRow] = await connection.query(selectEventQuery);
    return selectEventRow;
}

//잇딜 목록 조회
async function getEatDealInfo(connection, area) {
    const getEatDealInfoQuery = `
        select ed.id, edi.imageURL, 
               concat(format(ed.originalPrice,0),'원') originalPrice,
               concat(format(ed.reducedPrice,0),'원' ) reducedPrice,
               concat('[',a.smallRange,'] ',r.name) restaurant,
               ed.menu,
               ed.isTakeout,
               concat(round(((ed.originalPrice- ed.reducedPrice)/ed.originalPrice) * 100,0),'%') as discount
        from EatDeal ed
                 left join EatDealImage edi on edi.eatDealId = ed.id
                 join Restaurant r on r.id = ed.restaurantId
                 join Area a on a.id = r.areaId
        where a.smallRange = ?
        group by ed.id
    `;
    const [getEatDealInfoRow] = await connection.query(getEatDealInfoQuery, area);
    return getEatDealInfoRow;
}

//특정 잇딜 조회
async function retreiveEatDealInfo(connection, id) {
    const retreiveEatDealQuery = `
        select group_concat(edi.imageURL) image,
               concat(ed.menu,' ',round(((ed.originalPrice- ed.reducedPrice)/ed.originalPrice) * 100,0),'% 할인') comment,
               concat('[',a.smallRange,'] ',r.name) restaurant,
               ed.menu,
               concat('사용기간 ',timestampdiff(day, ed.startPeriod, ed.endPeriod+1),'일 ',date_format(ed.startPeriod, '%Y-%m-%d'),'~',date_format(ed.endPeriod, '%Y-%m-%d')) period,
               concat(format(ed.originalPrice,0),'원') originalPrice,
               concat(format(ed.reducedPrice,0),'원' ) reducedPrice,
               concat(round(((ed.originalPrice- ed.reducedPrice)/ed.originalPrice) * 100,0),'%') discount, r.id restaurantId, r.roadLocation, ed.content
        from EatDeal ed
                 join EatDealImage edi on edi.eatDealId = ed.id
                 join Restaurant r on r.id = ed.restaurantId
                 join Area a on a.id = r.areaId
        where ed.id = ?
        and ed.status = 0;
    `;
    const [retreiveEatDealRow] = await connection.query(retreiveEatDealQuery, id);
    return retreiveEatDealRow;
}

//큰범위지역으로 지역 검색
async function getAreasInfo(connection, largeArea) {
    const getAreasInfoQuery = `
        select a.id areaId, a.smallRange
        from Area a
        where a.largeRange = ?
    `;
    const [getAreasInfoRow] = await connection.query(getAreasInfoQuery, largeArea);
    return getAreasInfoRow;
}

module.exports = {
    eventInfo,
    getEatDealInfo,
    retreiveEatDealInfo,
    getAreasInfo
};
