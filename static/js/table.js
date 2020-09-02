$(document).ready(function () {
    $("#stockTable").html("");
    showStocks();
})

function loadStockInfo(symbol) {

    // yahoo finance api 호출 때 쓰는 api

    // var settings = {
    //     "async": true,
    //     "crossDomain": true,
    //     "url": "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?region=US&symbol=" + symbol,
    //     "method": "GET",
    //     "headers": {
    //         "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
    //         "x-rapidapi-key": "037f6ad97dmshf9c85cd2a219335p1099b8jsna02252858f9f"
    //     }
    // }

    // $.ajax(settings).done(function (response) {
    //     console.log(response);
    //     let row = $(`tr[data-ticker="${symbol}"]`)
    //     row.find('.name').html(response.quoteType.shortName)
    //     row.find('.now_price').html(response.price.regularMarketPrice.fmt)
    //     // if (response.summaryProfile) {
    //     row.find('.sector').html(response.summaryProfile.sector)
    //     row.find('.desc').html(response.summaryProfile.industry)
    //     // }
    // calculate(symbol);
    // })


    // ALPHA VANTAGE finance api 호출 때 쓰는 api

    // var settings = {
    //     "async": true,
    //     "crossDomain": true,
    //     "url": "https://alpha-vantage.p.rapidapi.com/query?symbol=" + symbol + "&function=GLOBAL_QUOTE",
    //     "method": "GET",
    //     "headers": {
    //         "x-rapidapi-host": "alpha-vantage.p.rapidapi.com",
    //         "x-rapidapi-key": "037f6ad97dmshf9c85cd2a219335p1099b8jsna02252858f9f"
    //     }
    // }
    // $.ajax(settings).done(function (response) {
    //     let row = $(`tr[data-ticker="${symbol}"]`)
    //     row.find('.now_price').html(response['Global Quote']['05. price'])
    // })
    // }
    calculate(symbol);
}

function showStocks() {
    $.ajax({
        type: "GET",
        url: "/api/readStocks",
        data: {},
        success: function (response) {
            if (response["result"] == "success") {
                let stocks = response['stocks'];
                for (let i = 0; i < stocks.length; i++) {
                    stocks[i]['ticker'] = stocks[i]['ticker'].toUpperCase();
                    makeStockRow(
                        stocks[i]['ticker'],
                        stocks[i]['name'],
                        stocks[i]['sector'],
                        stocks[i]['earning_rate'],
                        stocks[i]['profit'],
                        stocks[i]['evaluation'],
                        stocks[i]['investment'],
                        stocks[i]['avg_price'],
                        stocks[i]['quantity'],
                        stocks[i]['weight_rate']
                    );

                    loadStockInfo(stocks[i]['ticker'])
                }
            }

            let table = $('#allofstocks').DataTable(
                {
                    "paging": false,
                    "order": [[4, "desc"]],
                    "pagingType": "simple_numbers",
                    "pagination": true,
                    "language": {
                        "decimal": ".",
                        "thousands": ","
                    },
                    dom: 'Bfrtip',
                    buttons: [
                        {
                            text: '종목추가',
                            action: function showPopup() {
                                var _width = '400';
                                var _height = '550';

                                // 팝업을 가운데 위치시키기 위해 아래와 같이 값 구하기
                                var _left = Math.ceil((window.screen.width - _width) / 2);
                                var _top = Math.ceil((window.screen.width - _height) / 5);

                                window.open("/addTicker", "popup_add_ticker", 'width=' + _width + ', height=' + _height + ', left=' + _left + ', top=' + _top);
                            }

                        }
                    ],
                    "createdRow": function (row, data, index) {
                        if (parseInt(data[4]) * 1 > 0) {
                            $('td', row).eq(4).css({
                                'color': 'red'
                            })
                        }
                        if (parseInt(data[4]) < 0) {
                            $('td', row).eq(4).css({
                                'color': 'blue'
                            })
                        }
                        if (parseFloat(data[3]) > 0) {
                            $('td', row).eq(3).css({
                                'color': 'red'
                            })
                        }
                        if (parseFloat(data[3]) < 0) {
                            $('td', row).eq(3).css({
                                'color': 'blue'
                            })
                        }
                    },
                    "formatNumber": function (toFormat) {
                        return toFormat.toString().replace(
                            /\B(?=(\d{3})+(?!\d))/g, "'"
                        );
                    }
                }
            )
            let tot_profit_usd = table.column(4).data().sum();
            $("#sum_profit_usd").text(tot_profit_usd);

            let tot_evaluation = table.column(5).data().sum();
            $("#sum_evaluation").text(tot_evaluation);

            let tot_investment = table.column(6).data().sum();
            $("#sum_investment").text(tot_investment);

            let tot_earning_rate = ((tot_profit_usd / tot_evaluation) * 100).toFixed(2) + "%"
            $("#sum_earning_rate").text(tot_earning_rate)

            let exchange = $("#exchange").text();
            let tot_profit_krw = tot_profit_usd * exchange
            $("sum_profit_krw").text(tot_profit_krw)

            function changeColor1() {
                if (tot_profit_usd > 0) {
                    document.getElementById("sum_profit_usd").style.color = 'red';
                } else {
                    document.getElementById("sum_profit_usd").style.color = 'blue';
                }
            }

            function changeColor2() {
                if (parseFloat(tot_earning_rate) > 0) {
                    document.getElementById("sum_earning_rate").style.color = 'red';
                } else {
                    document.getElementById("sum_earning_rate").style.color = 'blue';
                }
            }

            changeColor1(), changeColor2(), showExchange()

        }
    })
}


