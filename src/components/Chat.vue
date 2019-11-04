<template>
  <div class="chats">
    {{test}}
    <div id="chat-field">
      <div v-for="(chat, id) in chats" v-bind:key="id">
        <strong>{{ chat.name }}</strong><br/>{{ chat.description }}
      </div>
    </div>
    <div id="chat-form">
      <input v-model="name" name="name" class="form" placeholder="Name"><br/>
      <textarea v-model="description" name="description" class="form" placeholder="Chat"/><br/>
      <button v-on:click="createChat()">Post</button>
    </div>
  </div>
</template>

<script>
import { API, graphqlOperation} from "aws-amplify"
import { listChats } from "../graphql/queries"
import { createChat } from "../graphql/mutations"
import { onCreateChat } from "../graphql/subscriptions"
import _ from 'lodash'

export default {
  name: 'Chat',
  data () {
    return {
      test: null,
      chats: [],
      name: "",
      description: ""
    }
  },
  mounted: async function () {
    let chats = await API.graphql(graphqlOperation(
      listChats, {limit: 99999}))
    this.chats = _.orderBy(chats.data.listChats.items, 'updatedAt', 'desc').slice(0, 100)
    
    API.graphql(
      graphqlOperation(onCreateChat, {limit: 99999})
    ).subscribe({
      next: (eventData) => {
        const chat = eventData.value.data.onCreateChat
        const chats = [...this.chats.filter(content => {
          return (content.description !== chat.description)
        }), chat]
        this.chats = _.orderBy(chats, 'updatedAt', 'desc').slice(0, 100)
      }
    })
  },
  methods: {
    createChat: async function () {
      if ((this.name === "") || (this.description === "")) return 
      const chat = {name: this.name, description: this.description}
      try {
        const chats = [...this.chats, chat]
        this.chats = chats
        this.description = ""
        await API.graphql(graphqlOperation(createChat, {input: chat}))
      } catch (error) {
        error
      }
    }
  }
}
</script>

<style scoped>
html {
  margin: 0;
  padding: 0;
}
#chat-field {
  height: 380px;
  display: inline-block;
  text-align: center;
  max-width: 20em;
  overflow: scroll;
}
#chat-field > div {
  display: block;
  padding: 0.5em;
  margin: 0.5em;
  background-color: #d1d8e6;
  border-radius: 1em;
  overflow-wrap: break-word;
  white-space: pre-line;
}
.form {
  width: 84%;
  max-width: 30em;
  font-size: 18px;
  border-radius: 0.5em;
  border: darkgray 1px solid;
  opacity: 0.7;
}
input {
  height: 2em;
}
textarea {
  margin-top: 5px;
  height: 5em;
}
button {
  width: 86%;
  max-width: 30em;
  height: 3em;
  margin-top: 5px;
  border-radius: 0.5em;
  background-color: rgb(83, 216, 209);
  font-weight: bold;
}
</style>