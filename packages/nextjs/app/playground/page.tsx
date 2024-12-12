"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import {
  // NextAuthLoginCard
  ChatComponent,
} from "~~/components/cosmic";
import { useFetchChainData, useNetworkColor } from "~~/hooks/scaffold-eth";

const Playground: NextPage = () => {
  const { chain } = useAccount();
  const { totalBlocks } = useFetchChainData();
  const networkColor = useNetworkColor();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Chain Info</span>
          </h1>

          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Chain:</p>
            <p className="my-2 font-medium" style={{ color: networkColor }}>
              {chain?.name}
            </p>
          </div>

          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Total Blocks:</p>
            <p className="my-2 font-medium">{totalBlocks.toString()}</p>
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-lg w-full rounded-3xl">
              <ChatComponent />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Playground;