function calculate(symbol) {

    let now_price = $(`tr[data-ticker="${symbol}"] .now_price`).text();
    let avg_price = $(`tr[data-ticker="${symbol}"] .avg_price`).text();
    let quantity = $(`tr[data-ticker="${symbol}"] .quantity`).text();

    let evaluation = (now_price * quantity).toFixed(2);
    // let sum_evaluation = $("#sum_evaluation").text();
    // console.log(sum_evaluation)
    let investment = (avg_price * quantity).toFixed(2);
    let profit = ((now_price - avg_price) * quantity).toFixed(2);
    let earning_rate = ((profit / (avg_price * quantity)) * 100).toFixed(2) + "%";
    // let weight_rate = evaluation / sum_evaluation;

    $(`tr[data-ticker="${symbol}"] .evaluation`).text(evaluation);
    $(`tr[data-ticker="${symbol}"] .profit`).text(profit);
    $(`tr[data-ticker="${symbol}"] .earning_rate`).text(earning_rate);
    $(`tr[data-ticker="${symbol}"] .investment`).text(investment);
    // $(`tr[data-ticker="${symbol}"] .weight_rate`).text(weight_rate);

}

function makeStockRow(ticker, name, sector, earning_rate, profit, evaluation, investment, avg_price, quantity, weight_rate) {
    let tempHtml = `<tr data-ticker="${ticker}">\
                              <td class="ticker">${ticker}</td>
                              <td class="name"></td>
                              <td class="sector"></td>
                              <td class="earning_rate"></td>
                              <td class="profit"></td>
                              <td class="evaluation"></td>
                              <td class="investment"></td>
                              <td class="avg_price">${avg_price}</td>
                              <td class="quantity">${quantity}</td>
                              <td class="weight_rate">${weight_rate}</td>
                              <td class="now_price">100</td>
                              <td>
                              <img src="../static/img/pencil.svg" id="edit_ticker" onclick="popup_edit_ticker('${ticker}')">
                              <img src="../static/img/trash.svg" id="delete_ticker" onclick="popup_delete_ticker('${ticker}')">
                              </td>
                            </tr>`;
    $("#stockTable").append(tempHtml);
}

function popup_edit_ticker(ticker) {

    var _width = '400';
    var _height = '400';

    var _left = Math.ceil((window.screen.width - _width) / 2);
    var _top = Math.ceil((window.screen.width - _height) / 5);

    window.open("/editTicker?ticker=" + ticker, "popup_edit_ticker", 'width=' + _width + ', height=' + _height + ', left=' + _left + ', top=' + _top);

}

function popup_delete_ticker(ticker) {
    if (confirm("정말 " + ticker + " 를 삭제하시겠습니까?") == true) {
        $.ajax({
            type: "DELETE",
            url: "/api/deleteStocks",
            data: {
                'ticker_delete': ticker
            },
            success: function (response) { // 성공하면
                if (response["result"] == "success") {
                    alert(response["msg"]);
                    window.close()
                    window.location.reload(); // 전의 창(부모의 창 reload 하는 기능)
                } else {
                    window.close()
                }
            }
        })
    }
}


google.charts.load('current', {
    'packages': ['corechart']
});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    var data = google.visualization.arrayToDataTable([
        ['Task', 'Hours per Day'],
        ['Work', 11],
        ['Eat', 2],
        ['Commute', 2],
        ['Watch TV', 2],
        ['Sleep', 7]
    ]);
    var options = {
        pieHole: 0.4,
        title: '섹터별 비중',
        titleTextStyle: {
            bold: true,
            fontSize: 20
        },
        pieSliceText: 'label',
        sliceVisibilityThreshold: .05
    };
    var chart = new google.visualization.PieChart(document.getElementById('piechart'));

    chart.draw(data, options);
}

google.charts.load('current', {
    'packages': ['corechart']
});
google.charts.setOnLoadCallback(drawChart2);

function drawChart2() {
    var data = google.visualization.arrayToDataTable([
        ['Task', 'Hours per Day'],
        ['Work', 11],
        ['Eat', 2],
        ['Commute', 2],
        ['Watch TV', 2],
        ['Sleep', 7]
    ]);
    var options = {
        title: '종목별 비중',
        legend: 'none',
        pieSliceText: 'label',
        titleTextStyle: {
            bold: true,
            fontSize: 20
        },
        sliceVisibilityThreshold: .05
    };
    var chart = new google.visualization.PieChart(document.getElementById('piechart2'));

    chart.draw(data, options);
}

