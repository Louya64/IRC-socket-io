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
			<div v-if="wrongCommand" class="text-red-700 text-center">
				Cette commande n'existe pas
			</div>
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
const wrongCommand = ref(false);

const addMessage = (e: Event) => {
	e.preventDefault();
	if (messageToAdd.value[0] === "/") {
		checkCommand();
		return;
	}
	socket.emit("newMessage", {
		room: props.roomName,
		newMessage: messageToAdd.value,
	});
	messageToAdd.value = "";
};

const checkCommand = () => {
	const firstWorld = messageToAdd.value.split(" ")[0];
	const restOfSentence = messageToAdd.value.replace(firstWorld, "").trim();

	switch (firstWorld) {
		case "/nick":
			socket.emit("updateUsername", restOfSentence);
			break;
		case "/list":
			socket.emit("channelsList", restOfSentence);
			break;
		case "/create":
			socket.emit("createNewRoom", restOfSentence);
			break;
		case "/update":
			socket.emit("updateRoomName", restOfSentence);
			break;
		case "/delete":
			socket.emit("deleteRoom", restOfSentence);
			break;
		case "/join":
			socket.emit("joinRoom", restOfSentence);
			break;
		case "/part":
			socket.emit("leaveRoom", restOfSentence);
			break;
		case "/users": //pas de rest -> liste les users du channel
			socket.emit("usersList", props.roomName);
			break;
		case "/msg": //envoit un message privé -> rest contient "nom" puis "message"
			socket.emit("privateMessage", restOfSentence);
			break;
		default:
			wrongCommand.value = true;
	}
	messageToAdd.value = "";
};

socket.on("channelsList", (list) => {
	const mess = {
		author: "ADMIN",
		message: `Liste des salons: ${list.map((room: string) => " " + room)}`,
		date: "",
	};
	messages.value = [...messages.value, mess];
});
socket.on("noChannelFound", () => {
	console.log("pas de channel");
	const mess = {
		author: "ADMIN",
		message: `Il n'y a pas de channel contenant ces caractères`,
		date: "",
	};
	messages.value = [...messages.value, mess];
});

socket.on("usersList", (list) => {
	const mess = {
		author: "ADMIN",
		message: `Liste des membres du salon: ${list.map(
			(user: string) => " " + user
		)}`,
		date: "",
	};
	messages.value = [...messages.value, mess];
});

socket.on("updateMessages", (mess: IMessage) => {
	messages.value = [...messages.value, mess];
});
</script>
