/// <reference path="../Scripts/typings/jquery/jquery.d.ts"/>
var bemreg;
(function (bemreg) {
    var RecordData = (function () {
        function RecordData() {
        }
        return RecordData;
    })();
    bemreg.RecordData = RecordData;

    var RecordViewPageCounter = (function () {
        function RecordViewPageCounter(columnPerPage) {
            this.columnPerPage = columnPerPage;
            this.total = 0;
        }
        RecordViewPageCounter.prototype.countup = function () {
            var newPage = (this.total < this.columnPerPage) ? false : (this.total % this.columnPerPage == 0);
            this.total++;
            return newPage;
        };
        return RecordViewPageCounter;
    })();

    var RecordView = (function () {
        function RecordView($root) {
            this.$root = $root;
        }
        RecordView.prototype.oneinit = function () {
            var $templateRoot = $(".regist-record-list-template", this.$root);
            var cols = parseInt($templateRoot.attr("data-col"), 10);
            this.$view = $(".regist-record-list-view", this.$root);
            this.recordWidth = this.$view.width() / cols;
            this.$template = $(".record", $templateRoot).clone().width(this.recordWidth).removeAttr("data-col");
            this.pageCounter = new RecordViewPageCounter(cols);
            this.oneinit = function () {
            };
        };

        RecordView.prototype.getOnePageWidth = function () {
            return this.recordWidth * this.pageCounter.columnPerPage;
        };

        RecordView.prototype.add = function (rec) {
            this.oneinit();
            if (this.pageCounter.countup()) {
                //改ページ
                this.$view.width(this.$view.width() + this.getOnePageWidth());
            }
            this.$view.append(this.$template.clone());
        };
        return RecordView;
    })();
    bemreg.RecordView = RecordView;
})(bemreg || (bemreg = {}));
//# sourceMappingURL=bem_regist.js.map
