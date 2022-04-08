let roomList = ["Général", "Autre"];

const channelsListFunction = (io: any, socket: any, channelToFind: any) => {
	if (channelToFind) {
		const channelsFound = roomList.filter(
			(room) => room.indexOf(channelToFind) >= 0
		);
		if (channelsFound.length > 0) {
			io.to(socket.id).emit("channelsList", channelsFound);
		} else {
			io.to(socket.id).emit("noChannelFound");
		}
	} else {
		io.to(socket.id).emit("channelsList", roomList);
	}
};

const joinRoomFunction = (io: any, socket: any, roomName: any) => {
	socket.join(roomName);
	socket.data.roomsJoined.push(roomName);
	const reply = {
		author: "ADMIN",
		message: `${socket.data.username} vient de de se connecter à ${roomName}`,
		date: new Date().toLocaleString(),
	};
	io.to(roomName).emit("updateMessages", reply);
	io.to(socket.id).emit("roomChanged", roomName);
};

const leaveRoomFunction = (io: any, socket: any, roomName: any) => {
	socket.leave(roomName);
	socket.data.roomsJoined = socket.data.roomsJoined.filter(
		(room: string) => room !== roomName
	);
	const reply = {
		author: "ADMIN",
		message: `${socket.data.username} vient de de quitter ${roomName}`,
		date: new Date().toLocaleString(),
	};
	io.to(roomName).emit("updateMessages", reply);
	// il se pass quoi quand on a 0 roomjoined ?
	io.to(socket.id).emit("roomChanged", "Général");
};

const createNewRoomFunction = (io: any, socket: any, newRoom: any) => {
	socket.join(newRoom);
	socket.data.roomsJoined.push(newRoom);
	socket.data.roomsCreated.push(newRoom);
	roomList.push(newRoom);
	io.emit("roomList", roomList);
	const reply = {
		author: "ADMIN",
		message: `${socket.data.username} vient de créer le salon ${newRoom}`,
		date: new Date().toLocaleString(),
	};
	io.emit("updateMessages", reply);
	io.to(socket.id).emit("roomChanged", newRoom);
};

// const updateRoomNameFunction = (io: any, socket: any, oldName: any, newName: any) => {
// 	???
// };

const deleteRoomFunction = async (io: any, socket: any, roomName: any) => {
	if (socket.data.roomsCreated && socket.data.roomsCreated.includes(roomName)) {
		const socketsInRoom = await io.in(roomName).fetchSockets();
		const reply = {
			author: "ADMIN",
			message: `Le salon ${roomName} vient d'être supprimé`,
			date: new Date().toLocaleString(),
		};
		socketsInRoom.map((socket: any) => {
			socket.data.roomsJoined = socket.data.roomsJoined.filter(
				(room: string) => room !== roomName
			);
			io.to(socket.id).emit("updateMessages", reply);
			io.to(socket.id).emit("roomChanged", "Général");
		});

		io.socketsLeave("roomName");
		roomList = roomList.filter((room) => {
			room !== roomName;
		});
		io.emit("roomList", roomList);
	} else {
		const reply = {
			author: "ADMIN",
			message: `${roomName} ne vous appartient pas, vous ne pouvez la supprimer`,
			date: new Date().toLocaleString(),
		};
		io.to(socket.id).emit("updateMessages", reply);
	}
};

export {
	roomList,
	channelsListFunction,
	joinRoomFunction,
	leaveRoomFunction,
	createNewRoomFunction,
	// updateRoomNameFunction,
	deleteRoomFunction,
};
