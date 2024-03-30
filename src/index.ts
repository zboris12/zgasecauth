import { u8arrToBase64url, base64urlToU8arr, base64ToU8arr } from "./bytesutil";
import { StatusCodes } from "./httpconst";

interface Env {
	DEBUG: string;
	DB_AUTH: KVNamespace;
	GET_DAT: string;
	RUN_TEST: string;
	AUTH_ENCKEY: string;
	HMAC_KEY: string;
	ADMIN_TOKEN: string;
}

async function cryptData(b64key: string, data: string, encrypt?: boolean): Promise<string> {
	const ivlen = 16;
	let keydat = base64ToU8arr(b64key);
	let aes = {
		"name": "AES-CTR",
		"counter": keydat.subarray(0, ivlen),
		"length": 64,
	};
	let keyhash = await crypto.subtle.digest("SHA-256", keydat.subarray(ivlen));
	let u8key = new Uint8Array(keyhash);
	let cptkey = await crypto.subtle.importKey("raw", u8key, aes["name"], false, [encrypt ? "encrypt" : "decrypt"]);
	let dataIn: Uint8Array | null = null;
	let dataOut: ArrayBuffer | null = null;
	if (encrypt) {
		dataIn = new TextEncoder().encode(data);
		dataOut = await crypto.subtle.encrypt(aes, cptkey, dataIn);
		return u8arrToBase64url(new Uint8Array(dataOut));
	} else {
		dataIn = base64urlToU8arr(data);
		dataOut = await crypto.subtle.decrypt(aes, cptkey, dataIn);
		return new TextDecoder().decode(dataOut);
	}
}

async function hmac(hkey: string, data: string): Promise<string> {
	let algorithm = {
		name: "HMAC",
		hash: "SHA-256",
	};
	let u8key = base64ToU8arr(hkey);
	let cptkey = await crypto.subtle.importKey("raw", u8key, algorithm, false, ["sign"]);
	let u8data = new TextEncoder().encode(data);
	let dataOut = await crypto.subtle.sign(algorithm.name, cptkey, u8data);
	return u8arrToBase64url(new Uint8Array(dataOut));
}

abstract class Auth {
	private DEBUG: boolean;
	private req: Request;
	private fields: FormData | null;
	protected env: Env;
	protected test: boolean;
	public constructor(req: Request, env: Env) {
		this.DEBUG = (env.DEBUG == "true");
		this.req = req;
		this.env = env;
		this.fields = null;
		this.test = false;
	}
	public async run(): Promise<Response> {
		this.fields = await this.req.formData();
		let resp: Response | null | void = null;
		this.test = (this.env.RUN_TEST == this.get("action"));
		if (this.test || this.extraCheck()) {
			let id = this.test ? "test" : this.get("otpid");
			if (id) {
				id = "auth_" + await hmac(this.env.HMAC_KEY, id);
				this.logdebug({ id });
				let errmsg: any = null;
				resp = await this.doProcess(id).catch(err => {
					errmsg = err;
				});
				if (!resp) {
					resp = new Response(errmsg, StatusCodes.INTERNAL_SERVER_ERROR);
				}
			} else {
				resp = new Response(null, StatusCodes.BAD_REQUEST);
			}
		} else {
			return new Response(null, StatusCodes.NOT_FOUND);
		}
		return resp;
	}
	protected logdebug(...params: any[]): void {
		if (this.DEBUG) {
			console.log(...params);
		}
	}
	protected get(nm: string): string | null {
		return this.fields?.get(nm) as (string | null);
	}
	private async doProcess(id: string): Promise<Response> {
		let oldval = await this.env.DB_AUTH.get<string>(id);
		return await this.process(id, oldval);
	}
	protected abstract extraCheck(): boolean;
	protected abstract process(id: string, oldval: string | null): Promise<Response>;
}

abstract class AuthAdmin extends Auth {
	protected extraCheck(): boolean {
		if (this.env.ADMIN_TOKEN && this.env.ADMIN_TOKEN == this.get("adtk")) {
			return true;
		} else {
			return false;
		}
	}
}

class AuthPut extends AuthAdmin {
	protected async process(id: string, oldval: string | null): Promise<Response> {
		let val = this.get("value");
		if (!val) {
			return new Response(null, StatusCodes.BAD_REQUEST);
		}
		if (oldval) {
			return new Response(null, StatusCodes.CONFLICT);
		}

		let encval = await cryptData(this.env.AUTH_ENCKEY, val, true);
		this.logdebug({ encval });
		await this.env.DB_AUTH.put(id, encval);
		return new Response("Data saved.", StatusCodes.OK);
	}
}

class AuthGet extends Auth {
	protected extraCheck(): boolean {
		return (this.get("action") == this.env.GET_DAT);
	}
	protected async process(id: string, oldval: string | null): Promise<Response> {
		if (oldval) {
			let val = await cryptData(this.env.AUTH_ENCKEY, oldval);
			return new Response(val, StatusCodes.OK);
		} else {
			return new Response(null, StatusCodes.BAD_REQUEST);
		}
	}
}

class AuthDelete extends AuthAdmin {
	protected async process(id: string, oldval: string | null): Promise<Response> {
		if (!oldval) {
			return new Response(null, StatusCodes.NO_CONTENT);
		}

		await this.env.DB_AUTH.delete(id);
		return new Response("Data deleted.", StatusCodes.OK);
	}
}

export default {
	async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		let resp: Response | null = null;
		let auth: Auth | null = null;
		switch (req.method) {
			case "PUT":
				auth = new AuthPut(req, env);
				break;
			case "POST":
				auth = new AuthGet(req, env);
				break;
			case "DELETE":
				auth = new AuthDelete(req, env);
				break;
		}
		if (auth) {
			resp = await auth.run();
		} else {
			resp = new Response(null, StatusCodes.METHOD_NOT_ALLOWED);
		}
		return resp;
	},
};
