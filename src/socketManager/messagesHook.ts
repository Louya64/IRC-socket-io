const newMessageFunction = async (
	io: any,
	socket: any,
	room: any,
	newMessage: any
) => {
	const reply = {
		author: socket.data.username,
		message: newMessage,
		date: new Date().toLocaleString(),
	};
	io.to(room).emit("updateMessages", reply);
};

const privateMessageFunction = async (
	io: any,
	socket: any,
	recipientAndContent: any
) => {
	const recipient = recipientAndContent.split(" ")[0];
	const content = recipientAndContent.replace(recipient, "").trim();

	const socketsInServer = await io.fetchSockets();
	const recipientId = socketsInServer.filter(
		(socket: any) => socket.data.username === recipient
	);
	const reply = {
		author: socket.data.username,
		message: content,
		date: new Date().toLocaleString(),
	};
	socket.to(recipientId[0].id).emit("updateMessages", reply);
};

export { newMessageFunction, privateMessageFunction };
