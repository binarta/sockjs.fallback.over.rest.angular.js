(function () {
    angular.module('sockjs.fallback', ['i18n.over.rest'])
        .service('sockJsFallbackClient', ['iorMessageReader', Client]);

    function Client(reader) {
        var self = this;

        this.connect = function (eventHandler) {
            this.eventHandler = eventHandler;
            eventHandler.opened();
        };

        this.disconnect = function() {
            var handler = this.eventHandler;
            this.eventHandler = undefined;
            handler.closed();
        };

        this.send = function (json) {
            var args = JSON.parse(json);
            reader({
                namespace: args.payload.namespace,
                locale: args.payload.locale,
                code: args.payload.key
            }, function (translation) {
                self.eventHandler.onMessage(JSON.stringify({
                    topic: 'A',
                    payload: {
                        subject: 'ok',
                        payload: {
                            msg: translation
                        }
                    }
                }));
            }, function(reason) {
                self.eventHandler.onMessage(JSON.stringify({
                    topic: 'A',
                    payload: {
                        subject: 'error',
                        payload: {
                            msg: reason
                        }
                    }
                }));
            });
        }
    }
})();