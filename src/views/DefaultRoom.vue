<template>
	<div class="w-4/5 p-14 bg-slate-400">
		<Header :roomName="roomName" :username="username" :socket="socket" />
		<div class="my-4" v-for="message in messages">
			<h2 v-if="message.author !== 'ADMIN'">
				<em class="text-emerald-700">{{ message.author }}</em>
				<span class="text-xs text-emerald-100"> ({{ message.date }})</span> :
			</h2>
			<p v-if="message.author !== 'ADMIN'">"{{ message.message }}"</p>
			<em class="text-orange-700" v-else>{{ message.message }}</em>
		</div>
		<form class="fixed bottom-10 w-4/5">
			<input
				class="w-3/4 border-2"
				type="text"
				placeholder="message"
				v-model="messageToAdd"
			/>
			<button @click="addMessage" class="w-1/4 text-left p-4">Envoyer</button>
		</form>
	</div>
</template>

<script setup lang="ts">
import type { Socket } from "socket.io-client";
import { ref, type Ref } from "vue";
import Header from "../components/Header.vue";

interface IMessage {
	author: string;
	message: string;
	date: string;
}
interface IProps {
	socket: Socket;
	username: string;
	roomName: string;
}

const props = defineProps<IProps>();
const messages: Ref<IMessage[]> = ref([]);
const messageToAdd = ref("");
const socket = props.socket;

const addMessage = (e: Event) => {
	e.preventDefault();
	socket.emit("newMessage", messageToAdd.value);
};

socket.on("updateMessages", (mess: IMessage) => {
	messages.value = [...messages.value, mess];
});
</script>
