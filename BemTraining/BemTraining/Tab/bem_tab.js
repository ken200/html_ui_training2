/// <reference path="../Scripts/typings/jquery/jquery.d.ts"/>
var bemtab;
(function (bemtab) {
    /**
    * タブボタングループ
    */
    var TabButtonGroup = (function () {
        function TabButtonGroup($tab, groupNo) {
            this.$tab = $tab;
            this.groupNo = groupNo;
            this.bloadCastEventName = "tabgroup.change";
            this._enabled = false;
        }
        /**
        * 有効状態
        */
        TabButtonGroup.prototype.enabled = function (e) {
            if (e != undefined)
                this._enabled = e;
            return this._enabled;
        };

        /**
        * 購読
        */
        TabButtonGroup.prototype.subscribe = function (handler) {
            this.$tab.on(this.bloadCastEventName, handler);
        };

        /**
        * ブロードキャスト
        */
        TabButtonGroup.prototype.bloadCast = function (newId) {
            if (!this.enabled()) {
                return;
            }
            this.$tab.trigger(this.bloadCastEventName, newId);
        };
        return TabButtonGroup;
    })();
    bemtab.TabButtonGroup = TabButtonGroup;

    /**
    * タブへの各種操作
    */
    var TabView = (function () {
        function TabView(tabNo, group) {
            var pageName = "tab-item-page";
            var bodyName = "tab-body";

            var getJqObj = function (className, tabNo, group) {
                /*
                * データ属性を使った要素取得について
                *
                * 本当はtabNoに並び位置を渡し、:eq()で要素取得したかったが、
                * タブ選択状態変化に伴うページのIn/Outの絡みで、単純には対応できなかった。
                * 代替案として、data-*属性(IE8でも使用可能)にタブNoを持たせるようにする対応を行った。
                * 現状、htmlとJavaScriptの両方にタブNoを指定する必要があるのが気持ち悪いので改善はしたい。
                *
                */
                var _getPage = function () {
                    //jQueryでの属性による要素抽出は [AttrName='Value'] となるので注意すること。
                    return $("." + pageName + "[data-tabno='" + tabNo.toString() + "']", group.$tab);
                };
                return className === pageName ? _getPage() : $("." + className, _getPage()).first();
            };

            var getBodyObj = function () {
                return $("." + bodyName + "[data-groupno='" + group.groupNo.toString() + "']", group.$tab).first();
            };

            this._$title = getJqObj(pageName + "__title", tabNo, group);
            this._$content = getJqObj(pageName + "__content", tabNo, group);
            this._$page = getJqObj(pageName, tabNo, group);
            this._$body = getBodyObj();
            this._activeTitle = pageName + "__title_active";
            this._activeContent = pageName + "__content_active";
        }
        /**
        * タブページタイトルクリック時処理の登録
        */
        TabView.prototype.onTitleClick = function (handler) {
            this._$title.click(handler);
        };

        /**
        * タブページを選択状態にする
        */
        TabView.prototype.selectTab = function () {
            this._$title.addClass(this._activeTitle);
            this._$content.appendTo(this._$body);
            this._$content.addClass(this._activeContent);
        };

        /**
        * タブページの選択状態を解除する
        */
        TabView.prototype.unselectTab = function (lastActive) {
            this._$title.removeClass(this._activeTitle);
            if (lastActive) {
                this._$content.removeClass(this._activeContent);
                this._$content.appendTo(this._$page);
            }
        };

        /**
        * タブ内容の初期化
        */
        TabView.prototype.initContent = function (initializeAction) {
            initializeAction(this._$content);
        };
        return TabView;
    })();

    /**
    * タブボタンの初期化
    */
    function initTabButton(tabNo, id, group, changed, initActiveState) {
        if (typeof initActiveState === "undefined") { initActiveState = false; }
        var tabv = new TabView(tabNo, group);
        var active = initActiveState;

        var activeProc = function () {
            group.bloadCast(id); //必ず初めに呼び出す
            tabv.selectTab();
            active = true;
            if (changed != undefined) {
                tabv.initContent(changed);
            }
        };

        group.subscribe(function (e, newid) {
            if (newid != id) {
                tabv.unselectTab(active);
                active = false;
            }
            e.stopPropagation(); //イベントは同階層だけとする。
        });

        tabv.onTitleClick(function () {
            activeProc();
        });

        if (active) {
            activeProc(); //この時点ではgroupのenabledがfalseのため、ブロードキャスト配信されない。
        }
    }
    bemtab.initTabButton = initTabButton;
})(bemtab || (bemtab = {}));
//# sourceMappingURL=bem_tab.js.map
