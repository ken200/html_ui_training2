/// <reference path="../Scripts/typings/jquery/jquery.d.ts" />

/**
 * カレンダー
 */
module bemchart.calendar {

    interface MonthHoliday {
        year: number;
        month: number;
        day: Array<number>;
    }

    var holiday: Array<MonthHoliday> = [
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

    export function isHoliday(year : number, month : number, day: number) : boolean{
        for (var i = 0; i < holiday.length; i++) {
            if (holiday[i].year != year)
                continue;
            if (holiday[i].month != month)
                continue;
            for (var j = 0; j < holiday[i].day.length; j++) {
                if (holiday[i].day[j] == day)
                    return true;
            }
        }
        return false;
    };
}

/**
 * 設定
 */
module bemchart.settings {

    export interface MonthDayLength {
        year: number;
        month: number;
        /**
         * 月の日数
         */
        length: number;
    }

    export interface TableStyle {
        /**
         * タイトル列幅(px)
         */
        titleWidth: number;
        /**
         * 日付列幅(px)
         */
        dayWidth: number;
    }

    /**
     * テーブル設定
     */
    export var tableSize: TableStyle = {
        titleWidth: 200,
        dayWidth: 20
    };
}

module bemchart.model {

    export interface Range {
        from: { year: number; month: number; day: number };
        length: number;
    }

    export class Schedule {
        taskId: string;
        taskName: string;
        dates: Array<Range>;

        constructor(id: string, name: string, dates : Array<Range>) {
            this.taskId = id;
            this.taskName = name;
            this.dates = dates;
        }
    }
}

module bemchart {

    var classNames = {

        CHART_REPORT: "chart-report",
        DAILY_REPORT: "chart-report__daily-report",
        DAILY_REPORT_SELECTED: "chart-report__daily-report--selected",
        DAILY_REPORT_HOLIDAY: "chart-report__daily-report--holiday"

    };

    /**
     * 報告セル
     */
    class ChartDayCell {

        constructor(public $root: JQuery) {

            $root.click((e) => {
                var $this = this.$root;
                e.shiftKey ? this.selectRange($this) : this.select($this);
            });
        }

        private selectRange($endCell: JQuery) {
            //過去にさかのぼり、最初に見つかった選択セル～ $end間を選択状態にする。

            var grpStatus = $endCell.hasClass(classNames.DAILY_REPORT_SELECTED);

            var findTarget = ($cell: JQuery,$targets: Array<JQuery>) => {

                if (!$cell.hasClass(classNames.DAILY_REPORT))
                    return;
                if ($cell.hasClass(classNames.DAILY_REPORT_SELECTED) != grpStatus
                    && !$cell.hasClass(classNames.DAILY_REPORT_HOLIDAY))
                    return;
                if (!$cell.hasClass(classNames.DAILY_REPORT_HOLIDAY))
                    $targets.push($cell);

                findTarget($cell.prev(), $targets);
            };

            var $targets: Array<JQuery> = new Array<JQuery>();
            findTarget($endCell, $targets);

            for (var i = $targets.length - 1; i >= 0; i--) {
                this.select($targets[i]);
            }
        }

        private select($cell: JQuery) {
            if (!$cell.hasClass(classNames.DAILY_REPORT_HOLIDAY))
                $cell.toggleClass(classNames.DAILY_REPORT_SELECTED);
        }

    }

    export class Chart {

        private viewRange: Array<bemchart.settings.MonthDayLength>;
        private scheduleLoader: ScheduleLoader;

        constructor(public $root: JQuery) {
            this.scheduleLoader = new ScheduleLoader($root, $("." + classNames.CHART_REPORT, $root));
        }

        /**
         * 初期化
         */
        initialize(viewRange: Array<bemchart.settings.MonthDayLength>) {
            this.changeRange(viewRange);
        }

