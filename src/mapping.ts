import { BigInt, Bytes, log, JSONValue } from "@graphprotocol/graph-ts"
import {
  Contract,
  ArticlesCheckpointed,
} from "../generated/Contract/Contract"
import { Checkpoint, Article, Attribute } from "../generated/schema"
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
    let leaves = ipfsData.get('articleLeaves')
    
    if (leaves !== null) {
      let articles = leaves.toArray()
    
      for (let i = 0; i < articles.length; i++) {
        log.info("Count is: {}", [i.toString()])
    
        if (articles[i] !== null) {
          let article = articles[i].toObject()
          let articleHash = article.get('contentHash')
          if (articleHash !== null) {
            log.info("Content Hash: {} {}", [i.toString(), articleHash.toString()])
            contentHash.push(articleHash.toString())
          }
        }
      }
    }

    log.info("Bye {}", [ipfsHash])
    entity.contentHash = contentHash //failing here

    for (let i = 0; i < contentHash.length; i++) {
      let data = loadFromIpfs(contentHash[i], tx)
      if (data !== null) {
        let entity2 = new Article(event.transaction.hash.toHex())
        let attribute = new Attribute(event.transaction.hash.toHex())
        log.info("Inside Content Hash {}", [contentHash[i]])
        let title = data.get('title')
        let content = data.get('content')
        let tagArray = data.get('tags').toArray()
        let tags: string[]
        let author = data.get('author').toString()
        author = '0x' + author
        let timestamp = data.get('timestamp')

        for (let i = 0; i < tagArray.length; i++) {
          let tag = tagArray[i]
          if (tag !== null){
            tags.push(tag.toString())
          }
        }

        log.info("Content Title is: {}", [title.toString()])
        // log.info("Content is: {}", [content.toString()])
        log.info("Author is: {}", [author.toString()])
        log.info("Created at: {}", [timestamp.toBigInt().toString()])
        log.info("Tags array: {}", [tagArray[0].toString()])
        log.info("One of the tags is: {}", [tags[0]])

        entity2.content = content.toString()
        entity2.title = title.toString()
        entity2.author = author.toString()
        entity2.createdAt = timestamp.toBigInt()
        entity2.tags = tags

        let attributes = data.get('attributes').toObject()
        let originName = attributes.get('origin_name')
        let originUrl = attributes.get('origin_url')
        let background = attributes.get('background')
        if (originName !== null){
          attribute.originName = originName.toString()
          log.info("Origin Name: {}", [originName.toString()])
        }
        if (originUrl !== null){
          attribute.originUrl = originUrl.toString()
          log.info("Origin Url: {}", [originUrl.toString()])
        }
        if (background !== null){
          attribute.background = background.toString()
          log.info("Background: {}", [background.toString()])
        }
        
        attribute.save()
        entity2.attributes = attribute.id
        entity2.save()
      }
  }

  }

  // entity.ipfsContent = ipfsContent
  entity.save()
}
