var bemchart;
(function (bemchart) {
    /**
    * カレンダー
    */
    (function (calendar) {
        

        var holiday = [
            {
                year: 2014, month: 10, day: [24, 29, 30]
            },
            {
                year: 2014, month: 11, day: [1, 2, 3, 8, 9, 15, 16, 22, 23, 24, 29, 30]
            },
            {
                year: 2014, month: 12, day: [6, 7, 13, 14, 20, 21, 23, 27, 28, 29, 30, 31]
            },
            {
                year: 2015, month: 1, day: [1, 2, 3, 4, 10, 11, 12, 17, 18, 24, 25, 31]
            },
            {
                year: 2015, month: 2, day: [1, 7, 8, 11, 14, 15, 21, 22, 28]
            },
            {
                year: 2015, month: 3, day: []
            },
            {
                year: 2015, month: 4, day: []
            }
        ];

        function isHoliday(date) {
            for (var i = 0; i < holiday.length; i++) {
                if (holiday[i].year != date.year)
                    continue;
                if (holiday[i].month != date.month)
                    continue;
                for (var j = 0; j < holiday[i].day.length; j++) {
                    if (holiday[i].day[j] == date.day)
                        return true;
                }
            }
            return false;
        }
        calendar.isHoliday = isHoliday;
        ;
    })(bemchart.calendar || (bemchart.calendar = {}));
    var calendar = bemchart.calendar;
})(bemchart || (bemchart = {}));
//# sourceMappingURL=bem_chart_util.js.map
