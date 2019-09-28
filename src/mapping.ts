import { BigInt, Bytes, log, JSONValue, DataSourceTemplate } from "@graphprotocol/graph-ts"
import {
  Contract,
  ArticlesCheckpointed,
  ArticleHash,
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

  log.info("hey {}", [ipfsHash])
  if (ipfsData !== null){
    log.info("Inside IPFS Hash {}", [ipfsHash])
    let articles = ipfsData.get('articleLeaves').toArray()
    
    let article = articles[0].toObject()
    let articleHash = article.get('contentHash')
    let entity2 = new Article(event.transaction.hash.toHex())
        
    if (articleHash !== null) {
        let attribute = new Attribute(event.transaction.hash.toHex())

        entity2.ipfsHash = articleHash.toString()
        log.info("Content Hash: {}", [articleHash.toString()])

        let data = loadFromIpfs(articleHash.toString(), tx)
        if (data !== null) {
          log.info("Inside Content Hash {}", [articleHash.toString()])
          let title = data.get('title')
          let content = data.get('content')
          let tagArray = data.get('tags').toArray()
          let tags: string[]
          let author = data.get('author').toString()
          
          for (let i = 0; i < tagArray.length; i++) {
            let tag = tagArray[i]
            if (tag !== null){
              tags.push(tag.toString())
            }
          }
          author = '0x' + author
          let timestamp = data.get('timestamp')
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

  entity.save()
}
