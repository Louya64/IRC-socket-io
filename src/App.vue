<template>
	<div class="flex bg-slate-400">
		<div class="w-1/5 h-screen bg-slate-300">
			<form action="" class="w-3/4 mx-auto mt-60">
				<div class="my-10">
					<label for="username">Pseudo</label><br />
					<input class="w-full p-2 mt-2" type="text" v-model="username" />
				</div>
				<div class="my-10">
					<label for="roomsList">Rejoindre un salon</label><br />
					<select class="w-full p-2 mt-2" id="roomsList" v-model="roomSelected">
						<option v-for="room in rooms" :value="room">
							{{ room }}
						</option>
					</select>
				</div>
				<div class="text-center">
					<button
						class="px-5 py-2 rounded-md bg-cyan-600 text-white"
						@click="userConnectToRoom"
					>
						Se connecter
					</button>
				</div>
			</form>
		</div>
		<DefaultRoom
			v-if="userConnected"
			:roomName="roomSelected"
			:username="username"
			:socket="socket"
		/>
	</div>
</template>

<script setup lang="ts">
import { io } from "socket.io-client";
import { ref } from "vue";
import DefaultRoom from "./views/DefaultRoom.vue";

const socket = io("http://localhost:8080");
const username = ref("");
const rooms = ref([]);
const roomSelected = ref("");
const userConnected = ref(false);

socket.on("connect", () => {
	roomSelected.value = rooms.value[0];
});

const userConnectToRoom = (e: Event) => {
	e.preventDefault();
	if (username.value !== "") {
		socket.emit("userConnectToRoom", {
			username: username.value,
			roomSelected: roomSelected.value,
		});
		userConnected.value = true;
	}
};

socket.on("userNameUpdated", (newName) => {
	username.value = newName;
});

socket.on("roomList", (roomList) => {
	rooms.value = roomList;
	roomSelected.value = rooms.value[rooms.value.length - 1];
});

socket.on("logoutOk", () => {
	username.value = "";
	userConnected.value = false;
	roomSelected.value = rooms.value[0];
});
</script>
