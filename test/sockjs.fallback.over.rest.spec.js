describe('sockjs.fallback.over.rest', function () {
    beforeEach(module('sockjs.fallback'));
    beforeEach(inject(function () {
    }));

    describe('sockJsFallbackClient', function () {
        var client, reader, eventHandler;

        beforeEach(inject(function (sockJsFallbackClient, iorMessageReader) {
            client = sockJsFallbackClient;
            reader = iorMessageReader;
            eventHandler = new function () {
                this.capturedMessages = [];

                this.opened = function () {
                    this.status = 'connected';
                };

                this.closed = function() {
                    this.status = 'disconnected';
                };

                this.onMessage = function (json) {
                    this.capturedMessages.push(JSON.parse(json));
                };

                this.closed();
            };
        }));

        describe('connect', function () {
            beforeEach(function () {
                client.connect(eventHandler);
            });

            it('immediately opens the connection', function () {
                expect(client.eventHandler).toEqual(eventHandler);
                expect(eventHandler.status).toEqual('connected');
            });

            describe('send', function () {
                beforeEach(function () {
                    client.send(JSON.stringify({
                        topic: 'T',
                        responseAddress: 'A',
                        payload: {
                            namespace: 'N',
                            locale: 'L',
                            key: 'K'
                        }
                    }));
                });

                it('delegates to iorMessageReader', inject(function () {
                    expect(reader.calls[0].args[0]).toEqual({
                        namespace: 'N',
                        locale: 'L',
                        code: 'K'
                    });
                }));

                it('generate success event', function () {
                    reader.calls[0].args[1]('translation');
                    expect(eventHandler.capturedMessages[0]).toEqual({
                        topic: 'A',
                        payload: {
                            subject: 'ok',
                            payload: {
                                msg: 'translation'
                            }
                        }
                    });
                });

                it('generate error event', function () {
                    reader.calls[0].args[2]('reason');
                    expect(eventHandler.capturedMessages[0]).toEqual({
                        topic: 'A',
                        payload: {
                            subject: 'error',
                            payload: {
                                msg: 'reason'
                            }
                        }
                    });
                });

                it('disconnect', function() {
                    client.disconnect();
                    expect(eventHandler.status).toEqual('disconnected');
                    expect(client.eventHandler).toBeUndefined();
                })
            });
        });
    });
});

angular.module('i18n.over.rest', [])
    .factory('iorMessageReader', function () {
        return jasmine.createSpy('reader')
    });