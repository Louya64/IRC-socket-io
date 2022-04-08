<template>
	<div id="room" class="w-4/5 p-14 bg-slate-400 mb-24">
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
				autocomplete="off"
				id="messageToAdd"
				class="w-3/4 border-2"
				type="text"
				placeholder="message"
				v-model="messageToAdd"
			/>
			<button @click="addMessage" class="w-1/4 text-left p-4">Envoyer</button>
			<ul class="text-slate-600">
				<li
					v-for="(matchingCommand, index) in matchingCommands"
					:key="index"
					:id="'command' + index"
					class="hover:cursor-pointer hover:text-white focus:text-white"
					@click="validateCommand(matchingCommand)"
					tabindex="0"
				>
					{{ matchingCommand }}
				</li>
			</ul>
		</form>
	</div>
</template>

<script setup lang="ts">
import type { Socket } from "socket.io-client";
import { onMounted, ref, watch, type Ref } from "vue";
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
const writtenHistory: string[] = [];
const wrongCommand = ref(false);
const commands = [
	"/nick",
	"/list",
	"/create",
	"/update",
	"/delete",
	"/join",
	"/part",
	"/users",
	"/msg",
];
let matchingCommands: Ref<string[]> = ref([]);
let firstArrowPreset = true;
let index = 0;

const listenToKeyValue = (e: KeyboardEvent) => {
	// commands
	if (matchingCommands.value.length) {
		e.preventDefault();
		if (e.key === "Enter") {
			validateCommand(matchingCommands.value[index]);
		} else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
			if (firstArrowPreset) {
				if (e.key === "ArrowUp") {
					index = matchingCommands.value.length - 1;
				}
				if (e.key === "ArrowDown") {
					index = 0;
				}
				firstArrowPreset = false;
			} else {
				if (e.key === "ArrowUp") {
					index--;
				}
				if (e.key === "ArrowDown") {
					index++;
				}
			}
			document.getElementById(`command${index}`)?.focus();
		}
	}

	// history
	else {
		if (e.key === "ArrowUp" || e.key === "ArrowDown") {
			if (firstArrowPreset) {
				if (e.key === "ArrowUp") {
					index = writtenHistory.length - 1;
				}
				if (e.key === "ArrowDown") {
					index = 0;
				}
				firstArrowPreset = false;
			} else {
				if (e.key === "ArrowUp") {
					index--;
					if (index === -1) {
						index = writtenHistory.length - 1;
					}
				}
				if (e.key === "ArrowDown") {
					index++;
					if (index === writtenHistory.length) {
						index = 0;
					}
				}
			}
			messageToAdd.value = writtenHistory[index];
		}
	}
};

onMounted(() => {
	document.getElementById("messageToAdd")?.focus();
	window.addEventListener("keydown", listenToKeyValue);
	document.getElementById("messageToAdd")?.addEventListener("focus", () => {
		firstArrowPreset = true;
		window.addEventListener("keydown", listenToKeyValue);
	});
});

watch(messageToAdd, () => {
	if (messageToAdd.value[0] === "/") {
		matchingCommands.value = commands.filter(
			(command) => command.indexOf(messageToAdd.value) === 0
		);
	}
});

const validateCommand = (matchingCommand: string) => {
	console.log(matchingCommand);
	matchingCommands.value = [];
	messageToAdd.value = matchingCommand + " ";
	document.getElementById("messageToAdd")?.focus();
};

const addMessage = (e: Event) => {
	e.preventDefault();

	if (messageToAdd.value !== "") {
		//
		if (writtenHistory.length > 8) {
			writtenHistory.shift();
		}
		writtenHistory.push(messageToAdd.value);

		//
		if (messageToAdd.value[0] === "/") {
			checkCommand();
			return;
		}
		socket.emit("newMessage", {
			room: props.roomName,
			newMessage: messageToAdd.value,
		});
		messageToAdd.value = "";
	}
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
		case "/users":
			socket.emit("usersList", props.roomName);
			break;
		case "/msg":
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
	window.scrollTo(0, document.body.scrollHeight);
});
</script>
