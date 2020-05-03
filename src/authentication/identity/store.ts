import {Identity} from "./identity"
import {Store} from "../../storage/store/store"

export interface IdentityStore extends Store<string, Identity> {

}

export class IdentityStore extends Store<string, Identity> {

}
