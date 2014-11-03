/// <reference path="../Scripts/typings/jquery/jquery.d.ts" />
var bempage;
(function (bempage) {
    var PageData = (function () {
        function PageData() {
        }
        return PageData;
    })();
    bempage.PageData = PageData;

    var Pager = (function () {
        function Pager() {
        }
        Pager.prototype.load = function (data) {
            this.data = data;
        };
        return Pager;
    })();
    bempage.Pager = Pager;
})(bempage || (bempage = {}));
//# sourceMappingURL=bem_page.js.map
