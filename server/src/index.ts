import fastify from "fastify";
import fastifySocketIo from "fastify-socket.io";

const server = fastify();

server.register(fastifySocketIo, {
	cors: { origin: "http://localhost:3000" },
});

server.ready().then(() => {
	server.io.on("connection", (socket) => {
		socket.data.roomsCreated = [];
		socket.data.roomsJoined = [];
		server.io.emit("roomList", roomList);

		socket.on("userConnectToRoom", (infos) => {
			socket.data.username = infos.username;
			socket.data.roomsJoined.push(infos.roomSelected);
			socket.join(infos.roomSelected);

			const reply = {
				author: "ADMIN",
				message: `${infos.username} vient de se connecter à ${infos.roomSelected}`,
				date: new Date().toLocaleString(),
			};
			socket.broadcast.emit("updateMessages", reply);
		});

		socket.on("channelsList", (channelToFind) => {
			if (channelToFind) {
				const channelsFound = roomList.filter(
					(room) => room.indexOf(channelToFind) >= 0
				);
				if (channelsFound.length > 0) {
					server.io.to(socket.id).emit("channelsList", channelsFound);
				} else {
					server.io.to(socket.id).emit("noChannelFound");
				}
			} else {
				server.io.to(socket.id).emit("channelsList", roomList);
			}
		});

		socket.on("usersList", async (roomName) => {
			const socketsInRoom = await server.io.in(roomName).fetchSockets();
			const usersInRoom = socketsInRoom.map((socket) => socket.data.username);
			server.io.to(socket.id).emit("usersList", usersInRoom);
		});

		socket.on("newMessage", ({ room, newMessage }) => {
			const reply = {
				author: socket.data.username,
				message: newMessage,
				date: new Date().toLocaleString(),
			};
			server.io.to(room).emit("updateMessages", reply);
		});

		socket.on("privateMessage", async (recipientAndContent) => {
			const recipient = recipientAndContent.split(" ")[0];
			const content = recipientAndContent.replace(recipient, "").trim();

			const socketsInServer = await server.io.fetchSockets();
			const recipientId = socketsInServer.filter(
				(socket) => socket.data.username === recipient
			);
			const reply = {
				author: socket.data.username,
				message: content,
				date: new Date().toLocaleString(),
			};
			socket.to(recipientId[0].id).emit("updateMessages", reply);
		});

		socket.on("updateUsername", (newName) => {
			const reply = {
				author: "ADMIN",
				message: `${socket.data.username} vient de se changer son pseudo en ${newName}`,
				date: new Date().toLocaleString(),
			};
			socket.data.username = newName;
			server.io.emit("updateMessages", reply);
			server.io.emit("userNameUpdated", newName);
		});

		socket.on("createNewRoom", (newRoom) => {
			socket.join(newRoom);
			socket.data.roomsJoined.push(newRoom);
			socket.data.roomsCreated.push(newRoom);
			roomList.push(newRoom);
			server.io.emit("roomList", roomList);
			const reply = {
				author: "ADMIN",
				message: `${socket.data.username} vient de créer le salon ${newRoom}`,
				date: new Date().toLocaleString(),
			};
			server.io.emit("updateMessages", reply);
			server.io.to(socket.id).emit("roomChanged", newRoom);
		});

		socket.on("joinRoom", (roomName) => {
			socket.join(roomName);
			socket.data.roomsJoined.push(roomName);
			const reply = {
				author: "ADMIN",
				message: `${socket.data.username} vient de de se connecter à ${roomName}`,
				date: new Date().toLocaleString(),
			};
			server.io.to(roomName).emit("updateMessages", reply);
			server.io.to(socket.id).emit("roomChanged", roomName);
		});

		socket.on("leaveRoom", (roomName) => {
			socket.leave(roomName);
			socket.data.roomsJoined = socket.data.roomsJoined.filter(
				(room: string) => room !== roomName
			);
			const reply = {
				author: "ADMIN",
				message: `${socket.data.username} vient de de quitter ${roomName}`,
				date: new Date().toLocaleString(),
			};
			server.io.to(roomName).emit("updateMessages", reply);
			// il se pass quoi quand on a 0 roomjoined ?
			server.io.to(socket.id).emit("roomChanged", "Général");
		});

		socket.on("updateRoomName", (newName) => {
			//faut l'ancien nom...
			// if (
			// 	socket.data.roomsCreated &&
			// 	socket.data.roomsCreated.includes(roomName)
			// ) {}
		});

		socket.on("deleteRoom", async (roomName) => {
			if (
				socket.data.roomsCreated &&
				socket.data.roomsCreated.includes(roomName)
			) {
				const socketsInRoom = await server.io.in(roomName).fetchSockets();
				const reply = {
					author: "ADMIN",
					message: `Le salon ${roomName} vient d'être supprimé`,
					date: new Date().toLocaleString(),
				};
				socketsInRoom.map((socket) => {
					socket.data.roomsJoined = socket.data.roomsJoined.filter(
						(room: string) => room !== roomName
					);
					server.io.to(socket.id).emit("updateMessages", reply);
					server.io.to(socket.id).emit("roomChanged", "Général");
				});

				server.io.socketsLeave("roomName");
				roomList = roomList.filter((room) => {
					room !== roomName;
				});
				server.io.emit("roomList", roomList);
			} else {
				const reply = {
					author: "ADMIN",
					message: `${roomName} ne vous appartient pas, vous ne pouvez la supprimer`,
					date: new Date().toLocaleString(),
				};
				server.io.to(socket.id).emit("updateMessages", reply);
			}
		});

		socket.on("logout", () => {
			const reply = {
				author: "ADMIN",
				message: `${socket.data.username} vient de se déconnecter`,
				date: new Date().toLocaleString(),
			};
			socket.data.roomsJoined.map((room: string) => {
				socket.leave(room);
			});
			server.io.emit("updateMessages", reply);
			server.io.to(socket.id).emit("logoutOk");
		});
	});
});

let roomList = ["Général", "Autre"];

server.listen(8080, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Server listening at ${address}`);
});
