const NATIVE_HOST = "com.yavadeus.fast_emoji";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "native") {
    console.log("[fast-emoji] native request:", message.payload);
    chrome.runtime
      .sendNativeMessage(NATIVE_HOST, message.payload)
      .then((response) => {
        console.log("[fast-emoji] native response:", response);
        sendResponse(response);
      })
      .catch((err) => {
        console.error("[fast-emoji] native error:", err);
        sendResponse({ error: "native host unavailable" });
      });
    return true;
  }
});
