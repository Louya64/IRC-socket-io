import fastify from "fastify";
import fastifySocketIo from "fastify-socket.io";
import socketConnection from "./socketManager";

const server = fastify();

server.register(fastifySocketIo, {
	cors: { origin: "http://localhost:3000" },
});

server.ready().then(() => {
	socketConnection.start(server.io);
});

server.listen(8080, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Server listening at ${address}`);
});
