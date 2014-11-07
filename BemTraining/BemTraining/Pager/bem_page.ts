/// <reference path="../Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../Scripts/typings/underscore/underscore.d.ts" />
module bempage {

    /**
     * ページデータ
     */
    export class PageData {
        constructor(public data : string) { }
    }

    /**
     * ページボタン
     */
    class PageButton  {

        private $this: JQuery;

        constructor(public no: number,
            $this: JQuery,
            changePage: (no: number) => void,
            draw: (no: number) => void) {

            this.$this = $this;
            $("a", this.$this).click((e) => {
                draw(no);
                changePage(no);
            });
        }

        show() {
            this.$this.removeClass("pager-jump__page--hide");
            this.$this.removeClass("pager-jump__page--current");
        }

        hide() {
            this.$this.addClass("pager-jump__page--hide");
            this.$this.removeClass("pager-jump__page--current");
        }

        active() {
            this.$this.addClass("pager-jump__page--current");
        }
    }

    /**
     * ページビューポート
     * 
     */
    class PageViewport {
        private pages: Array<PageButton>;
        private amountPerPage: number;
        private currentNo: number;

        constructor(public $this: JQuery, amountPerPage: number = 10) {
            this.pages = new Array<PageButton>();
            this.amountPerPage = amountPerPage;
            this.currentNo = 1;
        }

        /**
         * 現在ページNoの取得
         */
        getCurrentNo(): number {
            return this.currentNo;
        }

        /**
         * ページの追加
         */
        addPage(page: PageButton) {
            this.pages.push(page);
        }

        /**
         * ページ数の取得
         */
        getPageCount() :number {
            return this.pages.length;
        }

        /**
         * 現在ページ位置の更新
         */
        updateCurrentPageNo(no: number) {
            this.currentNo = no;
            this.update(no);
        }

        private update(currentPageNo: number) {

            // http://www.dango-itimi.com/blog/archives/2011/001067.html 
            // のロジックを流用。お世話になりました！

            var pageTotal = this.pages.length;
            var viewTotal = (this.amountPerPage > pageTotal) ? pageTotal : this.amountPerPage;
            var minPage = 1;
            var defaultViewPosition = Math.ceil(viewTotal / 2) - 1;
            var min;
            var max;

            if (currentPageNo - defaultViewPosition < minPage) {
                min = minPage;
                max = viewTotal;
            }
            else if (currentPageNo + defaultViewPosition >= pageTotal) {

                min = pageTotal - viewTotal + 1;
                max = pageTotal;
            }
            else {
                min = currentPageNo - defaultViewPosition;
                max = currentPageNo + ((viewTotal - 1) - defaultViewPosition);
            }

            var isRange = (no: number) => {
                return min <= no && no <= max;
            }

            _.map(this.pages, (p) => { 
                if(isRange(p.no)){
                    p.show();
                } else {
                    p.hide();
                }
                if (p.no == currentPageNo) {
                    p.active();
                }
            });
        }
    }

    /**
     * ページング処理の初期化
     */
    export function initializePaging($root : JQuery, data: Array<PageData>) {

        var $pageContent = $(".page-content", $root).first();
        var $viewport = $(".pager-jump", $root).first();

        /**
         * ページボタンの生成
         * テンプレートをコピーしてボタンエレメントを作成する。
         */
        function createButton(pageNo: number, $vp: JQuery){
            var templateName = "pager-jump__page--template";
            var $template = $("." + templateName, $vp);
            var $button = $template.clone();
            $button.removeClass(templateName);
            var $a = $("a", $button);
            $a.html(pageNo.toString());
            $vp.append($button);
            return $button;
        };

        /**
         * ページコンテンツの描画
         */
        function drawContent(d: PageData){
            $pageContent.html(d.data);
        }

        var viewport = new PageViewport($viewport);
        for (var i = 1; i <= data.length; i++) {
            viewport.addPage(new PageButton(
                i,
                createButton(i, $viewport),
                (no) => {
                    //ページボタンクリック時処理
                    viewport.updateCurrentPageNo(no);
                },
                (no) => {
                    //ボタンクリック時処理
                    drawContent(data[no-1]);
                }));
        }

        /**
         * ページ移動ボタンの初期化
         */
        function initializeGotoButton(className: string,  getNewNo : () => number){
            $("." + className, $root).first().click((e) => {
                var newNo = getNewNo();
                viewport.updateCurrentPageNo(newNo);
                drawContent(data[newNo-1]);
            });
        }

        initializeGotoButton("page-prev__goto-start-page", () => {
            return 1;
        });
        initializeGotoButton("page-prev__goto-prev-page", () => {
            return Math.max(viewport.getCurrentNo() - 1, 1);
        });
        initializeGotoButton("pager-next__goto-next-page", () => {
            return Math.min(viewport.getCurrentNo() + 1, viewport.getPageCount());
        });
        initializeGotoButton("pager-next__goto-last-page", () => {
            return viewport.getPageCount();
        });

        //先頭ページの表示
        viewport.updateCurrentPageNo(1);
        drawContent(data[0]);
    }
}


$(() => {
    bempage.initializePaging(
        $("#container1"),
        _.map(_.range(1, 36), (i) => { return new bempage.PageData("ページ" + i.toString() + "のコンテンツです"); }));


    bempage.initializePaging(
        $("#container2"),
        _.map(_.range(1, 13), (i) => { return new bempage.PageData(i.toString()); }));

});
