"use client";

import Script from "next/script";

export default function BuyMeACoffeeWidget() {
  return (
    <Script
      src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
      strategy="afterInteractive"
      data-name="BMC-Widget"
      data-cfasync="false"
      data-id="oskarkraemer"
      data-description="Support me on Buy me a coffee!"
      data-message="Hey 😊 | Consider donating to keep the servers running!"
      data-color="#FF813F"
      data-position="Right"
      data-x_margin="18"
      data-y_margin="18"
      onLoad={() => {
        // Trigger the initialization function that the script listens for
        const evt = document.createEvent("Event");
        evt.initEvent("DOMContentLoaded", false, false);
        window.dispatchEvent(evt);
      }}
    />
  );
}
