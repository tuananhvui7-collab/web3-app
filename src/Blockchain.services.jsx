import Web3 from "web3";
import { setGlobalState, getGlobalState } from "./store";
import abi from "./abis/DominionDAO.json";

const getEthereum = () => (typeof window !== "undefined" ? window.ethereum : null);

if (typeof window !== "undefined") {
  const eth = getEthereum();
  window.web3 = new Web3(eth || Web3.givenProvider || "https://ethereum-sepolia-rpc.publicnode.com");
}

const reportError = (error) => {
  console.error("Web3 Error:", error);
};

const connectWallet = async () => {
  try {
    const ethereum = getEthereum();
    if (!ethereum) return alert("Vui lòng cài đặt tiện ích MetaMask trên trình duyệt!");
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    if (accounts && accounts.length > 0) {
      setGlobalState("connectedAccount", accounts[0].toLowerCase());
      await getInfo();
      await getProposals();
    }
  } catch (error) {
    reportError(error);
  }
};

const isWallectConnected = async () => {
  try {
    const ethereum = getEthereum();
    if (!ethereum) return;
    const accounts = await ethereum.request({ method: "eth_accounts" });

    ethereum.on("chainChanged", () => {
      window.location.reload();
    });

    ethereum.on("accountsChanged", async (newAccounts) => {
      if (newAccounts && newAccounts.length) {
        setGlobalState("connectedAccount", newAccounts[0].toLowerCase());
        await isWallectConnected();
        await getInfo();
        await getProposals();
      } else {
        setGlobalState("connectedAccount", "");
      }
    });

    if (accounts && accounts.length) {
      setGlobalState("connectedAccount", accounts[0].toLowerCase());
    }
  } catch (error) {
    reportError(error);
  }
};

const getEtheriumContract = async () => {
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  if (contractAddress && contractAddress !== "**" && contractAddress.startsWith("0x")) {
    const eth = getEthereum();
    const web3 = window.web3 || new Web3(eth || Web3.givenProvider || "https://ethereum-sepolia-rpc.publicnode.com");
    const contractAbi = abi.abi || abi;
    const contract = new web3.eth.Contract(contractAbi, contractAddress);
    return contract;
  } else {
    return getGlobalState("contract");
  }
};

const performContribute = async (amount) => {
  try {
    const account = getGlobalState("connectedAccount");
    if (!account) return alert("Vui lòng bấm 'Connect Wallet' để kết nối ví MetaMask trước!");
    const contract = await getEtheriumContract();
    if (!contract) return alert("Chưa cấu hình địa chỉ Smart Contract hợp lệ trong file .env!");

    const web3 = window.web3;
    const weiAmount = web3.utils.toWei(amount.toString(), "ether");
    await contract.methods.contribute().send({ from: account, value: weiAmount });
    await getInfo();
    window.location.reload();
  } catch (error) {
    reportError(error);
    alert("Giao dịch thất bại: " + (error?.message || error));
    return error;
  }
};

const getInfo = async () => {
  try {
    const contract = await getEtheriumContract();
    if (!contract) return;
    const connectedAccount = getGlobalState("connectedAccount");

    try {
      const balance = await contract.methods.daoBalance().call();
      setGlobalState("balance", window.web3.utils.fromWei(balance, "ether"));
    } catch (e) {
      console.warn("Could not fetch daoBalance:", e);
    }

    if (connectedAccount) {
      try {
        const isStakeholder = await contract.methods
          .isStakeholder()
          .call({ from: connectedAccount });
        const mybalance = await contract.methods
          .getBalance()
          .call({ from: connectedAccount });

        setGlobalState("mybalance", window.web3.utils.fromWei(mybalance, "ether"));
        setGlobalState("isStakeholder", isStakeholder);
      } catch (e) {
        console.warn("Could not fetch stakeholder info:", e);
      }
    }
  } catch (error) {
    reportError(error);
  }
};

