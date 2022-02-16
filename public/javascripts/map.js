var mapOptions = {
    center: new naver.maps.LatLng(37.30661, 127.07454),
    zoom: 18
};

var map = new naver.maps.Map('map', mapOptions);

var marker = new naver.maps.Marker({
    position: new naver.maps.LatLng(37.30661, 127.07454),
    map: map
});

var contentString = [
        '<div class="iw_inner" style="padding:10px">',
        '   <h3>경기도 심리지원센터</h3>',
        '   <p>경기도 용인시 수지구 수지로 37, 나동(수지농협) 3층',
        '   </p>',
        '</div>'
    ].join('');

var infowindow = new naver.maps.InfoWindow({
    content: contentString
});

naver.maps.Event.addListener(marker, "click", function(e) {
    if (infowindow.getMap()) {
        infowindow.close();
    } else {
        infowindow.open(map, marker);
    }
});

infowindow.open(map, marker);