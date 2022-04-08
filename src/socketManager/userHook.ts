const userConnectToRoomFunction = (socket: any, infos: any) => {
	socket.data.username = infos.username;
	socket.data.roomsJoined.push(infos.roomSelected);
	socket.join(infos.roomSelected);

	const reply = {
		author: "ADMIN",
		message: `${infos.username} vient de se connecter à ${infos.roomSelected}`,
		date: new Date().toLocaleString(),
	};
	socket.broadcast.emit("updateMessages", reply);
};

const usersListFunction = async (io: any, socket: any, roomName: any) => {
	const socketsInRoom = await io.in(roomName).fetchSockets();
	const usersInRoom = socketsInRoom.map((socket: any) => socket.data.username);
	io.to(socket.id).emit("usersList", usersInRoom);
};

const updateUsernameFunction = async (io: any, socket: any, newName: any) => {
	const reply = {
		author: "ADMIN",
		message: `${socket.data.username} vient de se changer son pseudo en ${newName}`,
		date: new Date().toLocaleString(),
	};
	socket.data.username = newName;
	io.emit("updateMessages", reply);
	io.emit("userNameUpdated", newName);
};

const logoutFunction = async (io: any, socket: any) => {
	const reply = {
		author: "ADMIN",
		message: `${socket.data.username} vient de se déconnecter`,
		date: new Date().toLocaleString(),
	};
	socket.data.roomsJoined.map((room: string) => {
		socket.leave(room);
	});
	io.emit("updateMessages", reply);
	io.to(socket.id).emit("logoutOk");
};

export {
	userConnectToRoomFunction,
	usersListFunction,
	updateUsernameFunction,
	logoutFunction,
};
