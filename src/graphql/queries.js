/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getChat = `query GetChat($id: ID!) {
  getChat(id: $id) {
    id
    name
    description
    title
    updatedAt
  }
}
`;
export const listChats = `query ListChats(
  $filter: ModelChatFilterInput
  $limit: Int
  $nextToken: String
) {
  listChats(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      name
      description
      title
      updatedAt
    }
    nextToken
  }
}
`;
export const getAdjective = `query GetAdjective($id: ID!) {
  getAdjective(id: $id) {
    id
    name
  }
}
`;
export const listAdjectives = `query ListAdjectives(
  $filter: ModelAdjectiveFilterInput
  $limit: Int
  $nextToken: String
) {
  listAdjectives(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      name
    }
    nextToken
  }
}
`;
export const getNoun = `query GetNoun($id: ID!) {
  getNoun(id: $id) {
    id
    name
  }
}
`;
export const listNouns = `query ListNouns(
  $filter: ModelNounFilterInput
  $limit: Int
  $nextToken: String
) {
  listNouns(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      name
    }
    nextToken
  }
}
`;