        /**
         * 表示範囲の変更
         */
        changeRange(viewRange: Array<bemchart.settings.MonthDayLength>) {
            this.viewRange = viewRange;
            this.initMonthTitle((y, m) => { return y + "年" + m + "月"; });
            this.initDayTitle();
            this.initTableSize(bemchart.settings.tableSize);
        }

        /**
         * ヘッダ(年月部)の初期化
         */
        private initMonthTitle(getHeaderTitle : (y: number, m: number) => string) {

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
        }

        /**
         * ヘッダ(日付部)の初期化
         */
        private initDayTitle() {
            var $dayHeader = $(".chart-header__day", this.$root);

            for (var i = 0; i < this.viewRange.length; i++) {
                var mInfo = this.viewRange[i];
                for (var j = 1; j <= mInfo.length; j++) {
                    var $dt = $("<td>" + (j <= 9 ? "0" : "") + j.toString() + "</td>");
                    if (bemchart.calendar.isHoliday(mInfo.year, mInfo.month, j)) {
                        $dt.addClass("chart-header__day--holiday");
                    }
                    $dayHeader.append($dt);
                }
            }
        }

        /**
         * チャートテーブルサイズの初期化
         */
        private initTableSize(tableSettings: bemchart.settings.TableStyle) {
            var dayTotal = 0;
            for (var i = 0; i < this.viewRange.length; i++) {
                dayTotal += this.viewRange[i].length;
            }
            var $chart = this.$root;
            $chart.width((tableSettings.titleWidth + 2) + dayTotal * (tableSettings.dayWidth + 2));
        }
        
        /**
         * スケジュールのロード
         */
        loadSchedule(schedule: bemchart.model.Schedule) {
            this.scheduleLoader.load(this.viewRange, schedule);
        }
    }

    /**
     * スケジュール行テンプレート
     */
    class ScheduleRowTemplate {
        private $target: JQuery;

        constructor($target: JQuery) {
            this.$target = $target;
            this.$target.css("display", "none");
        }

        clone() {
            var $src = this.$target.clone().css("display", "");
            return {
                $root: $src,
                $title: $(".chart-report__title", $src),
                $report: $(".chart-report__daily-report", $src)
            };
        }
    }

    /**
     * スケジュールローダー
     */
    class ScheduleLoader {

        private $root: JQuery;
        private template: ScheduleRowTemplate;

        constructor($root: JQuery, $report : JQuery) {
            this.$root = $root;
            this.template = new ScheduleRowTemplate($report);
        }

        load(viewRange: Array<bemchart.settings.MonthDayLength>, schedule: bemchart.model.Schedule) {
            var newRow = this.template.clone();
            newRow.$title.text(schedule.taskId + ":" + schedule.taskName);
            for (var i = 0; i < viewRange.length; i++) {
                var mInfo = viewRange[i];
                for (var j = 1; j <= mInfo.length; j++) {
                    var $dt = newRow.$report.clone();
                    $dt.text(" ");
                    new ChartDayCell($dt);
                    if (bemchart.calendar.isHoliday(mInfo.year, mInfo.month, j)) {
                        $dt.addClass(classNames.DAILY_REPORT_HOLIDAY);
                    }
                    newRow.$root.append($dt);
                }
            }
            newRow.$root.children().eq(1).remove();  //先頭の進捗セルを削除する。
            this.$root.append(newRow.$root);
        }
    }
}


$(() => {
    var chart = new bemchart.Chart($("#chart1"));
    chart.initialize([
        { year: 2014, month: 10, length: 31 },
        { year: 2014, month: 11, length: 30 },
        { year: 2014, month: 12, length: 31 },
        { year: 2015, month: 1, length: 31 },
        { year: 2015, month: 2, length: 28 },
        { year: 2015, month: 3, length: 31 },
        { year: 2015, month: 4, length: 30 }
    ]);

    for (var i = 1; i <= 20; i++) {
        chart.loadSchedule(new bemchart.model.Schedule(i.toString(), "予定タスクその" + i.toString(), null));
    }

});
