import { BigInt, Bytes, log, JSONValue } from "@graphprotocol/graph-ts"
import {
  Contract,
  // RequestFulfilled,
  // ArticleTipped,
  // RequestRefunded,
  // RequestBountyPaidOut,
  // RequestUpdated,
  // RequestCreated,
  // RequestFlagged,
  // RequestUnflagged,
  // RequestReset,
  // ArticleHash,
  ArticlesCheckpointed,
  // CheckpointerAddressAdded,
  // BountyAdded,
  // OwnershipRenounced,
  // OwnershipTransferred
} from "../generated/Contract/Contract"
import { Checkpoint } from "../generated/schema"
import { loadFromIpfs } from "./ipfs"
import { TransactionInfo, State } from "./transaction";
import { asString } from "./util";


export function handleArticlesCheckpointed(event: ArticlesCheckpointed): void {
  let entity = new Checkpoint(event.transaction.hash.toHex())
  let ipfsHash = event.params.checkpointDocumentLocator
  
  entity.ipfsHash = ipfsHash
  entity.merkleRoot = event.params.checkpointRoot

  log.info("IPFS HASH: {}", [ipfsHash])

  let tx: TransactionInfo
  
  tx.blockNumber = event.block.number.toI32()
  tx.timestamp = event.block.timestamp.toI32()
  tx.from = event.transaction.from
  tx.hash = event.transaction.hash
  tx.state.ipfsReqs = 0
  
  let ipfsData = loadFromIpfs(ipfsHash, tx)
  var contentHash: string[]
  let length: number

  log.info("hey {}", [ipfsHash])
  if (ipfsData !== null){
    log.info("Inside IPFS Hash {}", [ipfsHash])
    let articles = ipfsData.get('articleLeaves').toArray()
    
    for (let i = 0; i < articles.length; i++) {
      log.info("Count is: {}", [i.toString()])
      let article = articles[i].toObject()
      let articleHash = article.get('contentHash')
      if (articleHash !== null) {
        log.info("Content Hash: {} {}", [i.toString(), articleHash.toString()])
        length = contentHash.push(articleHash.toString())
      }
    }
    log.info("Length {}", [length.toString()])
    log.info("Bye {}", [ipfsHash])
    // entity.contentHash = contentHash

    for (let i = 0; i < contentHash.length; i++) {
      let data = loadFromIpfs(contentHash[i], tx)
      if (data !== null) {
        log.info("Inside Content Hash {}", [contentHash[i]])
        let title = data.get('title')
        let content = data.get('content')
        let tagArray = data.get('tags').toArray()
        let tag = tagArray[0].toString()
        let author = data.get('author').toString()
        author = '0x' + author
        let timestamp = data.get('timestamp')
        log.info("Content Title is: {}", [title.toString()])
        // log.info("Content is: {}", [content.toString()])
        log.debug("Author is: {}", [author.toString()])
        log.debug("Created at: {}", [timestamp.toBigInt().toString()])
        log.debug("Tags array: {}", [tagArray[0].toString()])
        log.debug("One of the tags is: {}", [tag])
      }
    }

      // let attributes = contentData.get('attributes').toObject()
      // let origin_name = attributes.get('origin_name') 
      // let origin_url = attributes.get('origin_url')
      // let background = attributes.get('background')
      
      // log.debug("Origin Name: {}", [origin_name.toString()])
      // log.debug("Origin Url: {}", [origin_url.toString()])
      // log.debug("Background: {}", [background.toString()])

  }

  // entity.ipfsContent = ipfsContent
  entity.save()
}