const raiseProposal = async ({ title, description, beneficiary, amount }) => {
  try {
    const account = getGlobalState("connectedAccount");
    if (!account) return alert("Vui lòng kết nối ví MetaMask trước!");
    const contract = await getEtheriumContract();
    if (!contract) return alert("Chưa cấu hình địa chỉ Smart Contract trong file .env!");

    const web3 = window.web3;
    const weiAmount = web3.utils.toWei(amount.toString(), "ether");
    await contract.methods
      .createProposal(title, description, beneficiary, weiAmount)
      .send({ from: account });
    await getProposals();
    window.location.reload();
  } catch (error) {
    reportError(error);
    alert("Tạo đề xuất thất bại: " + (error?.message || error));
    return error;
  }
};

const getProposals = async () => {
  try {
    const contract = await getEtheriumContract();
    if (!contract) return;
    const proposals = await contract.methods.getProposals().call();
    setGlobalState("proposals", structuredProposals(proposals));
  } catch (error) {
    reportError(error);
  }
};

const structuredProposals = (proposals) => {
  if (!proposals || !Array.isArray(proposals)) return [];
  return proposals
    .map((proposal) => ({
      id: proposal.id,
      amount: window.web3.utils.fromWei((proposal.amount || 0).toString(), "ether"),
      title: proposal.title,
      description: proposal.description,
      paid: proposal.paid,
      passed: proposal.passed,
      proposer: proposal.proposer,
      upvotes: Number(proposal.upvotes || 0),
      downvotes: Number(proposal.downvotes || 0),
      beneficiary: proposal.beneficiary,
      executor: proposal.executor,
      duration: proposal.duration,
    }))
    .reverse();
};

const getProposal = async (id) => {
  try {
    const proposals = getGlobalState("proposals");
    if (proposals && proposals.length) {
      const found = proposals.find((proposal) => proposal.id == id);
      if (found) return found;
    }
    const contract = await getEtheriumContract();
    if (contract) {
      const p = await contract.methods.getProposal(id).call();
      return {
        id: p.id,
        amount: window.web3.utils.fromWei((p.amount || 0).toString(), "ether"),
        title: p.title,
        description: p.description,
        paid: p.paid,
        passed: p.passed,
        proposer: p.proposer,
        upvotes: Number(p.upvotes || 0),
        downvotes: Number(p.downvotes || 0),
        beneficiary: p.beneficiary,
        executor: p.executor,
        duration: p.duration,
      };
    }
  } catch (error) {
    reportError(error);
  }
};

const voteOnProposal = async (proposalId, supported) => {
  try {
    const contract = await getEtheriumContract();
    const account = getGlobalState("connectedAccount");
    if (!account) return alert("Vui lòng kết nối ví MetaMask!");
    await contract.methods
      .performVote(proposalId, supported)
      .send({ from: account });
    await getProposals();
    window.location.reload();
  } catch (error) {
    reportError(error);
    alert("Bỏ phiếu thất bại: " + (error?.message || error));
  }
};

const listVoters = async (id) => {
  try {
    const contract = await getEtheriumContract();
    if (!contract) return [];
    const votes = await contract.methods.getVotesOf(id).call();
    return votes || [];
  } catch (error) {
    reportError(error);
    return [];
  }
};

const payoutBeneficiary = async (id) => {
  try {
    const contract = await getEtheriumContract();
    const account = getGlobalState("connectedAccount");
    if (!account) return alert("Vui lòng kết nối ví MetaMask!");
    await contract.methods.payBeneficiary(id).send({ from: account });
    await getProposals();
    window.location.reload();
  } catch (error) {
    reportError(error);
    alert("Thanh toán thất bại: " + (error?.message || error));
  }
};

export {
  isWallectConnected,
  connectWallet,
  performContribute,
  getInfo,
  raiseProposal,
  getProposals,
  getProposal,
  voteOnProposal,
  listVoters,
  payoutBeneficiary,
};
