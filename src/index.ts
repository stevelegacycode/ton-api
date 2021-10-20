import { gql, ApolloServer } from "apollo-server";
import {
  ApolloServerPluginLandingPageGraphQLPlayground
} from "apollo-server-core";
import { TonClient } from 'ton';

const client = new TonClient({ endpoint: 'https://ton-api.tonwhales.com/jsonRPC' })

const typeDefs = gql`
  
  type Block {
    id: ID!
    seq: Int!
    shards: [Shard!]!
  }

  type Shard {
    id: ID!
    seq: Int!
    workchain: Int!
    shard: String!
    transactions: [Transaction!]!
  }

  type Transaction {
    id: ID!
    lt: String!
    hash: String!
    address: String!
  }

  type Query {
    block(seq: Int!): Block
  }
`;

const resolvers = {
  Block: {
    id: (src: any) => 'block:' + src.seq
  },
  Shard: {
    id: (src: any) => 'shard:' + src.workchain + ':' + src.shard + ':' + src.seqno,
    seq: (src: any) => src.seqno,
    transactions: async (src: any) => {
      // No transactions in non-initied chain
      if (src.seqno <= 0) {
        return [];
      }
      let res = await client.getShardTransactions(src.workchain, src.seqno, src.shard);
      return res.map((v) => ({
        address: v.account.toFriendly(),
        lt: v.lt,
        hash: v.hash
      }))
    }
  },
  Transaction: {
    id: (src: any) => 'tx:' + src.lt + ':' + src.hash + ':' + src.address,
  },
  Query: {
    block: async (_: any, args: { seq: number }) => {
      let mc = await client.getMasterchainInfo();
      let shards = await client.getWorkchainShards(args.seq);
      shards.unshift({ workchain: -1, shard: mc.shard, seqno: args.seq });
      return {
        seq: args.seq,
        shards
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]
});

server.listen(3000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});