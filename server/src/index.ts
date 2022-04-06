import fastify from "fastify";
import fastifySocketIo from "fastify-socket.io";

const server = fastify();

server.register(fastifySocketIo, {
	cors: { origin: "http://localhost:3000" },
});

server.ready().then(() => {
	server.io.on("connection", (socket) => {
		server.io.emit("roomList", roomList);
		//
		socket.on("userConnectToRoom", (infos) => {
			socket.data.username = infos.username;
			socket.data.roomJoined = infos.roomSelected;
			socket.join(infos.roomSelected);

			const reply = {
				author: "ADMIN",
				message: `${infos.username} vient de se connecter à ${infos.roomSelected}`,
				date: new Date().toLocaleString(),
			};
			socket.broadcast.emit("updateMessages", reply);
		});

		socket.on("newMessage", (newMessage) => {
			const reply = {
				author: socket.data.username,
				message: newMessage,
				date: new Date().toLocaleString(),
			};
			server.io.to(socket.data.roomJoined).emit("updateMessages", reply);
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
			socket.leave(socket.data.roomJoined);
			socket.data.roomJoined = newRoom;
			socket.join(newRoom);
			const reply = {
				author: "ADMIN",
				message: `${socket.data.username} vient de créer le salon ${newRoom}`,
				date: new Date().toLocaleString(),
			};
			server.io.emit("updateMessages", reply);
			roomList.push(newRoom);
			server.io.emit("roomList", roomList);
		});

		socket.on("logout", () => {
			const reply = {
				author: "ADMIN",
				message: `${socket.data.username} vient de se déconnecter`,
				date: new Date().toLocaleString(),
			};
			socket.leave(socket.data.roomJoined);
			server.io.emit("updateMessages", reply);
			server.io.to(socket.id).emit("logoutOk");
		});
	});
});

// interface IMessage {
// 	author: string;
// 	message: string;
// 	date: string;
// }
// let messages: IMessage[] = [];
const roomList = ["Général", "Autre"];

server.listen(8080, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Server listening at ${address}`);
});
