import {
	isWebSocketCloseEvent,
	WebSocket
} from 'https://deno.land/std/ws/mod.ts'





interface Connection {
	name: string,
	ws: WebSocket
}


const connections = new Array<Connection>();
export default async function handleWebSocket(ws: WebSocket): Promise<void>{
	console.log('Websocket Connection established')

	for await (const event of ws) {
		if (typeof event === 'string'){

			const data = JSON.parse(event)

			console.log(event)

			if (data.type  === 'register'){
				handleRegister(ws, connections, data)
			}else if (data.type === 'message'){
				broadcastEvents(ws, event)
			}else if (data.type === 'peer-join'){
				broadcastEvents(ws, event)
			}
			else {
				broadcastEvents(ws, event)
			}
		}

		if (isWebSocketCloseEvent(event)){
			handleClose(ws, connections)
		}
	}
}

function broadcastEvents(ws:WebSocket, event: string){
	for (const {ws:websocket} of connections){
		if (websocket !== ws){
			websocket.send(event)
		}
	}
}
function handleRegister(ws: WebSocket, connections: Connection[], data: {name: string, type: string}){
				connections.push({name: data.name, ws})
				const registered = JSON.stringify({
					type: "registered",
					message:`${data.name}, you are registered`
				})

				ws.send(registered)

				const onlineUsers = JSON.stringify({
					type: 'online',
					message: {users: connections.map(connection => connection.name)}
				})
				ws.send(onlineUsers)

				const joinEvent = JSON.stringify({
					type: 'join',
					message: {name: data.name}
				})
				broadcastEvents(ws, joinEvent)
}

function handleClose(ws:WebSocket, connections: Connection[] ){
			const currentConnection = connections.filter(c => c.ws === ws)
			if (currentConnection.length === 1){
				const leftEvent = JSON.stringify({type: 'left', message: {name: currentConnection[0].name }})
				broadcastEvents(ws, leftEvent)
			}
			connections.splice(connections.indexOf(currentConnection[0]), 1)
}
