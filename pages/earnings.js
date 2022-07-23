import { useMoralis, useWeb3Contract } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import networkMapping from "../constants/networkMapping.json"
import { useEffect, useState } from "react"
import { ethers } from "ethers"

export default function Earnings() {
    const { account, isWeb3Enabled } = useMoralis()
    const { chainId } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const { runContractFunction } = useWeb3Contract()
    const [sellerEarnings, setSellerEarnings] = useState("")

    async function getEarnings() {
        const earningsOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "getEarnings",
            params: {
                seller: account,
            },
        }

        const balance = await runContractFunction({
            params: earningsOptions,
            onSuccess: () => console.log("Success"),
            onError: (error) => {
                console.log(error)
            },
        })

        setSellerEarnings(ethers.utils.formatEther(balance))
    }

    async function handleWithdraw() {
        const withdrawOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "withdrawEarnings",
        }

        await runContractFunction({
            params: withdrawOptions,
            onSuccess: () => {
                console.log("Successful withdraw")
            },
            onError: (error) => {
                console.log(error)
            },
        })
    }

    async function updateUI() {
        await getEarnings()
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled, account, sellerEarnings])

    return (
        <div>
            {isWeb3Enabled ? (
                <div className="p-4 text-lg">
                    <div>Account: {account}</div>
                    {sellerEarnings == 0 ? (
                        <div className="w-fit">
                            <div>Earnings: {sellerEarnings} ETH</div>
                            <div
                                className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 my-8 py-2 px-4"
                                role="alert"
                            >
                                <p>No earnings to withdraw.</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div>Earnings: {sellerEarnings} ETH</div>
                            <button
                                className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded my-8"
                                onClick={handleWithdraw}
                            >
                                Withdraw Earnings
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div>"Web3 Currently Not Enabled"</div>
            )}
        </div>
    )
}
