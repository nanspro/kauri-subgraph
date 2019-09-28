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
* `id`: Transaction Hash
* `ipfsHash`: IPFS Hash of checkpoint document
* `merkleRoot`: Merkle root of tree of all the articles in this checkpoint
* `contentHash` stores the ipfshash of all the articles present in this checkpoint

_Note:`ipfsHash` will be used later for further deep diving_


Get information about latest 5 articles
``` graphql
{
articles(first: 5) {
    id
    ipfsHash
    content
    title
    author
    createdAt
    tags
    attributes
  }
}
```
* `id`: Transaction Hash
* `ipfsHash`: IPFS Hash of arrticle
* `content`: Content of this article
* `title`: Title of the article
* `author`: Ethereum Address of the article's author
* `createdAt`: Timestamp of the article
* `tags`: All the tags this article has
* `Attributes`: ID of some special attributes about this article, not compulsory


Get attributes for an article
``` graphql
{
  attributes(first: 3){
    id
    originName
    originUrl
    background
  }
}
```
* `id`: Transaction Hash
* `originName`: Platform from which this article was generated, ex: medium
* `originUrl`: Url of the source from where this article was originated
* `background`: Url od background image for the article


Get titles/articles of a specific author
``` graphql
{
  { 
    articles(where: {author: '0x...'}) {
      title 
    } 
  }
}
```

* Searches for author and returns titles if match is found.

Get titles/articles which contains a certain tag
``` graphql
{
  { 
    articles(first: 10) { 
      tags
      title
    }
  }
}
```

* Searches for a given tag in articles and then returns title of all where it is matched.
