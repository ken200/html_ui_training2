/// <reference path="../Scripts/typings/jquery/jquery.d.ts"/>

module bemtab {

    /**
     * タブボタングループ
     */
    export class TabButtonGroup {

        private bloadCastEventName: string = "tabgroup.change";
        private _enabled: boolean;

        constructor(public $tab : JQuery) {
            this._enabled = false;
        }

        /**
         * 有効状態
         */
        public enabled(e?: boolean) : boolean {
            if (e != undefined)
                this._enabled = e;
            return this._enabled;
        }

        /**
         * 購読
         */
        public subscribe(handler: (e: JQueryEventObject, newid: string) => any){
            this.$tab.on(this.bloadCastEventName, handler);
        }

        /**
         * ブロードキャスト
         */
        public bloadCast(newId: string) {
            if (!this.enabled()) {
                return;
            }
            this.$tab.trigger(this.bloadCastEventName, newId);
        }
    }

    /**
     * タブへの各種操作
     */
    class TabView {

        private _$title: JQuery;
        private _$content: JQuery;
        private _$page: JQuery;
        private _$body: JQuery;
        private _activeTitle: string;
        private _activeContent: string;

        constructor(tabNo: number, group: TabButtonGroup) {

            var pageName = "tab-item-page";

            var getJqObj = (className: string, tabNo: number, group: TabButtonGroup) => {

                /*
                 * データ属性を使った要素取得について
                 * 
                 * 本当はtabNoに並び位置を渡し、:eq()で要素取得したかったが、
                 * タブ選択状態変化に伴うページのIn/Outの絡みで、単純には対応できなかった。
                 * 代替案として、data-*属性(IE8でも使用可能)にタブNoを持たせるようにする対応を行った。
                 * 現状、htmlとJavaScriptの両方にタブNoを指定する必要があるのが気持ち悪いので改善はしたい。
                 * 
                 */

                var _getPage = () => {
                    //jQueryでの属性による要素抽出は [AttrName='Value'] となるので注意すること。
                    return $("." + pageName + "[data-tabno='" + tabNo.toString() + "']", group.$tab);
                };
                return className === pageName ? _getPage() : $("." + className, _getPage());
            }

            this._$title = getJqObj(pageName + "__title", tabNo, group);
            this._$content = getJqObj(pageName + "__content", tabNo, group);
            this._$page = getJqObj(pageName, tabNo, group);
            this._$body = $("." + "tab-body", group.$tab);
            this._activeTitle = pageName + "__title_active";
            this._activeContent =  pageName + "__content_active";
        }

        /**
         * タブページタイトルクリック時処理の登録
         */
        onTitleClick(handler: () => void) {
            this._$title.click(handler);
        }

        /**
         * タブページを選択状態にする
         */
        selectTab() {
            this._$title.addClass(this._activeTitle);
            this._$content.appendTo(this._$body);
            this._$content.addClass(this._activeContent);
        }

        /**
         * タブページの選択状態を解除する
         */
        unselectTab(lastActive: boolean) {
            this._$title.removeClass(this._activeTitle);
            if (lastActive) {
                this._$content.removeClass(this._activeContent);
                this._$content.appendTo(this._$page);
            }
        }

        /**
         * タブ内容の初期化
         */
        initContent(initializeAction: (content: JQuery) => void) {
            initializeAction(this._$content);
        }
    }

    /**
     * タブボタンの初期化
     */
    export function initTabButton(tabNo : number,id: string, group: TabButtonGroup,
        changed?: (content: JQuery) => void, initActiveState: boolean = false){

        var tabv = new TabView(tabNo, group);
        var active = initActiveState;

        var activeProc = () => {
            group.bloadCast(id); //必ず初めに呼び出す
            tabv.selectTab();
            active = true;
            if (changed != undefined) {
                tabv.initContent(changed);
            }
        };

        group.subscribe((e, newid) => {
            if (newid != id) {
                tabv.unselectTab(active);
                active = false;
            }
        });

        tabv.onTitleClick(() => {
            activeProc();
        });

        if (active) {
            activeProc();//この時点ではgroupのenabledがfalseのため、ブロードキャスト配信されない。
        }
    }
}

