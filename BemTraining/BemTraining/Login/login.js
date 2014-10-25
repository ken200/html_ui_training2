/// <reference path="../Scripts/typings/jquery/jquery.d.ts" />
var bemlogin;
(function (bemlogin) {
    var Login = (function () {
        function Login($this, alert) {
            if (typeof alert === "undefined") { alert = null; }
            this.$this = $this;
            this.$userid = $(".login__userid", $this).first();
            this.$password = $(".login__password", $this).first();
            this.$button = $(".login__button", $this).first();
            this.alert = alert;
            this.initEvent();
        }
        Login.prototype.initEvent = function () {
            var _this = this;
            this.$button.click(function (e) {
                var id = _this.$userid.val();
                var pass = _this.$password.val();
                var eventName = _this.alert.visible(id != pass) ? "login.ng" : "login.ok";
                _this.$this.trigger(eventName);
            });
        };

        Login.prototype.on = function (eventName, callback) {
            this.$this.on(eventName, callback);
        };

        Login.prototype.off = function (eventName) {
            this.$this.off(eventName);
        };
        return Login;
    })();
    bemlogin.Login = Login;

    var LoginAlert = (function () {
        function LoginAlert($this) {
            this.$this = $this;
            this.visible(false);
        }
        LoginAlert.prototype.visible = function (v) {
            var disableClass = "login-alert_disable";
            if (v != undefined) {
                var upd = v ? this.$this.removeClass : this.$this.addClass;
                upd.call(this.$this, disableClass);
                return v;
            }
            return !this.$this.hasClass(disableClass);
        };
        return LoginAlert;
    })();
    bemlogin.LoginAlert = LoginAlert;
})(bemlogin || (bemlogin = {}));
//# sourceMappingURL=login.js.map
