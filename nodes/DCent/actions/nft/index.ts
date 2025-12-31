/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions } from 'n8n-workflow';
import { DCentConnectionManager } from '../../transport/connectionManager';

export async function execute(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
): Promise<Record<string, unknown>> {
  const connectionManager = DCentConnectionManager.getInstance();

  switch (operation) {
    case 'getOwned': {
      const ownerAddress = this.getNodeParameter('ownerAddress', itemIndex) as string;
      const chain = this.getNodeParameter('chain', itemIndex, 'ethereum') as string;
      
      const nfts = await connectionManager.sendCommand<{
        nfts: Array<{
          contractAddress: string;
          tokenId: string;
          name: string;
          metadata?: Record<string, unknown>;
        }>;
      }>('getOwnedNfts', { ownerAddress, chain });
      return nfts;
    }

    case 'transfer': {
      const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
      const tokenId = this.getNodeParameter('tokenId', itemIndex) as string;
      const to = this.getNodeParameter('toAddress', itemIndex) as string;
      const chain = this.getNodeParameter('chain', itemIndex, 'ethereum') as string;
      
      const result = await connectionManager.sendCommand<{
        txHash: string;
        signedTx: string;
      }>('transferNft', { contractAddress, tokenId, to, chain });
      return result;
    }

    case 'approve': {
      const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
      const tokenId = this.getNodeParameter('tokenId', itemIndex) as string;
      const spender = this.getNodeParameter('spender', itemIndex) as string;
      const chain = this.getNodeParameter('chain', itemIndex, 'ethereum') as string;
      
      const result = await connectionManager.sendCommand<{
        txHash: string;
        signedTx: string;
      }>('approveNft', { contractAddress, tokenId, spender, chain });
      return result;
    }

    case 'setApprovalForAll': {
      const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
      const operator = this.getNodeParameter('operator', itemIndex) as string;
      const approved = this.getNodeParameter('approved', itemIndex, true) as boolean;
      const chain = this.getNodeParameter('chain', itemIndex, 'ethereum') as string;
      
      const result = await connectionManager.sendCommand<{
        txHash: string;
        signedTx: string;
      }>('setApprovalForAllNft', { contractAddress, operator, approved, chain });
      return result;
    }

    case 'getMetadata': {
      const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
      const tokenId = this.getNodeParameter('tokenId', itemIndex) as string;
      const chain = this.getNodeParameter('chain', itemIndex, 'ethereum') as string;
      
      const metadata = await connectionManager.sendCommand<{
        name: string;
        description: string;
        image: string;
        attributes: Array<{ trait_type: string; value: string }>;
      }>('getNftMetadata', { contractAddress, tokenId, chain });
      return metadata;
    }

    case 'signListing': {
      const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
      const tokenId = this.getNodeParameter('tokenId', itemIndex) as string;
      const price = this.getNodeParameter('price', itemIndex) as string;
      const marketplace = this.getNodeParameter('marketplace', itemIndex) as string;
      const chain = this.getNodeParameter('chain', itemIndex, 'ethereum') as string;
      
      const listing = await connectionManager.sendCommand<{
        signature: string;
        order: Record<string, unknown>;
      }>('signNftListing', { contractAddress, tokenId, price, marketplace, chain });
      return listing;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
