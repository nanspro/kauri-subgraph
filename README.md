# kauri-subgraph
Kauri allows developers to contribute and curate technical knowledge about OpenSource projects. This subgraph stores/fetchs all the latest articles from https://kauri.io. 

We have indexed Kauri's `Checkpoint` contract and from it we get ipfsHash of the checkpoint of articles. Using that hash we are fetching all the article's `contentHash` and then we fetch all those articles also.

Subgraph is deployed here https://thegraph.com/explorer/subgraph/nanspro/kauri, you can run queries there and also use the apis in your dapp. There is one demo dapp which can be found here.

## Installation
```
yarn install
yarn codegen
yarn deploy
```

## Example Queries
Get latest 5 checkpoints
``` graphql
{
checkpoints(first: 5) {
    id
    ipfsHash
    merkleRoot
    contentHash
  }
}
```

Here `ipfsHash` stores all the information regarding the checkpoint and will be used later for further deep diving. `contentHash` stores the ipfshash of all the articles present in this checkpoint.


Get latest 5 articles
``` graphql
{
articles(first: 5) {
    id
    ipfsHash
    content
    title
  }
}
```

* `titles`: Title of the article
* `content`: Content of the article
* `author`: Author of the article
* `createdAt`: Timestamp of the article

