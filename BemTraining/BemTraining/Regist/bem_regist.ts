/// <reference path="../Scripts/typings/jquery/jquery.d.ts"/>

module bemreg {


    export class RecordData {
        constructor() { }
    }

    class RecordViewPageCounter {

        private total: number = 0;

        constructor(public columnPerPage: number) { }

        countup(): boolean {
            var newPage =
                (this.total < this.columnPerPage)
                ? false
                : (this.total % this.columnPerPage == 0);
            this.total++;
            return newPage;
        }
    }

    export class RecordView {

        private $view: JQuery;
        private recordWidth: number;
        private $template: JQuery;
        private pageCounter: RecordViewPageCounter;

        constructor($root: JQuery) {
            var $templateRoot = $(".regist-record-list-template", $root);
            var cols = parseInt($templateRoot.attr("data-col"), 10);
            this.$view = $(".regist-record-list-view", $root);
            this.recordWidth = this.$view.width() / cols;
            this.$template = $(".record", $templateRoot)
                .clone()
                .width(this.recordWidth)
                .removeAttr("data-col");
            this.pageCounter = new RecordViewPageCounter(cols);
        }

        private getOnePageWidth(){
            return this.recordWidth * this.pageCounter.columnPerPage
        }

        add(rec: RecordData): void{
            if (this.pageCounter.countup()) {
                //改ページ
                this.$view.width(this.$view.width() + this.getOnePageWidth());
            }
            this.$view.append(this.$template.clone());
        }
    }
}


$(() => {
    var v = new bemreg.RecordView($("#record-viewer"));
    $("#btn-add-record").click(() => {
        v.add(new bemreg.RecordData());
    });
});