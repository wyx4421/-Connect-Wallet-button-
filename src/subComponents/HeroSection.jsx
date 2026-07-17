import React, { useEffect, useState } from 'react'

const HeroSection = () => {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);

  const shortAddress = (address) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  const getEthValue = (hexBalance) => {
    const wei = BigInt(hexBalance);
    const whole = wei / 10n ** 18n;
    const fraction = wei % 10n ** 18n;
    const decimals = fraction.toString().padStart(18, "0").slice(0, 4);

    return `${whole}.${decimals} ETH`;
  };

  const clearWallet = () => {
    setAccount("");
    setBalance("");
    setLoading(false);
  };

  const getBalance = async (walletAddress) => {
    const hexBalance = await window.ethereum.request({
      method: "eth_getBalance",
      params: [walletAddress, "latest"],
    });

    setBalance(getEthValue(hexBalance));
  };

  const connectAccount = async (walletAddress) => {
    setAccount(walletAddress);
    setLoading(false);
    await getBalance(walletAddress);
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      clearWallet();
      return;
    }

    setLoading(true);

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts.length) {
        clearWallet();
        return;
      }

      await connectAccount(accounts[0]);
    } catch (error) {
      clearWallet();
    }
  };

  useEffect(() => {
    if (!window.ethereum) {
      return;
    }

    const handleAccountsChanged = async (accounts) => {
      if (!accounts.length) {
        clearWallet();
        return;
      }

      try {
        await connectAccount(accounts[0]);
      } catch (error) {
        clearWallet();
      }
    };

    const handleChainChanged = async () => {
      if (!account) {
        return;
      }

      try {
        await getBalance(account);
      } catch (error) {
        clearWallet();
      }
    };

    const handleDisconnect = () => clearWallet();

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    window.ethereum.on("disconnect", handleDisconnect);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
      window.ethereum.removeListener("disconnect", handleDisconnect);
    };
  }, [account]);

  return (
    <section id='hero'>
      <h1>BE OUR GUEST</h1>
      <p>LIVE LIKE A KING IN OUR BEST HOUSES</p>
      <div className="walletConnect">
        {balance && <span className="walletBalance">Balance: {balance}</span>}
        <button type="button" onClick={connectWallet} disabled={loading}>
          {account ? shortAddress(account) : "Connect Wallet"}
        </button>
      </div>
    </section>
  )
}

export default HeroSection
