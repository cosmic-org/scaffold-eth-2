import { useCallback, useEffect, useState } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import { Block, createPublicClient, http } from "viem";

const BLOCKS_PER_PAGE = 1;

export const useFetchChainData = () => {
  const { targetNetwork } = useTargetNetwork();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalBlocks, setTotalBlocks] = useState(0n);
  const [error, setError] = useState<Error | null>(null);

  const fetchChainData = useCallback(async () => {
    setError(null);

    try {
      const publicClient = createPublicClient({
        chain: targetNetwork,
        transport: http(),
      });

      const blockNumber = await publicClient.getBlockNumber();
      setTotalBlocks(blockNumber);

      const startingBlock = blockNumber - BigInt(currentPage * BLOCKS_PER_PAGE);
      const blockNumbersToFetch = Array.from(
        { length: Number(BLOCKS_PER_PAGE < startingBlock + 1n ? BLOCKS_PER_PAGE : startingBlock + 1n) },
        (_, i) => startingBlock - BigInt(i),
      );

      const blocksWithTransactions = blockNumbersToFetch.map(async blockNumber => {
        try {
          return publicClient.getBlock({ blockNumber, includeTransactions: true });
        } catch (err) {
          setError(err instanceof Error ? err : new Error("An error occurred."));
          throw err;
        }
      });
      const fetchedBlocks = await Promise.all(blocksWithTransactions);

      setBlocks(fetchedBlocks);
      console.log(fetchedBlocks);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred."));
    }
  }, [targetNetwork, currentPage]);

  useEffect(() => {
    fetchChainData();
  }, [fetchChainData]);

  return {
    blocks,
    totalBlocks,
    currentPage,
    setCurrentPage,
    error,
  };
};
