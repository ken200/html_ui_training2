/// <reference path="../Scripts/typings/jquery/jquery.d.ts" />

module bemlogin {

    export class Login {

        private $this: JQuery;
        private $userid: JQuery;
        private $password: JQuery;
        private $button: JQuery;
        private alert: LoginAlert;

        constructor($this: JQuery, alert: LoginAlert = null) {
            this.$this = $this;
            this.$userid = $(".login__userid", $this).first();
            this.$password = $(".login__password", $this).first();
            this.$button =  $(".login__button", $this).first();
            this.alert = alert;
            this.initEvent();
        }

        private initEvent() {
            this.$button.click((e) => {
                var id = this.$userid.val()
                var pass = this.$password.val();
                var eventName = this.alert.visible(id != pass) ? "login.ng" : "login.ok";
                this.$this.trigger(eventName);
            });
        }

        on(eventName: string, callback: (e: JQueryEventObject, args: any[]) => any) {
            this.$this.on(eventName, callback);
        }

        off(eventName: string) {
            this.$this.off(eventName);
        }
    }

    export class LoginAlert {

        private $this: JQuery;

        constructor($this: JQuery) {
            this.$this = $this;
            this.visible(false);
        }

        visible(v?: boolean): boolean {
            var disableClass = "login-alert_disable";
            if (v != undefined) {
                var upd = v ? this.$this.removeClass : this.$this.addClass;
                upd.call(this.$this, disableClass);
                return v;
            }
            return !this.$this.hasClass(disableClass);
        }
    }
}