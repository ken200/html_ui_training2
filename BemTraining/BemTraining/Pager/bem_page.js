/// <reference path="../Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../Scripts/typings/underscore/underscore.d.ts" />
var bempage;
(function (bempage) {
    /**
    * ページデータ
    */
    var PageData = (function () {
        function PageData(data) {
            this.data = data;
        }
        return PageData;
    })();
    bempage.PageData = PageData;

    /**
    * ページボタン
    */
    var PageButton = (function () {
        function PageButton(no, $this, changePage, draw) {
            this.no = no;
            this.$this = $this;
            $("a", this.$this).click(function (e) {
                draw(no);
                changePage(no);
            });
        }
        PageButton.prototype.show = function () {
            this.$this.removeClass("pager-jump__page--hide");
            this.$this.removeClass("pager-jump__page--current");
        };

        PageButton.prototype.hide = function () {
            this.$this.addClass("pager-jump__page--hide");
            this.$this.removeClass("pager-jump__page--current");
        };

        PageButton.prototype.active = function () {
            this.$this.addClass("pager-jump__page--current");
        };
        return PageButton;
    })();

    /**
    * ページビューポート
    *
    */
    var PageViewport = (function () {
        function PageViewport($this, amountPerPage) {
            if (typeof amountPerPage === "undefined") { amountPerPage = 10; }
            this.$this = $this;
            this.pages = new Array();
            this.amountPerPage = amountPerPage;
            this.currentNo = 1;
        }
        /**
        * 現在ページNoの取得
        */
        PageViewport.prototype.getCurrentNo = function () {
            return this.currentNo;
        };

        /**
        * ページの追加
        */
        PageViewport.prototype.addPage = function (page) {
            this.pages.push(page);
        };

        /**
        * ページ数の取得
        */
        PageViewport.prototype.getPageCount = function () {
            return this.pages.length;
        };

        /**
        * 現在ページ位置の更新
        */
        PageViewport.prototype.updateCurrentPageNo = function (no) {
            this.currentNo = no;
            this.update(no);
        };

        PageViewport.prototype.update = function (currentPageNo) {
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
            } else if (currentPageNo + defaultViewPosition >= pageTotal) {
                min = pageTotal - viewTotal + 1;
                max = pageTotal;
            } else {
                min = currentPageNo - defaultViewPosition;
                max = currentPageNo + ((viewTotal - 1) - defaultViewPosition);
            }

            var isRange = function (no) {
                return min <= no && no <= max;
            };

            _.map(this.pages, function (p) {
                if (isRange(p.no)) {
                    p.show();
                } else {
                    p.hide();
                }
                if (p.no == currentPageNo) {
                    p.active();
                }
            });
        };
        return PageViewport;
    })();

    /**
    * ページング処理の初期化
    */
    function initializePaging($root, data) {
        var $pageContent = $(".page-content", $root).first();
        var $viewport = $(".pager-jump", $root).first();

        /**
        * ページボタンの生成
        * テンプレートをコピーしてボタンエレメントを作成する。
        */
        function createButton(pageNo, $vp) {
            var templateName = "pager-jump__page--template";
            var $template = $("." + templateName, $vp);
            var $button = $template.clone();
            $button.removeClass(templateName);
            var $a = $("a", $button);
            $a.html(pageNo.toString());
            $vp.append($button);
            return $button;
        }
        ;

        /**
        * ページコンテンツの描画
        */
        function drawContent(d) {
            $pageContent.html(d.data);
        }

        var viewport = new PageViewport($viewport);
        for (var i = 1; i <= data.length; i++) {
            viewport.addPage(new PageButton(i, createButton(i, $viewport), function (no) {
                //ページボタンクリック時処理
                viewport.updateCurrentPageNo(no);
            }, function (no) {
                //ボタンクリック時処理
                drawContent(data[no - 1]);
            }));
        }

        /**
        * ページ移動ボタンの初期化
        */
        function initializeGotoButton(className, getNewNo) {
            $("." + className, $root).first().click(function (e) {
                var newNo = getNewNo();
                viewport.updateCurrentPageNo(newNo);
                drawContent(data[newNo - 1]);
            });
        }

        initializeGotoButton("page-prev__goto-start-page", function () {
            return 1;
        });
        initializeGotoButton("page-prev__goto-prev-page", function () {
            return Math.max(viewport.getCurrentNo() - 1, 1);
        });
        initializeGotoButton("pager-next__goto-next-page", function () {
            return Math.min(viewport.getCurrentNo() + 1, viewport.getPageCount());
        });
        initializeGotoButton("pager-next__goto-last-page", function () {
            return viewport.getPageCount();
        });

        //先頭ページの表示
        viewport.updateCurrentPageNo(1);
        drawContent(data[0]);
    }
    bempage.initializePaging = initializePaging;
})(bempage || (bempage = {}));

$(function () {
    bempage.initializePaging($("#container1"), _.map(_.range(1, 36), function (i) {
        return new bempage.PageData("ページ" + i.toString() + "のコンテンツです");
    }));

    bempage.initializePaging($("#container2"), _.map(_.range(1, 13), function (i) {
        return new bempage.PageData(i.toString());
    }));
});
//# sourceMappingURL=bem_page.js.map
