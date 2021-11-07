import { addEventListener } from "../environment/environment";
import { Store } from "../storage/store/store";
import { RoutedStore } from "../storage/store/routed";

addEventListener("execute", async () => {

    const users = new Store(new Map());
    const items = new Store(new Map());

    await users.set("example-users:1", {
        name: "Test User 1"
    });
    await users.set("example-users:2", {
        name: "Test User 2"
    });
    await items.set("example-items:1", {
        name: "Test Item 1",
        ownedBy: "example-users:1"
    });
    await items.set("example-items:2", {
        name: "Test Item 2",
        ownedBy: "example-users:2"
    });
    const stores = { 'example-items': items, 'example-users': users };
    const item1 = await items.get("example-items:1");
    const routed = new RoutedStore(
        key => {
            const [prefix] = `${key}`.split(":");
            assertStorePrefix(prefix);
            return stores[prefix];

            function assertStorePrefix(value: string): asserts value is keyof typeof stores {
                if (!(value in stores)) {
                    throw new Error("Unexpected prefix");
                }
            }
        }
    );

    const item1Routed = await routed.get("example-items:1");

    if (item1.name !== item1Routed.name || item1.ownedBy !== item1Routed.ownedBy) {
        throw new Error("Expected routed items to match");
    }

    const user = await routed.get(item1.ownedBy);
    if (!user) {
        throw new Error("Expected to find ownedBy user");
    }

});
