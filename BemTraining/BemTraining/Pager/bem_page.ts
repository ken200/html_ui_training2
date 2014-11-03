/// <reference path="../Scripts/typings/jquery/jquery.d.ts" />
module bempage {

    export class PageData {
        constructor() { }
    }

    export class Pager{

        private data: Array<PageData>;

        constructor() {
        }

        load(data: Array<PageData>) {
            this.data = data;
        }
    }

}