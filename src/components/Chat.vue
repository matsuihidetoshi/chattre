<template>
  <div class="chats">
    <div id="chat-field">
      <div v-for="(chat, id) in chats" v-bind:key="id">
        <div v-if="chat.sentiment === 'POSITIVE'">
          <div class="positive">
            <strong class="title">{{ chat.title }}</strong><br/>
            <strong>{{ chat.name }}</strong><br/>
            {{ chat.description }}
          </div>
        </div>
        <div v-else-if="chat.sentiment === 'NEGATIVE'">
          <div class="negative">
            <strong class="title">{{ chat.title }}</strong><br/>
            <strong>{{ chat.name }}</strong><br/>
            {{ chat.description }}
          </div>
        </div>
        <div v-else-if="chat.sentiment === 'MIXED'">
          <div class="mixed">
            <strong class="title">{{ chat.title }}</strong><br/>
            <strong>{{ chat.name }}</strong><br/>
            {{ chat.description }}
          </div>
        </div>
        <div v-else>
          <div class="neutral">
            <strong class="title">{{ chat.title }}</strong><br/>
            <strong>{{ chat.name }}</strong><br/>
            {{ chat.description }}
          </div>
        </div>
      </div>
    </div>
    <div id="chat-form">
      <input v-model="name" name="name" class="form" placeholder="Name"><br/>
      <textarea v-model="description" name="description" class="form" placeholder="Chat"/><br/>
      <button v-on:click="detectSentiment()">Post</button>
      <button v-on:click="reloadChats()" class="reload"><i class="fas fa-redo-alt"></i></button>
    </div>
  </div>
</template>

<script>
import { API, graphqlOperation} from "aws-amplify"
import { listChats, listAdjectives, listNouns } from "../graphql/queries"
import { createChat } from "../graphql/mutations"
import { onCreateChat } from "../graphql/subscriptions"
import _ from 'lodash'
import axios from 'axios'

export default {
  name: 'Chat',
  data () {
    return {
      chats: [],
      name: "",
      description: "",
      botDescription: "",
      adjectives: [],
      nouns: [],
      sentiment: "",
      keyPhrase: "",
      keyPhrases: null,
      negativeBotFirstText: ["どうした？", "大丈夫？", "えぇ？"],
      negativeBotSecondText: ["のことは忘れろ！", "はショックだね…", "か、マジで？"],
      positiveBotFirstText: ["よかったね！", "いいね！", "素敵だね！"]
    }
  },
  mounted: function () {
    this.displayChats()
  },
  methods: {
    detectSentiment: function(){
      if (this.description === "") return
      axios.get('https://bruykc47al.execute-api.ap-northeast-1.amazonaws.com/default/DetectSentiment', {
        params: {
          text: this.description.replace(/\r?\n/g, '')
        }
      }).then(response => {
        this.sentiment = response.data.body.Sentiment
        this.randomWordFromDetectedKeyPhrases()
        this.createChat()
      })
    },
    randomWordFromDetectedKeyPhrases: function() {
      axios.get('https://lxcbs1mty6.execute-api.ap-northeast-1.amazonaws.com/default/DetectKeyPhrases', {
        params: {
          text: this.description.replace(/\r?\n/g, '')
        }
      }).then(response => {
        this.keyPhrases = response.data.body.KeyPhrases
        let random = Math.floor(Math.random() * this.keyPhrases.length)
        this.keyPhrase = this.keyPhrases[random]["Text"]
        this.createBotChat()
      })
    },
    createChat: async function () {
      if ((this.name === "") || (this.description === "")) return
      let title = this.adjectives[Math.floor(Math.random() * this.adjectives.length)].name + this.nouns[Math.floor(Math.random() * this.nouns.length)].name
      const chat = {name: this.name, description: this.description, title: title, sentiment: this.sentiment}
      try {
        const chats = [...this.chats, chat]
        this.chats = chats
        this.description = ""
        await API.graphql(graphqlOperation(createChat, {input: chat}))
      } catch (error) {
        error
      }
    },
    createBotChat: async function () {
      if ((this.sentiment == "NEGATIVE") || (this.sentiment == "POSITIVE")) {
        if (this.sentiment == "NEGATIVE") {
          let firstRandom = Math.floor(Math.random() * this.negativeBotFirstText.length)
          let secondRandom = Math.floor(Math.random() * this.negativeBotSecondText.length)
          this.botDescription = this.negativeBotFirstText[firstRandom] + this.name + "！\n" + this.keyPhrase + this.negativeBotSecondText[secondRandom]
        } else if (this.sentiment == "POSITIVE") {
          let random = Math.floor(Math.random() * this.positiveBotFirstText.length)
          this.botDescription = this.positiveBotFirstText[random] + this.name + "！"
        }
        let title = this.adjectives[Math.floor(Math.random() * this.adjectives.length)].name + this.nouns[Math.floor(Math.random() * this.nouns.length)].name
        const chat = {name: "雑bot", description: this.botDescription, title: title, sentiment: this.sentiment}
        try {
          const chats = [...this.chats, chat]
          this.chats = chats
          this.description = ""
          await API.graphql(graphqlOperation(createChat, {input: chat}))
        } catch (error) {
          error
        }
      }
    },
    reloadChats: function () {
      this.displayChats()
    },
    displayChats: async function () {
      let chats = await API.graphql(graphqlOperation(
        listChats, {limit: 99999}
      ))
      this.chats = _.orderBy(chats.data.listChats.items, 'updatedAt', 'desc').slice(0, 100)
      
      let adjectives = await API.graphql(graphqlOperation(
        listAdjectives, {limit: 99999}
      ))
      this.adjectives = adjectives.data.listAdjectives.items

      let nouns = await API.graphql(graphqlOperation(
        listNouns, {limit: 99999}
      ))
      this.nouns = nouns.data.listNouns.items
      
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
#chat-field > div > div > div {
  display: block;
  padding: 0.5em;
  margin: 0.5em;
  border-radius: 1em;
  overflow-wrap: break-word;
  white-space: pre-line;
}
.positive {
  background-color: #72ece6;
}
.negative {
  background-color: #ff8d9c;
}
.mixed {
  background-color: #f5faae;
}
.neutral {
  background-color: #d1d8e6;
}
.title {
  font-size: 10px;
}
.form {
  width: 84%;
  max-width: 30em;
  font-size: 18px;
  border-radius: 0.5em;
  border: darkgray 1px solid;
  opacity: 0.7;
}
.reload {
  width: 15%;
  margin-left: 1px;
  background-color: #ff8df0
}
input {
  height: 2em;
}
textarea {
  margin-top: 5px;
  height: 5em;
}
button {
  width: 68%;
  max-width: 30em;
  height: 3em;
  margin-top: 5px;
  border-radius: 0.5em;
  border: none;
  background-color: #72ece6;
  font-weight: bold;
}
</style>