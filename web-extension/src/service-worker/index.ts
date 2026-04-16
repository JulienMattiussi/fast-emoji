const NATIVE_HOST = "com.yavadeus.fast_emoji";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "native") {
    chrome.runtime
      .sendNativeMessage(NATIVE_HOST, message.payload)
      .then((response) => sendResponse(response))
      .catch(() => sendResponse({ error: "native host unavailable" }));
    return true;
  }
});
