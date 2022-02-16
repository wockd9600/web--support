// DOM
const counselChart = document.getElementById('amcharts_counsel');
const programChart = document.getElementById('amcharts_program');
const mainReview = document.getElementsByClassName('main-review')[0];


if (mainReview) {
    $.ajax({
        url: `/admin/main/review`,
        data: { },
        type: "get",
        success: function (result) {
            if (result.length != 0) {
                mainReview.innerHTML = '';
                
                if(result.length > 0) {
                    mainReview.innerHTML += `<div class="card-review-detail">
                        <h1 class="text-ellipsis">${result[0].title}</h1>
                        ${result[0].writer}
                        <h2>${result[0].content}</h2>
                    </div>`
                } else {
                    mainReview.innerHTML += `<div class="card-review-detail">
                        <h1 class="text-ellipsis">글이 없습니다.</h1>
                        <h2></h2>
                    </div>`;
                }

                if (result.length > 1) {
                    mainReview.innerHTML += `<div class="card-review-detail">
                        <h1 class="text-ellipsis">${result[1].title}</h1>
                        ${result[1].writer}
                        <h2>${result[1].content}</h2>
                    </div>`
                } else {
                    mainReview.innerHTML += `<div class="card-review-detail">
                        <h1 class="text-ellipsis">글이 없습니다.</h1>
                        <h2></h2>
                    </div>`;
                }
            } else {}
        }
    });
}





if (counselChart) {
    am4core.ready(function () {
    
        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end
    
        var chart = am4core.create('amcharts_counsel', am4charts.XYChart)
        chart.colors.step = 2;
    
        chart.legend = new am4charts.Legend()
        chart.legend.position = 'top'
        chart.legend.paddingBottom = 20
        chart.legend.labels.template.maxWidth = 95
    
        var xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
        xAxis.dataFields.category = 'category'
        xAxis.renderer.cellStartLocation = 0.1
        xAxis.renderer.cellEndLocation = 0.9
        xAxis.renderer.grid.template.location = 0;
    
        var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.min = 0;
    
        function createSeries(value, name) {
            var series = chart.series.push(new am4charts.ColumnSeries())
            series.dataFields.valueY = value
            series.dataFields.categoryX = 'category'
            series.name = name
    
            series.events.on('hidden', arrangeColumns);
            series.events.on('shown', arrangeColumns);
    
            var bullet = series.bullets.push(new am4charts.LabelBullet())
            bullet.interactionsEnabled = false
            bullet.dy = 30;
            bullet.label.text = '{valueY}'
            bullet.label.fill = am4core.color('#ffffff')
    
            return series;
        }
    
        $.ajax({
            url: `/admin/main/counsel`,
            data: { },
            type: "get",
            success: function (result) {
                const first_app = typeof(result[0]) !== 'undefined' ?  result[0].app : 0;
                const second_app = typeof(result[1]) !== 'undefined' ?  result[1].app : 0;
                const third_app = typeof(result[2]) !== 'undefined' ?  result[2].app : 0;
                const forth_app = typeof(result[3]) !== 'undefined' ?  result[3].app : 0;

                chart.data = [
                    {
                        category: `이번주`,
                        second: first_app,
                    },
                    {
                        category: `저번주`,
                        second: second_app,
                    },
                    {
                        category: `2주전`,
                        second: third_app,
                    },
                    {
                        category: `3주전`,
                        second: forth_app,
                    },
                ]
            }
        });
    
    
        createSeries('second', '신청 인원');
    
        function arrangeColumns() {
    
            var series = chart.series.getIndex(0);
    
            var w = 1 - xAxis.renderer.cellStartLocation - (1 - xAxis.renderer.cellEndLocation);
            if (series.dataItems.length > 1) {
                var x0 = xAxis.getX(series.dataItems.getIndex(0), 'categoryX');
                var x1 = xAxis.getX(series.dataItems.getIndex(1), 'categoryX');
                var delta = ((x1 - x0) / chart.series.length) * w;
                if (am4core.isNumber(delta)) {
                    var middle = chart.series.length / 2;
    
                    var newIndex = 0;
                    chart.series.each(function (series) {
                        if (!series.isHidden && !series.isHiding) {
                            series.dummyData = newIndex;
                            newIndex++;
                        }
                        else {
                            series.dummyData = chart.series.indexOf(series);
                        }
                    })
                    var visibleCount = newIndex;
                    var newMiddle = visibleCount / 2;
    
                    chart.series.each(function (series) {
                        var trueIndex = chart.series.indexOf(series);
                        var newIndex = series.dummyData;
    
                        var dx = (newIndex - trueIndex + middle - newMiddle) * delta
    
                        series.animate({ property: 'dx', to: dx }, series.interpolationDuration, series.interpolationEasing);
                        series.bulletsContainer.animate({ property: 'dx', to: dx }, series.interpolationDuration, series.interpolationEasing);
                    })
                }
            }
        }
    }); // end am4core.ready()
}