google.charts.load('current', {
    'packages': ['corechart']
});
google.charts.setOnLoadCallback(drawChart3);

function drawChart3() {
    var data = google.visualization.arrayToDataTable([
        ['Task', 'Hours per Day'],
        ['Work', 11],
        ['Eat', 2],
        ['Commute', 2],
        ['Watch TV', 2],
        ['Sleep', 7]
    ]);
    var options = {
        title: 'FAMANG VS EX-FAMANG',
        legend: 'none',
        titleTextStyle: {
            bold: true,
            fontSize: 20
        }
    };
    var chart = new google.visualization.PieChart(document.getElementById('piechart3'));

    chart.draw(data, options);
}

google.charts.load('current', {'packages': ['corechart']});
google.charts.setOnLoadCallback(drawChart4);

function drawChart4() {
    var data = google.visualization.arrayToDataTable([
        ['Year', 'Sales', 'Expenses'],
        ['2004', 1000, 400],
        ['2005', 1170, 460],
        ['2006', 660, 1120],
        ['2007', 1030, 540]
    ]);

    var options = {
        title: 'Company Performance',
        titleTextStyle: {
            bold: true,
            fontSize: 20
        },
        curveType: 'function',
        legend: {position: 'bottom'}
    };

    var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

    chart.draw(data, options);
}

google.charts.load('current', {packages: ['corechart', 'line']});
google.charts.setOnLoadCallback(drawBasic);

function drawBasic() {

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number', 'Dogs');

    data.addRows([
        [0, 0], [1, 10], [2, 23], [3, 17], [4, 18], [5, 9],
        [6, 11], [7, 27], [8, 33], [9, 40], [10, 32], [11, 35],
        [12, 30], [13, 40], [14, 42], [15, 47], [16, 44], [17, 48],
        [18, 52], [19, 54], [20, 42], [21, 55], [22, 56], [23, 57],
        [24, 60], [25, 50], [26, 52], [27, 51], [28, 49], [29, 53],
        [30, 55], [31, 60], [32, 61], [33, 59], [34, 62], [35, 65],
        [36, 62], [37, 58], [38, 55], [39, 61], [40, 64], [41, 65],
        [42, 63], [43, 66], [44, 67], [45, 69], [46, 69], [47, 70],
        [48, 72], [49, 68], [50, 66], [51, 65], [52, 67], [53, 70],
        [54, 71], [55, 72], [56, 73], [57, 75], [58, 70], [59, 68],
        [60, 64], [61, 60], [62, 65], [63, 67], [64, 68], [65, 69],
        [66, 70], [67, 72], [68, 75], [69, 80]
    ]);

    var options = {
        hAxis: {
            title: 'Time'
        },
        vAxis: {
            title: 'Popularity'
        },
        title: '일별수익률',
        titleTextStyle: {
            bold: true,
            fontSize: 20
        }
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));

    chart.draw(data, options);
}

google.charts.load('current', {'packages': ['corechart']});
google.charts.setOnLoadCallback(drawVisualization);

function drawVisualization() {
    // Some raw data (not necessarily accurate)
    var data = google.visualization.arrayToDataTable([
        ['Month', 'Bolivia', 'Ecuador', 'Madagascar', 'Papua New Guinea', 'Rwanda', 'Average'],
        ['2004/05', 165, 938, 522, 998, 450, 614.6],
        ['2005/06', 135, 1120, 599, 1268, 288, 682],
        ['2006/07', 157, 1167, 587, 807, 397, 623],
        ['2007/08', 139, 1110, 615, 968, 215, 609.4],
        ['2008/09', 136, 691, 629, 1026, 366, 569.6]
    ]);

    var options = {
        title: 'Monthly Coffee Production by Country',
        titleTextStyle: {
            bold: true,
            fontSize: 20
        },
        vAxis: {title: 'Cups'},
        hAxis: {title: 'Month'},
        seriesType: 'bars',
        series: {5: {type: 'line'}}
    };

    var chart = new google.visualization.ComboChart(document.getElementById('chart_div2'));
    chart.draw(data, options);
}

function rate() {
    var test1 = $('td', "sum_profit").text();
    var test2 = $('td', "sum_investment").html();
    console.log(test1, test2)
    // let sum_earning_rate = (sum_profit / sum_investment
    // $("#sum_earning_rate").text(sum_earning_rate)
}

function showExchange() {
    $.ajax({
        type: "GET",
        url: "https://api.manana.kr/exchange/rate.json",
        data: {},
        success: function (response) {
            for (let i = 0; i < response.length; i++) {
                if (response[i]['name'] == 'USDKRW=X') {
                    $('#exchange').text(response[i]['rate']);
                    return;

                }
            }
        }
    })
}

