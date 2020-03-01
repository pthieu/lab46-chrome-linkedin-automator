chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.windows.create({
    url: chrome.runtime.getURL('index.html'),
    type: 'popup',
    focused: true,
    height: 500,
    width: 500,
  });
});
