import { serve } from "https://deno.land/std/http/server.ts";
import handleWebSocket from './WebSocket/index.ts'
import {
	acceptWebSocket,
	acceptable,
} from 'https://deno.land/std/ws/mod.ts'


async function main () {

	console.log("http://localhost:8080/");

	for await (const req of serve({port: 8080})) {
		if(acceptable(req)){
			const { conn, r: bufReader, w: bufWriter, headers } = req;

			acceptWebSocket({
				conn,
				bufReader,
				bufWriter,
				headers,
			}).then(handleWebSocket);

		}
		else{
			if (req.method === 'GET' && req.url === '/'){
				req.respond({
					headers: new Headers({
						'content-type': 'text/html',
					}),
					body: await Deno.open('./index.html')
				})
			}else{
				req.respond({body:'Wrong place boyo', status:404})
			}
			console.log(req.method, req.url)

		}

	}
}


main()