if (programChart) {
    am4core.ready(function () {
    
        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end
    
        var chart = am4core.create('amcharts_program', am4charts.XYChart)
        chart.colors.step = 2;
    
        chart.legend = new am4charts.Legend()
        chart.legend.position = 'top'
        chart.legend.paddingBottom = 20
        chart.legend.labels.template.maxWidth = 95
    
        var xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
        xAxis.dataFields.category = 'category'
        xAxis.renderer.cellStartLocation = 0.1
        xAxis.renderer.cellEndLocation = 0.9
        xAxis.renderer.grid.template.location = 0;
    
        var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.min = 0;
    
        function createSeries(value, name) {
            var series = chart.series.push(new am4charts.ColumnSeries())
            series.dataFields.valueY = value
            series.dataFields.categoryX = 'category'
            series.name = name
    
            series.events.on('hidden', arrangeColumns);
            series.events.on('shown', arrangeColumns);
    
            var bullet = series.bullets.push(new am4charts.LabelBullet())
            bullet.interactionsEnabled = false
            bullet.dy = 30;
            bullet.label.text = '{valueY}'
            bullet.label.fill = am4core.color('#ffffff')
    
            return series;
        }
    
        $.ajax({
            url: `/admin/main/program`,
            data: { },
            type: "get",
            success: function (result) {

                const first_program = typeof(result[0]) !== 'undefined' ?  result[0].name  : '예정된 프로그램 없음';
                const second_program = typeof(result[1]) !== 'undefined' ? result[1].name : '예정된 프로그램 없음';
                const third_program = typeof(result[2]) !== 'undefined' ?  result[2].name : '예정된 프로그램 없음';
                const forth_program = typeof(result[3]) !== 'undefined' ?  result[3].name : '예정된 프로그램 없음';

                const first_app = typeof(result[0]) !== 'undefined' ?  result[0].app : 0;
                const second_app = typeof(result[1]) !== 'undefined' ?  result[1].app : 0;
                const third_app = typeof(result[2]) !== 'undefined' ?  result[2].app : 0;
                const forth_app = typeof(result[3]) !== 'undefined' ?  result[3].app : 0;

                chart.data = [
                    {
                        category: `${first_program}`,
                        second: first_app,
                    },
                    {
                        category: `${second_program}`,
                        second: second_app,
                    },
                    {
                        category: `${third_program}`,
                        second: third_app,
                    },
                    {
                        category: `${forth_program}`,
                        second: forth_app,
                    },
                ]
            }
        });
    
    
        createSeries('second', '신청 인원');
    
        function arrangeColumns() {
    
            var series = chart.series.getIndex(0);
    
            var w = 1 - xAxis.renderer.cellStartLocation - (1 - xAxis.renderer.cellEndLocation);
            if (series.dataItems.length > 1) {
                var x0 = xAxis.getX(series.dataItems.getIndex(0), 'categoryX');
                var x1 = xAxis.getX(series.dataItems.getIndex(1), 'categoryX');
                var delta = ((x1 - x0) / chart.series.length) * w;
                if (am4core.isNumber(delta)) {
                    var middle = chart.series.length / 2;
    
                    var newIndex = 0;
                    chart.series.each(function (series) {
                        if (!series.isHidden && !series.isHiding) {
                            series.dummyData = newIndex;
                            newIndex++;
                        }
                        else {
                            series.dummyData = chart.series.indexOf(series);
                        }
                    })
                    var visibleCount = newIndex;
                    var newMiddle = visibleCount / 2;
    
                    chart.series.each(function (series) {
                        var trueIndex = chart.series.indexOf(series);
                        var newIndex = series.dummyData;
    
                        var dx = (newIndex - trueIndex + middle - newMiddle) * delta
    
                        series.animate({ property: 'dx', to: dx }, series.interpolationDuration, series.interpolationEasing);
                        series.bulletsContainer.animate({ property: 'dx', to: dx }, series.interpolationDuration, series.interpolationEasing);
                    })
                }
            }
        }
    }); // end am4core.ready()
}