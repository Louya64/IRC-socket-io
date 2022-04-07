<template>
	<div class="text-right border-b-2 p-4 mb-20">
		<div
			@mouseenter="() => (displayUserMenu = true)"
			@mouseleave="() => (displayUserMenu = false)"
			class="p-5 flex justify-between relative"
		>
			<h1 class="text-2xl">Bienvenue dans {{ roomName }}</h1>
			<font-awesome-icon icon="user" class="text-2xl" />
			<ul
				v-if="displayUserMenu"
				class="absolute -right-5 top-0 bg-white text-center mt-12 hover:cursor-pointer"
			>
				<li
					class="border-b-2 px-5 py-3"
					@click="() => (displayPseudoInput = true)"
				>
					Modifier le pseudo
					<div v-if="displayPseudoInput">
						<input class="border-2 mr-10" type="text" v-model="username" />
						<button @click="updateUsername">Valider</button>
					</div>
				</li>
				<li
					class="border-b-2 px-5 py-3"
					@click="() => (displayRoomInput = true)"
				>
					Créer un nouveau salon
					<div v-if="displayRoomInput">
						<input class="border-2 mr-10" type="text" v-model="newRoomName" />
						<button @click="createNewRoom">Valider</button>
					</div>
				</li>
				<li class="border-b-2 px-5 py-3">Voir mes salons crées</li>
				<li @click="logout" class="px-5 py-3">Se déconnecter</li>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Socket } from "socket.io-client";
import { ref } from "vue";

interface IProps {
	roomName: string;
	username: string;
	socket: Socket;
}

const props = defineProps<IProps>();
const displayUserMenu = ref(false);
const displayPseudoInput = ref(false);
const displayRoomInput = ref(false);
const username = ref(props.username);
const newRoomName = ref("");
const socket = props.socket;

const updateUsername = () => {
	socket.emit("updateUsername", username.value);
	displayPseudoInput.value = false;
	displayUserMenu.value = false;
};

const createNewRoom = () => {
	socket.emit("createNewRoom", newRoomName.value);
	newRoomName.value = "";
	displayRoomInput.value = false;
	displayUserMenu.value = false;
};

const logout = () => {
	socket.emit("logout");
};
</script>
