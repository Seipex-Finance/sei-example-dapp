import React, { forwardRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const ConnectButtonWrapper = forwardRef<HTMLDivElement, React.ComponentProps<typeof ConnectButton>>((props, ref) => (
  <div ref={ref}>
    <ConnectButton {...props} />
  </div>
));

ConnectButtonWrapper.displayName = "ConnectButtonWrapper";

export default ConnectButtonWrapper;