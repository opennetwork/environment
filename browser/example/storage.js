import { addEventListener } from "../environment/environment.js";
import { Store } from "../storage/store/store.js";
import { RoutedStore } from "../storage/store/routed.js";
addEventListener("execute", async () => {
    const users = new Store(new Map());
    const items = new Store(new Map());
    await users.set("users:1", {
        name: "Test User 1"
    });
    await users.set("users:2", {
        name: "Test User 2"
    });
    await items.set("items:1", {
        name: "Test Item 1",
        ownedBy: "users:1"
    });
    await items.set("items:2", {
        name: "Test Item 2",
        ownedBy: "users:2"
    });
    const stores = { items, users };
    const item1 = await items.get("items:1");
    const routed = new RoutedStore(key => {
        const [prefix] = `${key}`.split(":");
        assertStorePrefix(prefix);
        return stores[prefix];
        function assertStorePrefix(value) {
            if (!(value in stores)) {
                throw new Error("Unexpected prefix");
            }
        }
    });
    const item1Routed = await routed.get("items:1");
    console.log({ item1, item1Routed }, item1 === item1Routed);
    console.log({ userItem1: await routed.get(item1.ownedBy) });
});
