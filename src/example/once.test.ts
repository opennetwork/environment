import { dispatchEvent, addEventListener } from "../environment/environment";

addEventListener("test", async () => {

    let called = 0;

    const type = `once.test.${Math.random()}`

    addEventListener(type, () => {
        called += 1;
    }, { once: true });

    await dispatchEvent({
        type
    });

    ok(called === 1);

    await dispatchEvent({
        type
    });

    ok(called === 1);

    await dispatchEvent({
        type
    });

    ok(called === 1);

    function ok(value: unknown, message?: string): asserts value {
        if (!value) throw new Error(message);
    }

});