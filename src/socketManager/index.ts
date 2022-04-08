import { FastifyInstance } from "fastify";
import {
	userConnectToRoomFunction,
	usersListFunction,
	updateUsernameFunction,
	logoutFunction,
} from "./userHook";
import {
	channelsListFunction,
	roomList,
	createNewRoomFunction,
	joinRoomFunction,
	leaveRoomFunction,
	// updateRoomNameFunction,
	deleteRoomFunction,
} from "./channelsHook";
import { newMessageFunction, privateMessageFunction } from "./messagesHook";

export default {
	start: function (io: FastifyInstance["io"]) {
		io.on("connection", function (socket: any) {
			socket.data.roomsCreated = [];
			socket.data.roomsJoined = [];
			io.emit("roomList", roomList);

			// about users
			socket.on("userConnectToRoom", (infos: any) =>
				userConnectToRoomFunction(socket, infos)
			);

			socket.on("usersList", (channelToFind: any) =>
				usersListFunction(io, socket, channelToFind)
			);

			socket.on("updateUsername", (newName: any) => {
				updateUsernameFunction(io, socket, newName);
			});

			socket.on("logout", () => {
				logoutFunction(io, socket);
			});

			// about rooms (= channels)
			socket.on("channelsList", (channelToFind: any) =>
				channelsListFunction(io, socket, channelToFind)
			);

			socket.on("joinRoom", (roomName: any) => {
				joinRoomFunction(io, socket, roomName);
			});

			socket.on("leaveRoom", (roomName: any) => {
				leaveRoomFunction(io, socket, roomName);
			});

			socket.on("createNewRoom", (newRoom: any) => {
				createNewRoomFunction(io, socket, newRoom);
			});

			// 	socket.on("updateRoomName", (oldName, newName) => {
			// 	??updateRoomNameFunction(io, socket, oldName, newName)
			// 	});

			socket.on("deleteRoom", (roomName: any) => {
				deleteRoomFunction(io, socket, roomName);
			});

			//about messages (on channel  and private)
			socket.on("newMessage", ({ room, newMessage }: any) => {
				newMessageFunction(io, socket, room, newMessage);
			});

			socket.on("privateMessage", (recipientAndContent: any) => {
				privateMessageFunction(io, socket, recipientAndContent);
			});
		});
	},
};
