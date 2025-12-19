import { DurableObject } from "cloudflare:workers";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/**
 * Welcome to Cloudflare Workers! This is your first Durable Objects application.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your Durable Object in action
 * - Run `npm run deploy` to publish your application
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */

/** A Durable Object's behavior is defined in an exported Javascript class */
export class MyDurableObject extends DurableObject<Env> {
	/**
	 * The constructor is invoked once upon creation of the Durable Object, i.e. the first call to
	 * 	`DurableObjectStub::get` for a given identifier (no-op constructors can be omitted)
	 *
	 * @param ctx - The interface for interacting with Durable Object state
	 * @param env - The interface to reference bindings declared in wrangler.jsonc
	 */
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}

	/**
	 * The Durable Object exposes an RPC method sayHello which will be invoked when a Durable
	 *  Object instance receives a request from a Worker via the same method invocation on the stub
	 *
	 * @param name - The name provided to a Durable Object instance from a Worker
	 * @returns The greeting to be sent back to the Worker
	 */
	async sayHello(name: string): Promise<string> {
		return `Hello, ${name}!`;
	}
}

export class Counter extends DurableObject<Env> {
	async getCounterValue(): Promise<number> {
		let value = (await this.ctx.storage.get<number>("value")) || 0;
		return value;
	}

	async increment(amount: number = 1): Promise<number> {
		let value: number = (await this.ctx.storage.get<number>("value")) || 0;
		value += amount;

		await this.ctx.storage.put("value", value);
		return value;
	}

	async decrement(amount: number = 1): Promise<number> {
		let value: number = (await this.ctx.storage.get<number>("value")) || 0;
		value -= amount;

		await this.ctx.storage.put("value", value);
		return value;
	}
}

export class ValueBody {
	constructor(public amount: number) {
		this.amount = amount;
	}

	static fromJson(obj: JsonValue): ValueBody {
		const parsed = obj as Record<string, JsonValue>;
		const amount = typeof parsed?.amount === "number" ? parsed.amount : 0;
		return new ValueBody(amount);
	}
}

export default {
	/**
	 * This is the standard fetch handler for a Cloudflare Worker
	 *
	 * @param request - The request submitted to the Worker from the client
	 * @param env - The interface to reference bindings declared in wrangler.jsonc
	 * @param ctx - The execution context of the Worker
	 * @returns The response to be sent back to the client
	 */
	async fetch(request, env, ctx): Promise<Response> {
		// Create a stub to open a communication channel with the Durable Object
		// instance named "foo".
		//
		// Requests from all Workers to the Durable Object instance named "foo"
		// will go to a single remote Durable Object instance.
		//const stub = env.MY_DURABLE_OBJECT.getByName("foo");

		// Call the `sayHello()` RPC method on the stub to invoke the method on
		// the remote Durable Object instance.
		//const greeting = await stub.sayHello("world");

		// return new Response(count.toString());

		let url = new URL(request.url);
		let method = request.method;

		let name = url.searchParams.get("name");
		if (!name) {
			return new Response(
				"Select a Durable Object to contact by using" +
				" the `name` URL query string parameter, for example, ?name=A",
			);
		}

		let stub = env.COUNTER_DURABLE_OBJECT.getByName(name);

		let amount = 1;

		if (method === "POST") {
			let body = await request.json<JsonValue>();
			let valueBody = ValueBody.fromJson(body);
			amount = valueBody.amount;
		}

		let count = null;
		switch (url.pathname) {
			case "/incr":
				count = await stub.increment(amount);
				break;
			case "/decr":
				count = await stub.decrement(amount);
				break;
			case "/":
				// Serves the current value.
				count = await stub.getCounterValue();
				break;
			default:
				return new Response("Not found", { status: 404 });
		}

		return new Response(`Durable Object '${name}' count: ${count}`);
	},
} satisfies ExportedHandler<Env>;
