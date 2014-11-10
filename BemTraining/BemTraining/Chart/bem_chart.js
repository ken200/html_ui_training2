/// <reference path="../Scripts/typings/jquery/jquery.d.ts" />
var bemchart;
(function (bemchart) {
    (function (model) {
        var Schedule = (function () {
            function Schedule(id, name, dateRanges) {
                this.taskId = id;
                this.taskName = name;
                this.dateRanges = dateRanges;
            }
            Schedule.prototype.inRange = function (date) {
                var d = new Date(date.year, date.month, date.day);
                for (var i = 0; i < this.dateRanges.length; i++) {
                    var range = this.dateRanges[i];
                    var from = new Date(range.from.year, range.from.month, range.from.day);
                    var to = new Date(range.to.year, range.to.month, range.to.day);
                    if (from.getTime() > d.getTime() || d.getTime() > to.getTime())
                        return false;
                }
                return true;
            };
            return Schedule;
        })();
        model.Schedule = Schedule;
    })(bemchart.model || (bemchart.model = {}));
    var model = bemchart.model;
})(bemchart || (bemchart = {}));

var bemchart;
(function (bemchart) {
    

    var classNames = {
        CHART_REPORT: "chart-report",
        DAILY_REPORT: "chart-report__daily-report",
        DAILY_REPORT_SELECTED: "chart-report__daily-report--selected",
        DAILY_REPORT_HOLIDAY: "chart-report__daily-report--holiday"
    };

    /**
    * 報告セル
    */
    var ChartDayCell = (function () {
        function ChartDayCell($root, bindDate, schedule) {
            var _this = this;
            this.$root = $root;
            this.bindDate = bindDate;
            this.schedule = schedule;

            this.$root.click(function (e) {
                var $this = _this.$root;
                e.shiftKey ? _this.selectRange($this) : _this.select($this);
            });

            if (bemchart.calendar.isHoliday(bindDate)) {
                $root.addClass(classNames.DAILY_REPORT_HOLIDAY);
            }

            if (schedule.inRange(bindDate))
                this.select($root);
        }
        ChartDayCell.prototype.selectRange = function ($endCell) {
            //過去にさかのぼり、最初に見つかった選択セル～ $end間を選択状態にする。
            var grpStatus = $endCell.hasClass(classNames.DAILY_REPORT_SELECTED);

            var findTarget = function ($cell, $targets) {
                if (!$cell.hasClass(classNames.DAILY_REPORT))
                    return;
                if ($cell.hasClass(classNames.DAILY_REPORT_SELECTED) != grpStatus && !$cell.hasClass(classNames.DAILY_REPORT_HOLIDAY))
                    return;
                if (!$cell.hasClass(classNames.DAILY_REPORT_HOLIDAY))
                    $targets.push($cell);

                findTarget($cell.prev(), $targets);
            };

            var $targets = new Array();
            findTarget($endCell, $targets);

            for (var i = $targets.length - 1; i >= 0; i--) {
                this.select($targets[i]);
            }
        };

        ChartDayCell.prototype.select = function ($cell) {
            if (!$cell.hasClass(classNames.DAILY_REPORT_HOLIDAY))
                $cell.toggleClass(classNames.DAILY_REPORT_SELECTED);
        };
        return ChartDayCell;
    })();

    var Chart = (function () {
        function Chart($root) {
            this.$root = $root;
            this.scheduleLoader = new ScheduleLoader($root, $("." + classNames.CHART_REPORT, $root));
        }
        /**
        * 外部パラメーター値({year,month}～{year,month})から内部データ形式を作成する
        */
        Chart.prototype.createMonthDayLength = function (from, to) {
            var rangeMonth = (to.year * 12 + to.month) - (from.year * 12 + from.month) + 1;
            if (rangeMonth < 0)
                throw new Error("指定範囲の整合性エラー。");

            var viewRange = new Array();
            var ym = new Date(from.year, from.month, 0);
            var dayLength = ym.getDate();

            for (var i = 0; i < rangeMonth; i++) {
                var mdl = {
                    year: ym.getFullYear(),
                    month: ym.getMonth() + 1,
                    length: dayLength
                };
                viewRange.push(mdl);

                if (mdl.month == 12) {
                    ym = new Date(mdl.year + 1, 1, 0);
                } else {
                    ym = new Date(mdl.year, mdl.month + 1, 0);
                }
                dayLength = ym.getDate();
            }

            return viewRange;
        };

        /**
        * 初期化
        */
        Chart.prototype.initialize = function (from, to) {
            this.changeRange(from, to);
            this.initTableSize();
        };

        /**
        * 表示範囲の変更
        */
        Chart.prototype.changeRange = function (from, to) {
            this.viewRange = this.createMonthDayLength(from, to);
            this.initMonthTitle(function (y, m) {
                return y + "年" + m + "月";
            });
            this.initDayTitle();
        };

        /**
        * ヘッダ(年月部)の初期化
        */
        Chart.prototype.initMonthTitle = function (getHeaderTitle) {
            var $monthHeader = $(".chart-header__month", this.$root);
            var $monthTitleTemplate = $(".chart-header__month-title", $monthHeader);

            for (var i = 0; i < this.viewRange.length; i++) {
                var $monthTitle = $monthTitleTemplate.clone();
                var mInfo = this.viewRange[i];
                $monthTitle.text(getHeaderTitle(mInfo.year, mInfo.month));
                $monthTitle.attr("colspan", mInfo.length);
                $monthHeader.append($monthTitle);
            }
            $monthTitleTemplate.remove();
        };

        /**
        * ヘッダ(日付部)の初期化
        */
        Chart.prototype.initDayTitle = function () {
            var $dayHeader = $(".chart-header__day", this.$root);

            for (var i = 0; i < this.viewRange.length; i++) {
                var mInfo = this.viewRange[i];
                for (var j = 1; j <= mInfo.length; j++) {
                    var $dt = $("<td>" + (j <= 9 ? "0" : "") + j.toString() + "</td>");
                    if (bemchart.calendar.isHoliday({ year: mInfo.year, month: mInfo.month, day: j })) {
                        $dt.addClass("chart-header__day--holiday");
                    }
                    $dayHeader.append($dt);
                }
            }
        };

        /**
        * チャートテーブルサイズの初期化
        */
        Chart.prototype.initTableSize = function (titleWidth, dayWidth) {
            if (typeof titleWidth === "undefined") { titleWidth = 200; }
            if (typeof dayWidth === "undefined") { dayWidth = 20; }
            var dayTotal = 0;
            for (var i = 0; i < this.viewRange.length; i++) {
                dayTotal += this.viewRange[i].length;
            }
            var $chart = this.$root;
            $chart.width((titleWidth + 2) + dayTotal * (dayWidth + 2));
        };

        /**
        * スケジュールのロード
        */
        Chart.prototype.loadSchedule = function (schedule) {
            this.scheduleLoader.load(this.viewRange, schedule);
        };
        return Chart;
    })();
    bemchart.Chart = Chart;

    /**
    * スケジュール行テンプレート
    */
    var ScheduleRowTemplate = (function () {
        function ScheduleRowTemplate($target) {
            this.$target = $target;
            this.$target.css("display", "none");
        }
        ScheduleRowTemplate.prototype.clone = function () {
            var $src = this.$target.clone().css("display", "");
            return {
                $root: $src,
                $title: $(".chart-report__title", $src),
                $report: $(".chart-report__daily-report", $src)
            };
        };
        return ScheduleRowTemplate;
    })();

    /**
    * スケジュールローダー
    */
    var ScheduleLoader = (function () {
        function ScheduleLoader($root, $report) {
            this.$root = $root;
            this.template = new ScheduleRowTemplate($report);
        }
        ScheduleLoader.prototype.load = function (viewRange, schedule) {
            var newRow = this.template.clone();
            newRow.$title.text(schedule.taskId + ":" + schedule.taskName);
            for (var i = 0; i < viewRange.length; i++) {
                var mInfo = viewRange[i];
                for (var j = 1; j <= mInfo.length; j++) {
                    var $dt = newRow.$report.clone().text(" ");
                    new ChartDayCell($dt, { year: mInfo.year, month: mInfo.month, day: j }, schedule);
                    newRow.$root.append($dt);
                }
            }
            newRow.$root.children().eq(1).remove(); //先頭の進捗セルを削除する。
            this.$root.append(newRow.$root);
        };
        return ScheduleLoader;
    })();
})(bemchart || (bemchart = {}));

$(function () {
    var chart = new bemchart.Chart($("#chart1"));
    chart.initialize({ year: 2014, month: 11 }, { year: 2015, month: 3 });

    chart.loadSchedule(new bemchart.model.Schedule("00001", "予定タスクその1", [{
            from: { year: 2014, month: 11, day: 1 },
            to: { year: 2014, month: 11, day: 10 }
        }]));

    chart.loadSchedule(new bemchart.model.Schedule("00002", "予定タスクその2", [{
            from: { year: 2014, month: 11, day: 16 },
            to: { year: 2014, month: 11, day: 20 }
        }]));

    chart.loadSchedule(new bemchart.model.Schedule("00003", "予定タスクその3", [{
            from: { year: 2014, month: 11, day: 25 },
            to: { year: 2014, month: 12, day: 19 }
        }]));
});
//# sourceMappingURL=bem_chart.js.map
