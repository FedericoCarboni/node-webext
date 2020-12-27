describe('integration', () => {
  it('should ', (done) => {
    chrome.runtime.sendNativeMessage('myapp', { hello: 1 }, (message) => {
      chai.expect(message.hello).to.equal(1);
      done();
    });
  });
});
